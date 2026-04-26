# Users Enumeration

L'énumération des utilisateurs Active Directory est une étape fondamentale d'un pentest en environnement Windows. Identifier les comptes valides, leurs attributs, leurs groupes et leurs privilèges permet de cibler les attaques suivantes et de prioriser les vecteurs d'escalade de privilèges.

## Objectifs

- Identifier les utilisateurs valides du domaine
- Collecter les attributs sensibles (description, SPN, flags)
- Identifier les comptes à hauts privilèges
- Détecter les comptes vulnérables (sans pré-auth, avec SPN, sans expiration)
- Constituer une wordlist d'utilisateurs pour les attaques suivantes

## Quick Enumeration

::: code-group
```bash [NetExec]
nxc smb <DC> -u user -p password --users
nxc ldap <DC> -u user -p password --users
```
```bash [Impacket]
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all
```
```bash [Kerbrute sans credentials]
kerbrute userenum -d domain.com --dc <DC> users.txt
```
```bash [LDAP]
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName
```

:::

## Workflow
```
1. Enumération sans credentials (null session / Kerbrute)
2. Enumération avec credentials (LDAP / NetExec)
3. Collecte des attributs sensibles
4. Identification des comptes vulnérables
5. Identification des comptes privilégiés
6. Constitution de la wordlist
7. Alimentation de BloodHound
```

## Enumération sans Credentials

### Kerbrute — Username Enumeration
```bash
# Enumérer les utilisateurs valides via Kerberos
kerbrute userenum -d domain.com --dc <DC> /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt

# Avec liste personnalisée
kerbrute userenum -d domain.com --dc <DC> users.txt

# Sauvegarder les valides
kerbrute userenum -d domain.com --dc <DC> users.txt -o valid_users.txt

# Verbose
kerbrute userenum -d domain.com --dc <DC> users.txt -v
```

### Null Session — RPC
```bash
# Enumération via null session
rpcclient -U "" -N <DC> -c "enumdomusers"

# Avec parsing
rpcclient -U "" -N <DC> -c "enumdomusers" | \
  grep -oP '\[.*?\]' | grep -v "0x"

# RID cycling
for i in $(seq 500 1200); do
  rpcclient -U "" -N <DC> -c "queryuser $i" 2>/dev/null | \
    grep "User Name"
done

# Via Impacket lookupsid
impacket-lookupsid domain.com/anonymous@<DC> -no-pass
```

### Null Session SMB
:::code-group
```bash[NetExec]
# Via NetExec
nxc smb <DC> -u '' -p '' --users
nxc smb <DC> -u 'guest' -p '' --users
``` 
```bash[Enum4linux]
# Via enum4linux
enum4linux -U <DC>
enum4linux -a <DC>
```
:::

### AS-REP Roasting sans credentials
```bash
# Tenter l'AS-REP sur une liste d'utilisateurs
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>

# Sauvegarder les hashes
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC> -outputfile asrep.txt
```

### Nmap
```bash
# Enumération via scripts NSE
nmap -p445 --script smb-enum-users <DC>
nmap -p88 --script krb5-enum-users --script-args krb5-enum-users.realm=domain.com,userdb=users.txt <DC>
```

## Enumération avec Credentials

### Via NetExec
```bash
# SMB
nxc smb <DC> -u user -p password --users

# LDAP
nxc ldap <DC> -u user -p password --users

# Comptes admin (AdminCount=1)
nxc ldap <DC> -u user -p password --admin-count

# Avec hash NTLM
nxc smb <DC> -u user -H NTLMhash --users
```

### Via Impacket
```bash
# Tous les utilisateurs
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all

# Format lisible
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all | column -t

# Extraire uniquement les usernames
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all | awk 'NR>2 {print $1}' > users.txt
```

### Via LDAP
```bash
# Tous les utilisateurs
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" \
  sAMAccountName displayName description memberOf \
  userAccountControl pwdLastSet lastLogon

# Utilisateurs activés uniquement
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" \
  sAMAccountName displayName

# Extraire uniquement les sAMAccountName
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName | \
  grep "sAMAccountName:" | awk '{print $2}' > users.txt
```

### Via RPC
```bash
# Enumération complète
rpcclient -U "user%password" <DC> -c "enumdomusers"

# Info détaillée par RID
rpcclient -U "user%password" <DC> -c "queryuser 0x1f4"

# Lister les RIDs et noms
rpcclient -U "user%password" <DC> << EOF
enumdomusers
EOF
```

## Attributs Sensibles

