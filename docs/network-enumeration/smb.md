#  SMB Enumeration

SMB (Server Message Block) est un protocole utilisé pour le partage de fichiers, imprimantes et l'authentification dans les environnements Windows et Active Directory. C'est une cible critique en pentest pour l'énumération, le vol de credentials et le mouvement latéral.

##  Objectifs

- Enumérer les shares
- Identifier les utilisateurs
- Tester les credentials
- Trouver des fichiers sensibles


##  Ports

| Port | Service |
|------|---------|
| 139  | NetBIOS |
| 445  | SMB     |


##  Quick Enumeration
::: code-group
```bash [nmap]
nmap -p139,445 <target>
```
```bash [smbmap]
smbmap -H <target>
```
```bash [enum4linux]
enum4linux -a <target>
```
```bash [NetExec]
nxc smb <target>
```
```bash [crackmapexec]
crackmapexec smb <target>
```
:::

##  Workflow 
```
 1. Scan ports
 2. Enum shares
 3. Test anonymous access
 4. Enum users
 5. Test credentials
 6. Dump fichiers
```


##  Nmap

### Scan basique
```bash
nmap -p139,445 <target>
```

### Enum shares & users
```bash
nmap -p445 --script smb-enum-shares,smb-enum-users <target>
```

### Versions SMB
```bash
nmap -p445 --script smb-protocols <target>
```

### Full enum
```bash
nmap -p445 --script smb-enum-* <target>
```


##  SMBMap

### Lister les shares
```bash
smbmap -H <target>
```

### Avec credentials
```bash
smbmap -H <target> -u user -p password
```

### Recursive listing
```bash
smbmap -H <target> -R
```

### Download
```bash
smbmap -H <target> --download share/file.txt
```


##  Enum4linux

### Full enum
```bash
enum4linux -a <target>
```

### Users
```bash
enum4linux -U <target>
```

### Shares
```bash
enum4linux -S <target>
```


##  NetExec (NXC)

::: info
NetExec (`nxc`) est le **successeur moderne de CrackMapExec**.  
Il permet de scanner les services, tester des credentials et effectuer des attaques dans les environnements **Active Directory**.
:::

### Scan
```bash
nxc smb <target>
```

### Auth test
```bash
nxc smb <target> -u user -p password
```

### Shares
```bash
nxc smb <target> --shares
```

### Bruteforce
```bash
nxc smb <target> -u users.txt -p passwords.txt
```


##  CrackMapExec

### Scan
```bash
crackmapexec smb <target>
```

### Auth
```bash
crackmapexec smb <target> -u user -p password
```

### Shares
```bash
crackmapexec smb <target> --shares
```


##  Smbclient

### List shares
```bash
smbclient -L //<target>
```

### Connect
```bash
smbclient //<target>/share
```

### With creds
```bash
smbclient //<target>/share -U user
```


##  Anonymous Access

### List
```bash
smbclient -L //<target> -N
```

### Connect
```bash
smbclient //<target>/share -N
```


##  Points d'attaque

- Shares anonymous
- Credentials exposés
- Password reuse
- SMBv1 activé
- Enumération AD
- Fichiers sensibles

---

::: info Tips
- Toujours tester `-N`
- Chercher `.txt`, `.xml`, `.config`
- Keywords : `password`, `creds`, `backup`
- Croiser plusieurs outils
:::


::: details Checklist
- Port 445 ouvert
- Shares listés
- Anonymous testé
- Users identifiés
- Credentials testés
- Fichiers récupérés
:::

## 🧾 Notes
```bash
# Notes de pentest
```


##  Tools utiles

- [Nmap](https://nmap.org/)
- [SMBMap](https://github.com/ShawnDEvans/smbmap)
- [Enum4linux](https://github.com/CiscoCXSecurity/enum4linux)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec)
- [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html)


## 📚 Ressources

- [Nmap Documentation officielle](https://nmap.org/book/man.html)
- [CrackMapExec GitHub](https://github.com/byt3bl33d3r/CrackMapExec)
- [NetExec GitHub](https://github.com/Pennyw0rth/NetExec)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)
- [HackTricks SMB Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-smb)


<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/smb.md)</span>

</div>