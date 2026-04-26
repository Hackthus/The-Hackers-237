#  DNS Enumeration

DNS (Domain Name System) est le protocole de résolution de noms de domaine en adresses IP. En pentest, il est une source d'information critique permettant de cartographier l'infrastructure cible : sous-domaines, serveurs de messagerie, transferts de zone, enregistrements SPF/DKIM et bien plus. Une mauvaise configuration DNS peut exposer toute l'architecture interne d'un réseau.



##  Objectifs

- Identifier les serveurs DNS (primaire / secondaire)
- Enumérer les enregistrements DNS (A, MX, NS, TXT, CNAME, etc.)
- Tenter un transfert de zone (AXFR)
- Découvrir des sous-domaines
- Identifier des vecteurs d'exploitation (zone transfer, cache poisoning, etc.)



##  Ports

| Port | Service       |
|------|---------------|
| 53   | DNS (UDP/TCP) |



##  Quick Enumeration
```bash
# Serveurs NS
nslookup -type=NS domain.com

# Transfert de zone
dig axfr @<nameserver> domain.com

# Enum sous-domaines
gobuster dns -d domain.com -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt

# Enum avec dnsrecon
dnsrecon -d domain.com -t std

# Enum avec dnsenum
dnsenum domain.com
```



##  Workflow 
```
 1. Identification des serveurs NS
 2. Enumération des enregistrements DNS
 3. Tentative de transfert de zone (AXFR)
 4. Bruteforce sous-domaines
 5. Reverse lookup sur les plages IP
 6. Analyse des enregistrements SPF / DMARC / DKIM
 7. Exploitation des mauvaises configurations
```



##  Nmap

### Scan basique
```bash
nmap -p53 <target>
```

### Détection version
```bash
nmap -p53 -sV <target>
```

### Scripts NSE
```bash
# Bruteforce DNS
nmap -p53 --script dns-brute <target>

# Transfert de zone
nmap -p53 --script dns-zone-transfer --script-args dns-zone-transfer.domain=domain.com <target>

# Enum sous-domaines
nmap -p53 --script dns-srv-enum --script-args dns-srv-enum.domain=domain.com <target>

# Cache snooping
nmap -p53 --script dns-cache-snoop <target>

# Full enum
nmap -p53 --script dns-* <target>
```


##  Enumeration

### Enregistrements de base avec dig
```bash
# Enregistrement A
dig A domain.com @<nameserver>

# Enregistrement MX
dig MX domain.com @<nameserver>

# Enregistrement NS
dig NS domain.com @<nameserver>

# Enregistrement TXT
dig TXT domain.com @<nameserver>

# Enregistrement CNAME
dig CNAME domain.com @<nameserver>

# Tous les enregistrements
dig ANY domain.com @<nameserver>
```

### Transfert de zone (AXFR)
```bash
dig axfr @<nameserver> domain.com
```

### Reverse lookup
```bash
dig -x <IP> @<nameserver>
```

### Avec nslookup
```bash
nslookup domain.com
nslookup -type=MX domain.com
nslookup -type=NS domain.com
nslookup -type=ANY domain.com
```

### Enum avancée avec host
```bash
host -t ns domain.com
host -t mx domain.com
host -t axfr domain.com <nameserver>
```


##  Bruteforce & Discovery

### Gobuster DNS
```bash
gobuster dns -d domain.com -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```

### Ffuf
```bash
ffuf -u http://FUZZ.domain.com -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```

### Amass
```bash
amass enum -d domain.com
amass enum -active -d domain.com
```

### Sublist3r
```bash
sublist3r -d domain.com
```

### Fierce
```bash
fierce --domain domain.com
```


##  Exploitation

### Recherche d'exploits
```bash
searchsploit bind
searchsploit dns
```

### Zone Transfer (AXFR) mauvaise config
```bash
dig axfr @<nameserver> domain.com
host -l domain.com <nameserver>
```

### DNS Cache Poisoning (test)
```bash
nmap -p53 --script dns-cache-snoop --script-args \
  dns-cache-snoop.mode=timed,dns-cache-snoop.domains={google.com} <target>
```

### DNS Spoofing via Responder
```bash
responder -I eth0 -rdw
```

### DNS Rebinding
```bash
# Utiliser des services comme singularity of origin
# https://github.com/nccgroup/singularity
```



##  Post-Exploitation

- Cartographier toute l'infrastructure à partir des enregistrements récupérés
- Identifier des services internes exposés (intranet, admin panels)
- Croiser les sous-domaines trouvés avec des scans de ports
- Chercher des sous-domaines orphelins (subdomain takeover)
```bash
# Subdomain takeover check
subjack -w subdomains.txt -t 100 -timeout 30 -o results.txt -ssl

# Reverse lookup sur une plage IP
for ip in $(seq 1 254); do
  dig -x 192.168.1.$ip @<nameserver> | grep "PTR"
done
```



##  Anonymous Access

### Test transfert de zone sans auth
```bash
dig axfr @<nameserver> domain.com
```

### Test requêtes récursives ouvertes
```bash
dig @<target> google.com
```

### Test open resolver
```bash
nmap -p53 --script dns-recursion <target>
```



##  Points d'attaque

- Transfert de zone AXFR non restreint
- Open resolver (DNS récursif ouvert)
- Cache poisoning
- DNS Spoofing / Hijacking
- Subdomain takeover (CNAME vers service expiré)
- Enregistrements SPF / DMARC absents ou mal configurés
- Informations sensibles dans les enregistrements TXT
- Versions de serveur DNS exposées (BIND, etc.)



::: tip  

- Toujours tenter le transfert de zone en premier `dig axfr`
- Les enregistrements TXT contiennent souvent des infos précieuses (SPF, tokens, etc.)
- Utiliser Amass pour une découverte passive + active des sous-domaines
- Croiser plusieurs sources : DNS brute + OSINT + Certificate Transparency
- Vérifier les CNAMEs qui pointent vers des services cloud expirés (takeover)
- Un open resolver peut être utilisé pour de l'amplification DDoS

:::

::: details  Checklist

- Port 53 ouvert (UDP/TCP)
- Serveurs NS identifiés
- Enregistrements A / MX / TXT / CNAME récupérés
- Transfert de zone AXFR tenté
- Bruteforce sous-domaines effectué
- Reverse lookup effectué
- Open resolver vérifié
- SPF / DMARC / DKIM analysés
- Subdomain takeover vérifié
- Versions DNS identifiées

:::


## 🧾 Notes
```
 # Notes terrain
```


##  Tools

- [Nmap](https://nmap.org/)
- [dig](https://linux.die.net/man/1/dig)
- [nslookup](https://linux.die.net/man/1/nslookup)
- [dnsrecon](https://github.com/darkoperator/dnsrecon)
- [dnsenum](https://github.com/fwaeytens/dnsenum)
- [Gobuster](https://github.com/OJ/gobuster)
- [Amass](https://github.com/owasp-amass/amass)
- [Sublist3r](https://github.com/aboul3la/Sublist3r)
- [Fierce](https://github.com/mschwager/fierce)
- [Subjack](https://github.com/haccer/subjack)



## 📚 Ressources

- [HackTricks DNS Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-dns)
- [PayloadsAllTheThings DNS](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [SecLists DNS Wordlists](https://github.com/danielmiessler/SecLists/tree/master/Discovery/DNS)
- [Amass Documentation](https://github.com/owasp-amass/amass/blob/master/doc/user_guide.md)
- [DNS Dumpster](https://dnsdumpster.com/)
- [Certificate Transparency crt.sh](https://crt.sh/)







<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/dns.md)</span>

</div>