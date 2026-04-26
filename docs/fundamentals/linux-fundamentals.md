# Linux Fundamentals

Les fondamentaux Linux sont indispensables en pentest. La majorité des outils offensifs tournent sur Linux et la plupart des cibles sont des systèmes Linux. Maîtriser la ligne de commande, le système de fichiers et les permissions est une base non négociable.


## Architecture Linux
```
 Hardware
     └── Kernel (gestion matériel, mémoire, processus)
             └── Shell (interface utilisateur bash, zsh, sh)
                     └── Applications (outils, services, programmes)
```

### Distributions courantes en pentest

| Distribution | Usage |
|---|---|
| Kali Linux | Pentest outils préinstallés |
| Parrot OS | Pentest plus léger que Kali |
| BlackArch | Pentest basé Arch Linux |
| Ubuntu / Debian | Serveurs cibles courants |
| CentOS / RHEL | Serveurs entreprise |
| Alpine | Containers Docker |


## Système de Fichiers

### Arborescence FHS (Filesystem Hierarchy Standard)
```
 /
 ├── bin       → Binaires essentiels (ls, cp, mv, cat)
 ├── sbin      → Binaires système (mount, fdisk, iptables)
 ├── etc       → Fichiers de configuration
 ├── home      → Répertoires utilisateurs (/home/user)
 ├── root      → Répertoire root
 ├── var       → Données variables (logs, mail, spool)
 ├── tmp       → Fichiers temporaires (writable par tous)
 ├── usr       → Programmes et données utilisateur
 │   ├── bin   → Binaires utilisateur
 │   ├── lib   → Bibliothèques
 │   └── share → Données partagées
 ├── lib       → Bibliothèques essentielles
 ├── proc      → Système de fichiers virtuel (processus)
 ├── sys       → Système de fichiers virtuel (kernel)
 ├── dev       → Fichiers périphériques
 ├── mnt       → Points de montage temporaires
 ├── media     → Périphériques amovibles
 ├── opt       → Logiciels tiers
 ├── boot      → Fichiers de démarrage
 └── srv       → Données des services
```

### Fichiers importants en pentest
```bash
# Credentials & Users
/etc/passwd         # Utilisateurs du système
/etc/shadow         # Hashes des mots de passe (root requis)
/etc/group          # Groupes
/etc/sudoers        # Droits sudo
/etc/sudoers.d/     # Droits sudo supplémentaires

# Configuration réseau
/etc/hosts          # Résolution DNS locale
/etc/resolv.conf    # Serveurs DNS
/etc/network/interfaces   # Interfaces réseau (Debian)
/etc/netplan/       # Configuration réseau (Ubuntu)

# Services
/etc/ssh/sshd_config      # Configuration SSH
/etc/apache2/apache2.conf # Configuration Apache
/etc/nginx/nginx.conf     # Configuration Nginx
/etc/crontab              # Tâches planifiées système
/etc/cron.d/              # Tâches planifiées supplémentaires

# Logs
/var/log/auth.log   # Authentifications (Debian/Ubuntu)
/var/log/secure     # Authentifications (CentOS/RHEL)
/var/log/syslog     # Logs système
/var/log/apache2/   # Logs Apache
/var/log/nginx/     # Logs Nginx

# Applications web
/var/www/html/      # Racine web Apache
/srv/http/          # Racine web alternative
```



## Navigation & Fichiers

::: code-group
```bash [Navigation]
# Répertoire courant
pwd

# Lister les fichiers
ls
ls -la          # Liste détaillée + fichiers cachés
ls -lh          # Tailles lisibles
ls -lt          # Trié par date
ls -lS          # Trié par taille

# Changer de répertoire
cd /etc
cd ~            # Répertoire home
cd -            # Répertoire précédent
cd ..           # Répertoire parent
```
```bash [Fichiers]
# Créer
touch file.txt
mkdir dir
mkdir -p dir1/dir2/dir3

# Copier / Déplacer
cp source dest
cp -r source/ dest/
mv source dest

# Supprimer
rm file.txt
rm -rf dir/     # Récursif + force

# Liens
ln -s target link_name    # Lien symbolique
ln target link_name       # Lien dur
```
```bash [Lecture]
# Afficher
cat file.txt
less file.txt
more file.txt
head -n 20 file.txt
tail -n 20 file.txt
tail -f /var/log/syslog   # Temps réel

# Rechercher
grep "pattern" file.txt
grep -r "pattern" /etc/
grep -i "pattern" file.txt   # Case insensitive
grep -v "pattern" file.txt   # Inverser

# Compter
wc -l file.txt    # Lignes
wc -w file.txt    # Mots
wc -c file.txt    # Octets
```

