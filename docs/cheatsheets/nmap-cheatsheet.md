# Nmap Cheatsheet

Référence rapide des commandes Nmap les plus utilisées en pentest.

---

## Syntaxe de base
```bash
nmap [options] <target>
nmap [options] <target1> <target2>
nmap [options] <192.168.1.0/24>
nmap [options] <192.168.1.1-254>
```

## Cibles

| Syntaxe | Description |
|---|---|
| `192.168.1.1` | IP unique |
| `192.168.1.1-254` | Plage d'IPs |
| `192.168.1.0/24` | Subnet CIDR |
| `10.0.0.1,2,3` | IPs multiples |
| `-iL targets.txt` | Liste depuis un fichier |
| `--exclude 192.168.1.1` | Exclure une IP |
| `--excludefile exclude.txt` | Exclure depuis un fichier |


## Types de Scan

::: code-group
```bash [TCP SYN (défaut)]
nmap -sS <target>
```
```bash [TCP Connect]
nmap -sT <target>
```
```bash [UDP]
nmap -sU <target>
```
```bash [TCP + UDP]
nmap -sS -sU <target>
```
```bash [NULL]
nmap -sN <target>
```
```bash [FIN]
nmap -sF <target>
```
```bash [XMAS]
nmap -sX <target>
```
```bash [ACK]
nmap -sA <target>
```

:::


## Ports

| Syntaxe | Description |
|---|---|
| `-p 22` | Port unique |
| `-p 22,80,443` | Ports multiples |
| `-p 1-1024` | Plage de ports |
| `-p-` | Tous les ports (1-65535) |
| `-p U:53,T:80` | UDP + TCP |
| `--top-ports 100` | Top 100 ports |
| `--top-ports 1000` | Top 1000 ports |
| `-F` | Fast top 100 ports |


## Détection

::: code-group
```bash [Version services]
nmap -sV <target>
```
```bash [OS]
nmap -O <target>
```
```bash [Version + OS]
nmap -sV -O <target>
```
```bash [Intensité version]
nmap -sV --version-intensity 9 <target>
```
```bash [Aggressive]
nmap -A <target>
```

:::


## Timing

| Flag | Nom | Description |
|---|---|---|
| `-T0` | Paranoid | Très lent — bypass IDS |
| `-T1` | Sneaky | Lent — discret |
| `-T2` | Polite | Lent — moins de bande passante |
| `-T3` | Normal | Par défaut |
| `-T4` | Aggressive | Rapide — réseau fiable |
| `-T5` | Insane | Très rapide — peut rater des ports |
```bash
nmap -T4 <target>
```


## Scripts NSE

::: code-group
```bash [Catégorie]
nmap --script <category> <target>
```
```bash [Script spécifique]
nmap --script <script-name> <target>
```
```bash [Plusieurs scripts]
nmap --script <script1>,<script2> <target>
```
```bash [Wildcard]
nmap --script smb-* <target>
```
```bash [Default scripts]
nmap -sC <target>
```

:::

### Catégories NSE disponibles

| Catégorie | Description |
|---|---|
| `auth` | Authentification |
| `brute` | Bruteforce |
| `default` | Scripts par défaut |
| `discovery` | Découverte |
| `dos` | Déni de service |
| `exploit` | Exploitation |
| `fuzzer` | Fuzzing |
| `intrusive` | Intrusif |
| `malware` | Détection malware |
| `safe` | Non intrusif |
| `version` | Détection version |
| `vuln` | Vulnérabilités |


## Evasion & Discrétion

::: code-group
```bash [Fragmentation]
nmap -f <target>
```
```bash [Decoy]
nmap -D RND:10 <target>
```
```bash [Spoofing IP source]
nmap -S <spoofed-ip> <target>
```
```bash [Spoofing MAC]
nmap --spoof-mac <mac> <target>
```
```bash [Port source]
nmap --source-port 53 <target>
```
```bash [Délai entre paquets]
nmap --scan-delay 1s <target>
```
```bash [MTU personnalisé]
nmap --mtu 24 <target>
```

:::


## Output

| Flag | Description |
|---|---|
| `-oN output.txt` | Format normal |
| `-oX output.xml` | Format XML |
| `-oG output.grep` | Format grepable |
| `-oA output` | Tous les formats |
| `-v` | Verbose |
| `-vv` | Très verbose |
| `--open` | Afficher uniquement les ports ouverts |
| `--reason` | Raison de l'état du port |


## Commandes Complètes

### Découverte réseau
```bash
# Ping sweep — hôtes actifs
nmap -sn 192.168.1.0/24

# ARP scan (réseau local)
nmap -PR 192.168.1.0/24

# Désactiver le ping
nmap -Pn <target>
```

### Scan rapide
```bash
# Top 1000 ports
nmap -T4 -F <target>

# Top 1000 ports + version
nmap -T4 -sV <target>

# Scan complet rapide
nmap -T4 -A <target>
```

### Scan complet
```bash
# Tous les ports TCP
nmap -p- -T4 <target>

# Tous les ports + version + scripts
nmap -p- -sV -sC -T4 <target>

# Full aggressive
nmap -p- -A -T4 <target>
```

### Scan furtif
```bash
# SYN scan lent
nmap -sS -T1 -p- <target>

# Avec decoy
nmap -sS -T2 -D RND:5 <target>

# Avec fragmentation
nmap -sS -f -T2 <target>
```

### Scan UDP
```bash
# Top ports UDP
nmap -sU --top-ports 100 <target>

# UDP + TCP
nmap -sS -sU -T4 <target>
```

### Scripts par service
```bash
# SMB
nmap -p445 --script smb-enum-shares,smb-enum-users <target>

# HTTP
nmap -p80,443 --script http-enum,http-title <target>

# FTP
nmap -p21 --script ftp-anon,ftp-syst <target>

# SSH
nmap -p22 --script ssh-auth-methods,ssh-hostkey <target>

# DNS
nmap -p53 --script dns-brute,dns-zone-transfer <target>

# LDAP
nmap -p389 --script ldap-rootdse,ldap-search <target>

# Vulnérabilités
nmap --script vuln <target>
```

### Scan pentest complet
```bash
nmap -p- -sV -sC -O -T4 --open -oA scan_results <target>
```


## Interprétation des états de ports

| Etat | Description |
|---|---|
| `open` | Port ouvert — service actif |
| `closed` | Port fermé — accessible mais sans service |
| `filtered` | Filtré — firewall bloque la réponse |
| `unfiltered` | Accessible mais état indéterminé |
| `open/filtered` | Ouvert ou filtré — indéterminé |
| `closed/filtered` | Fermé ou filtré — indéterminé |



::: info Tips

- Toujours commencer par `-sn` pour identifier les hôtes actifs avant de scanner les ports
- Utiliser `-Pn` si les hôtes bloquent les pings ICMP
- `-T4` est le meilleur compromis vitesse / fiabilité en réseau interne
- Sauvegarder les résultats avec `-oA` pour les réutiliser dans les rapports
- Croiser Nmap avec Masscan pour les gros réseaux (Masscan pour la vitesse, Nmap pour les détails)
- `--open` évite le bruit des ports fermés dans les outputs

:::

## Notes
```
 # Notes terrain
```


## 📚 Ressources

- [Nmap Documentation officielle](https://nmap.org/book/man.html)
- [Nmap NSE Scripts](https://nmap.org/nsedoc/)
- [HackTricks Nmap](https://book.hacktricks.xyz/generic-methodologies-and-resources/pentesting-network/nmap-summary-esp)





<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/nmap.md)</span>

</div>