### Descriptions avec credentials
:::code-group
```bash[Ldapsearch]
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(description=*))" \
  sAMAccountName description
``` 
```bash[NetExec]
# Via NetExec
nxc ldap <DC> -u user -p password --users | grep -i "desc\|pass\|pwd"
```
:::

### Comptes sans expiration de mot de passe
```bash
# userAccountControl flag 65536 = DONT_EXPIRE_PASSWORD
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=65536))" \
  sAMAccountName userAccountControl
```

### Comptes sans pré-authentification Kerberos
:::code-group
```bash[Ldapsearch]
# userAccountControl flag 4194304 = DONT_REQ_PREAUTH
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" \
  sAMAccountName
```
```bash[NetExec]
# Via NetExec
nxc ldap <DC> -u user -p password --asreproast output.txt
```
:::

### Comptes avec SPN (Kerberoastables)
:::code-group
```bash[Ldapsearch]
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(servicePrincipalName=*))" \
  sAMAccountName servicePrincipalName
```
```bash[Impacket]
# Via Impacket
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>
```
```bash[NetExec]
# Via NetExec
nxc ldap <DC> -u user -p password --kerberoasting output.txt
```
:::

### Comptes avec mots de passe stockés en clair (réversible)
```bash
# userAccountControl flag 128 = ENCRYPTED_TEXT_PWD_ALLOWED
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=128))" \
  sAMAccountName
```

### Comptes jamais connectés
```bash
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(lastLogon=0))" \
  sAMAccountName lastLogon pwdLastSet
```

### Comptes inactifs
```bash
# Pas de connexion depuis 90 jours (en timestamp Windows)
# 90 jours = 7776000 secondes = 77760000000000 en filetime
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(lastLogonTimestamp<=<filetime_90days>))" \
  sAMAccountName lastLogonTimestamp
```

## userAccountControl — Flags importants

| Valeur | Signification | Impact pentest |
|---|---|---|
| 512 | Compte normal activé | Standard |
| 514 | Compte désactivé | Inutilisable |
| 544 | Mot de passe non requis | Connexion sans mdp |
| 2048 | Compte inter-domaine | Trust |
| 4096 | Compte ordinateur | Machine account |
| 8192 | Compte DC | Domain Controller |
| 65536 | Mot de passe sans expiration | Cible privilégiée |
| 128 | Chiffrement réversible | Récupération mdp |
| 4194304 | Pas de pré-auth Kerberos | AS-REP Roasting |
| 1048576 | Trusted for delegation | Délégation non contrainte |
```bash
# Calculer le userAccountControl
# Exemple : 66048 = 512 + 65536 = Compte normal + Pas d'expiration
python3 -c "
flags = {
    512: 'Normal Account',
    514: 'Disabled',
    544: 'Passwd Not Required',
    65536: 'Dont Expire Password',
    128: 'Encrypted Text Pwd',
    4194304: 'Dont Req Preauth',
    1048576: 'Trusted For Delegation',
    8388608: 'Password Expired'
}
uac = 66048
for flag, name in flags.items():
    if uac & flag:
        print(f'{flag}: {name}')
"
```

## Comptes Privilégiés

### Domain Admins
:::code-group
```bash[ldapsearch]
# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=com)" \
  sAMAccountName memberOf
```
```bash[rpcclient]
# Via rpcclient
rpcclient -U "user%password" <DC> -c "querygroupmem 0x200"
```
```bash[NetExec]
# Via NetExec
nxc ldap <DC> -u user -p password --groups | grep "Domain Admins"
```
:::

### Enterprise Admins
```bash
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(memberOf=CN=Enterprise Admins,CN=Users,DC=domain,DC=com)" \
  sAMAccountName
```

### Comptes avec AdminCount=1
```bash
# AdminCount=1 signifie que le compte est ou a été membre d'un groupe protégé
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(adminCount=1))" \
  sAMAccountName memberOf

# Via NetExec
nxc ldap <DC> -u user -p password --admin-count
```

### Comptes de service
```bash
# Comptes avec SPN — souvent des comptes de service
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(servicePrincipalName=*))" \
  sAMAccountName servicePrincipalName memberOf description
```

## BloodHound — Requêtes utilisateurs
```
# Tous les utilisateurs Kerberoastables
MATCH (u:User {hasspn:true}) RETURN u

# Utilisateurs AS-REP Roastables
MATCH (u:User {dontreqpreauth:true}) RETURN u

# Utilisateurs Domain Admins
MATCH (u:User)-[:MemberOf*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}) RETURN u

# Utilisateurs avec chemin vers DA
MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}))
WHERE u.name <> g.name RETURN p

# Utilisateurs avec AdminTo sur des machines
MATCH (u:User)-[:AdminTo]->(c:Computer) RETURN u,c

# Kerberoastables avec chemin vers DA
MATCH (u:User {hasspn:true}),
(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}),
p=shortestPath((u)-[*1..]->(g)) RETURN p

# Utilisateurs avec sessions actives sur des machines
MATCH (u:User)-[:HasSession]->(c:Computer) RETURN u,c
```