:::


## Permissions

### Structure des permissions
```
 -rwxr-xr--  1  user  group  1234  Jan 1  file.txt
 │└──┴──┴──      │      │
 │  │  │  │      │      └── Groupe propriétaire
 │  │  │  │      └───────── Utilisateur propriétaire
 │  │  │  └──────────────── Permissions autres (r--)
 │  │  └─────────────────── Permissions groupe (r-x)
 │  └────────────────────── Permissions user (rwx)
 └───────────────────────── Type (- fichier, d dossier, l lien)
```

### Valeurs des permissions

| Permission | Lettre | Valeur | Signification |
|---|---|---|---|
| Read | r | 4 | Lire le fichier / Lister le dossier |
| Write | w | 2 | Modifier / Créer dans le dossier |
| Execute | x | 1 | Exécuter / Entrer dans le dossier |
| Aucune | - | 0 | Aucun droit |

### chmod
```bash
# Notation symbolique
chmod u+x file.txt      # Ajouter execute au user
chmod g-w file.txt      # Retirer write au groupe
chmod o=r file.txt      # Mettre read seul pour autres
chmod a+x file.txt      # Ajouter execute à tous

# Notation octale
chmod 755 file.txt      # rwxr-xr-x
chmod 644 file.txt      # rw-r--r--
chmod 600 file.txt      # rw-------
chmod 777 file.txt      # rwxrwxrwx (dangereux)
chmod 400 id_rsa        # r-------- (clé SSH)

# Récursif
chmod -R 755 /var/www/
```

### Permissions spéciales

| Permission | Valeur | Effet |
|---|---|---|
| SUID | 4000 | Exécuté avec les droits du propriétaire |
| SGID | 2000 | Exécuté avec les droits du groupe |
| Sticky bit | 1000 | Seul le propriétaire peut supprimer |
```bash
# SUID
chmod u+s file
chmod 4755 file

# SGID
chmod g+s file
chmod 2755 file

# Sticky bit
chmod +t /tmp
chmod 1777 /tmp

# Trouver les fichiers SUID (escalade de privilèges)
find / -perm -4000 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
```

### chown
```bash
# Changer le propriétaire
chown user file.txt
chown user:group file.txt

# Récursif
chown -R user:group /var/www/
```


## Utilisateurs & Groupes
```bash
# Créer un utilisateur
useradd -m user           # Avec répertoire home
useradd -m -s /bin/bash user
adduser user              # Interactif

# Modifier
usermod -aG sudo user     # Ajouter au groupe sudo
usermod -s /bin/bash user # Changer le shell
passwd user               # Changer le mot de passe

# Supprimer
userdel user
userdel -r user           # Avec répertoire home

# Groupes
groupadd groupname
groupdel groupname
usermod -aG groupname user

# Changer d'utilisateur
su user
su - user                 # Avec environnement
sudo su
sudo -u user command
```


## Processus
```bash
# Lister
ps aux
ps aux | grep <name>
pstree
top
htop

# Signaux
kill <pid>              # SIGTERM (15)
kill -9 <pid>           # SIGKILL — force
kill -l                 # Lister les signaux
killall <name>
pkill <pattern>

# Jobs
command &               # Lancer en arrière-plan
Ctrl+Z                  # Suspendre
bg                      # Reprendre en arrière-plan
fg                      # Reprendre au premier plan
jobs                    # Lister les jobs

# Nice / Priorité
nice -n 10 command      # Priorité basse
renice -n 5 -p <pid>    # Modifier la priorité
```