## Constitution de la Wordlist Utilisateurs
```bash
# Extraire tous les usernames via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName | \
  grep "sAMAccountName:" | \
  awk '{print $2}' | \
  grep -v "^$" > users.txt

# Via Impacket
impacket-GetADUsers domain.com/user:password -dc-ip <DC> -all | \
  awk 'NR>2 {print $1}' > users.txt

# Générer des variantes de noms (OSINT → usernames)
# Formats courants :
# prenom.nom
# p.nom
# prenomn
# pnom
# nom.prenom

python3 -c "
prenom = 'john'
nom = 'doe'
formats = [
    f'{prenom}.{nom}',
    f'{prenom[0]}.{nom}',
    f'{prenom}{nom[0]}',
    f'{prenom}{nom}',
    f'{nom}.{prenom}',
    f'{nom}{prenom[0]}',
    f'{prenom}_{nom}',
]
for f in formats:
    print(f)
"
```

## Enumération via PowerView (Windows)
```powershell
# Importer PowerView
Import-Module .\PowerView.ps1

# Tous les utilisateurs
Get-DomainUser
Get-DomainUser | Select-Object SamAccountName, Description, MemberOf

# Utilisateurs avec SPN
Get-DomainUser -SPN | Select-Object SamAccountName, ServicePrincipalName

# Utilisateurs sans pré-auth
Get-DomainUser -PreauthNotRequired | Select-Object SamAccountName

# Utilisateurs avec mot de passe sans expiration
Get-DomainUser -UACFilter DONT_EXPIRE_PASSWORD | Select-Object SamAccountName

# Comptes AdminCount
Get-DomainUser -AdminCount | Select-Object SamAccountName, MemberOf

# Domain Admins
Get-DomainGroupMember "Domain Admins" | Select-Object MemberName

# Chercher des mots de passe dans les descriptions
Get-DomainUser | Where-Object {$_.Description -ne $null} | \
  Select-Object SamAccountName, Description
```

## Points d'attaque

- Utilisateurs valides énumérables sans credentials (Kerbrute, null session)
- Descriptions contenant des mots de passe en clair
- Comptes sans pré-authentification Kerberos (AS-REP Roasting)
- Comptes de service avec SPN (Kerberoasting)
- Comptes avec mot de passe sans expiration
- Comptes inactifs avec mots de passe anciens et faibles
- AdminCount=1 sur des comptes non surveillés
- Comptes avec chiffrement réversible activé

::: info Tips 
- Kerbrute est la méthode la plus **discrète** pour valider des usernames pas de logs LDAP générés
- Toujours chercher les **descriptions utilisateurs** les admins y laissent souvent des mots de passe temporaires
- Les comptes avec **AdminCount=1** sont des cibles prioritaires ils ont été membres de groupes privilégiés
- Extraire la liste complète des users via LDAP et la conserver elle servira pour le **password spraying** et le **Kerberoasting**
- Les comptes **inactifs** ont souvent des mots de passe anciens et faibles les cibler en priorité pour le spraying
- Corréler les résultats LDAP avec BloodHound pour visualiser immédiatement les **chemins d'attaque**
- Un compte avec description `Password123!` ou `Temp2024` est un jackpot vérifier immédiatement

:::

::: details Checklist

- Utilisateurs valides énumérés sans credentials (Kerbrute)
- Null session testée
- Enumération LDAP complète effectuée
- Descriptions utilisateurs analysées
- Comptes sans pré-auth identifiés (AS-REP Roasting)
- Comptes avec SPN identifiés (Kerberoasting)
- Comptes AdminCount=1 listés
- Domain Admins et groupes privilégiés énumérés
- Comptes inactifs identifiés
- Comptes sans expiration identifiés
- Wordlist utilisateurs constituée
- BloodHound alimenté et analysé

:::

## Ressources

- [HackTricks AD Enumeration](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology)
- [The Hacker Recipes User Enumeration](https://www.thehacker.recipes/ad/recon)
- [Kerbrute GitHub](https://github.com/ropnop/kerbrute)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)
- [PowerView PowerSploit](https://github.com/PowerShellMafia/PowerSploit)

## Notes
```
# Notes terrain
```



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/enumeration/users.md)</span>

</div>