## Réseau
```bash
# Interfaces
ip a
ip link show
ifconfig

# Connexions
ss -tunap
netstat -ano

# Routes
ip route
route -n

# DNS
cat /etc/resolv.conf
resolvectl status

# Firewall
iptables -L
ufw status
nft list ruleset

# SSH
ssh user@<target>
ssh -i id_rsa user@<target>
ssh -p 2222 user@<target>
ssh -L 8080:localhost:80 user@<target>
```


## Services & Systemd
```bash
# Gestion des services
systemctl start <service>
systemctl stop <service>
systemctl restart <service>
systemctl reload <service>
systemctl enable <service>
systemctl disable <service>
systemctl status <service>

# Lister les services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed

# Logs des services
journalctl -u <service>
journalctl -u <service> -f      # Temps réel
journalctl -u <service> --since "1 hour ago"

# Créer un service
cat > /etc/systemd/system/myservice.service << EOF
[Unit]
Description=My Service
After=network.target

[Service]
ExecStart=/usr/bin/myapp
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable myservice
systemctl start myservice
```


## Cron Jobs
```bash
# Syntaxe crontab
# ┌───── minute (0-59)
# │ ┌───── heure (0-23)
# │ │ ┌───── jour du mois (1-31)
# │ │ │ ┌───── mois (1-12)
# │ │ │ │ ┌───── jour de la semaine (0-7, 0 et 7 = dimanche)
# │ │ │ │ │
# * * * * * commande

# Exemples
* * * * *       # Chaque minute
0 * * * *       # Chaque heure
0 0 * * *       # Chaque jour à minuit
0 0 * * 0       # Chaque dimanche à minuit
0 0 1 * *       # Le 1er de chaque mois
*/5 * * * *     # Toutes les 5 minutes

# Gestion
crontab -l              # Lister
crontab -e              # Editer
crontab -r              # Supprimer
crontab -l -u user      # Lister pour un user

# Fichiers cron système
/etc/crontab
/etc/cron.d/
/etc/cron.hourly/
/etc/cron.daily/
/etc/cron.weekly/
/etc/cron.monthly/
```


## Recherche & Filtrage
```bash
# find
find / -name "*.txt" 2>/dev/null
find /home -user user
find / -perm -4000 2>/dev/null      # SUID
find / -writable -type f 2>/dev/null
find / -mmin -10 2>/dev/null        # Modifiés il y a < 10 min
find / -size +10M 2>/dev/null       # > 10 MB
find / -empty 2>/dev/null           # Fichiers vides

# grep
grep "pattern" file
grep -r "pattern" /etc/
grep -i "pattern" file              # Case insensitive
grep -v "pattern" file              # Inverser
grep -n "pattern" file              # Numéros de ligne
grep -c "pattern" file              # Compter
grep -l "pattern" /etc/*            # Fichiers correspondants
grep -E "regex" file                # Extended regex
grep -P "perl_regex" file           # Perl regex

# Combinaison
find / -name "*.conf" 2>/dev/null | xargs grep -l "password"
cat /etc/passwd | grep -v nologin | cut -d: -f1
```


## Pipes & Redirections
```bash
# Redirections
command > file.txt      # Stdout vers fichier (écrase)
command >> file.txt     # Stdout vers fichier (ajoute)
command < file.txt      # Stdin depuis fichier
command 2> error.txt    # Stderr vers fichier
command 2>&1            # Stderr vers Stdout
command &> file.txt     # Stdout + Stderr vers fichier
command 2>/dev/null     # Ignorer Stderr

# Pipes
command1 | command2
cat /etc/passwd | grep root
ps aux | grep nginx | awk '{print $2}'

# Tee stdout + fichier
command | tee file.txt
command | tee -a file.txt   # Ajouter

# Xargs
find / -name "*.txt" | xargs cat
echo "192.168.1.1" | xargs -I {} ping -c 1 {}
```


## Variables & Environnement
```bash
# Variables
VAR="value"
echo $VAR
echo ${VAR}

# Variables d'environnement
env
printenv
echo $PATH
echo $HOME
echo $USER
echo $SHELL

# Modifier le PATH
export PATH=$PATH:/new/path

# Variables spéciales
echo $0     # Nom du script
echo $1     # Premier argument
echo $?     # Code retour dernière commande
echo $$     # PID du shell courant
echo $!     # PID du dernier processus background
echo $#     # Nombre d'arguments
echo $@     # Tous les arguments
```


## Archivage & Compression
```bash
# tar
tar -cvf archive.tar /path/         # Créer
tar -xvf archive.tar                # Extraire
tar -czvf archive.tar.gz /path/     # Créer + gzip
tar -xzvf archive.tar.gz            # Extraire gzip
tar -cjvf archive.tar.bz2 /path/    # Créer + bzip2
tar -xjvf archive.tar.bz2           # Extraire bzip2
tar -tvf archive.tar                # Lister

# gzip / gunzip
gzip file.txt
gunzip file.txt.gz

# zip / unzip
zip archive.zip file1 file2
zip -r archive.zip /path/
unzip archive.zip
unzip archive.zip -d /dest/
```


## Scripting Bash Bases
```bash
#!/bin/bash

# Variables
NAME="World"
echo "Hello $NAME"

# Conditions
if [ "$NAME" == "World" ]; then
    echo "Match"
elif [ "$NAME" == "Linux" ]; then
    echo "Linux"
else
    echo "No match"
fi

# Boucle for
for i in $(seq 1 10); do
    echo $i
done

for file in /etc/*.conf; do
    echo $file
done

# Boucle while
while true; do
    echo "loop"
    sleep 1
done

# Fonctions
function hello() {
    echo "Hello $1"
}
hello "World"

# Arguments
echo "Script : $0"
echo "Arg 1  : $1"
echo "Tous   : $@"

# Code retour
command && echo "Succès" || echo "Echec"
```


## Commandes Utiles
```bash
# Informations système
uname -a                    # Info kernel
cat /etc/os-release         # Version OS
uptime                      # Uptime + charge
df -h                       # Espace disque
du -sh /var/log/            # Taille dossier
free -h                     # RAM
lscpu                       # CPU

# Texte
sort file.txt               # Trier
sort -u file.txt            # Trier + unique
uniq file.txt               # Supprimer doublons
cut -d: -f1 /etc/passwd     # Couper par délimiteur
awk '{print $1}' file.txt   # Imprimer champ
sed 's/old/new/g' file.txt  # Remplacer
tr 'a-z' 'A-Z' < file.txt   # Transformer

# Divers
which python3               # Chemin d'un binaire
type ls                     # Type de commande
alias ll='ls -la'           # Créer un alias
history                     # Historique commandes
!!                          # Répéter dernière commande
!<number>                   # Répéter commande n°
Ctrl+R                      # Rechercher dans l'historique
```


::: info Tips 

- `/tmp` est toujours writable c'est le répertoire de travail par défaut en post-exploitation
- Toujours vérifier `sudo -l` et `find / -perm -4000` en premier lors d'une escalade de privilèges
- `cat /etc/crontab` et les scripts référencés sont souvent des vecteurs d'escalade négligés
- Les fichiers `.bash_history` contiennent fréquemment des credentials en clair
- `2>/dev/null` est indispensable pour filtrer les erreurs de permission lors des recherches
- Maîtriser `awk`, `sed` et `grep` permet de parser rapidement de gros volumes de données
- Connaître la signification de chaque dossier `/etc`, `/var`, `/proc` accélère l'enumération

:::

## Notes
```
 # Notes terrain
```


## Ressources

- [Linux Command Line Cheatsheet](https://cheatography.com/davechild/cheat-sheets/linux-command-line/)
- [HackTricks Linux Privilege Escalation](https://book.hacktricks.xyz/linux-hardening/privilege-escalation)
- [GTFOBins](https://gtfobins.github.io/)
- [ExplainShell](https://explainshell.com/)
- [The Linux Command Line William Shotts](https://linuxcommand.org/tlcl.php)
- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/)





<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/fundamentals/linux.md)</span>

</div>