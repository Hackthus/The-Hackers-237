# Web Pentesting

Les applications web sont aujourd'hui la principale surface d'attaque des organisations.  
APIs, portails d'authentification, interfaces d'administration, applications SaaS, chaque composant web expose potentiellement des vecteurs d'exploitation.  
Le web pentesting couvre l'identification et l'exploitation des vulnérabilités dans ces applications.

## Qu'est-ce que le Web Pentesting ?

Le web pentesting est une discipline du test d'intrusion focalisée sur les applications web et leurs composants frontend, backend, APIs, bases de données et infrastructure sous-jacente. L'objectif est d'identifier les failles avant qu'un attaquant réel ne les découvre et les exploite.

### Différence avec le pentest réseau

| Critère | Web Pentesting | Network Pentesting |
|---|---|---|
| Cible | Applications web, APIs | Infrastructure réseau |
| Protocoles | HTTP, HTTPS, WebSocket | TCP/IP, SMB, RDP, etc. |
| Outils | Burp Suite, SQLMap, ffuf | Nmap, Metasploit, NXC |
| Compétences | Dev web, logique applicative | Réseau, protocoles, AD |
| Failles | OWASP Top 10 | CVE, mauvaises configs |

## OWASP Top 10 2025

Le référentiel OWASP Top 10 liste les vulnérabilités web les plus critiques et les plus fréquentes.

| Rang | Catégorie | Description |
|---|---|---|
| A01 | Broken Access Control | Contrôles d'accès insuffisants |
| A02 | Cryptographic Failures | Chiffrement faible ou absent |
| A03 | Injection | SQLi, XSS, Command Injection |
| A04 | Insecure Design | Défauts de conception |
| A05 | Security Misconfiguration | Mauvaises configurations |
| A06 | Vulnerable Components | Composants obsolètes ou vulnérables |
| A07 | Authentication Failures | Authentification défaillante |
| A08 | Software & Data Integrity | Intégrité des données non vérifiée |
| A09 | Logging Failures | Journalisation insuffisante |
| A10 | SSRF | Requêtes forgées côté serveur |

## Surface d'Attaque Web

### Composants à tester
```
 Application Web
     ├── Frontend
     │   ├── JavaScript (logique côté client)
     │   ├── HTML / CSS (injection)
     │   └── Cookies / Storage (session)
     ├── Backend
     │   ├── Langage (PHP, Python, Node.js, Java)
     │   ├── Framework (Laravel, Django, Express)
     │   └── Logique métier
     ├── API
     │   ├── REST
     │   ├── GraphQL
     │   └── SOAP
     ├── Base de données
     │   ├── SQL (MySQL, PostgreSQL, MSSQL)
     │   └── NoSQL (MongoDB, Redis)
     └── Infrastructure
         ├── Serveur web (Apache, Nginx, IIS)
         ├── CDN / WAF
         └── Cloud (AWS, Azure, GCP)
```

### Points d'entrée courants
```
 Paramètres GET / POST
 Headers HTTP (User-Agent, Referer, X-Forwarded-For)
 Cookies et tokens de session
 Fichiers uploadés
 Endpoints API
 Formulaires d'authentification
 Fonctions de recherche
 Paramètres de pagination
 Redirections et callbacks
 WebSockets
```

## Méthodologie Web Pentesting

### Workflow général
```
 1. Reconnaissance & Fingerprinting
    └── Technologies, CMS, WAF, sous-domaines

 2. Enumération
    └── Répertoires, fichiers, endpoints, paramètres

 3. Analyse de la surface d'attaque
    └── Cartographier tous les points d'entrée

 4. Tests d'authentification
    └── Bruteforce, enumération users, session management

 5. Tests d'autorisation
    └── IDOR, BOLA, privilege escalation

 6. Tests d'injection
    └── SQLi, XSS, Command Injection, SSTI, LFI/RFI

 7. Tests de logique métier
    └── Contournement de paiements, conditions de course

 8. Tests API
    └── REST, GraphQL, endpoints non documentés

 9. Exploitation & Preuves
    └── PoC, screenshots, impact démontré

 10. Reporting
     └── Findings, sévérité, recommandations
```

## Outils Essentiels

### Burp Suite

L'outil incontournable du web pentesting proxy HTTP, scanner, intruder, repeater.
```
 Proxy     → Intercepter et modifier les requêtes HTTP
 Repeater  → Rejouer et modifier des requêtes manuellement
 Intruder  → Automatiser des attaques (bruteforce, fuzzing)
 Scanner   → Scanner automatique de vulnérabilités (Pro)
 Decoder   → Encoder / décoder (Base64, URL, HTML, etc.)
 Comparer  → Comparer deux réponses
 Sequencer → Analyser l'entropie des tokens
```

### Outils par catégorie

| Catégorie | Outils |
|---|---|
| Proxy / Interception | Burp Suite, OWASP ZAP, mitmproxy |
| Enumération | gobuster, ffuf, dirsearch, feroxbuster |
| SQLi | sqlmap, ghauri |
| XSS | XSStrike, dalfox |
| Fuzzing | ffuf, wfuzz, Burp Intruder |
| Fingerprinting | whatweb, wappalyzer, wafw00f |
| CMS | wpscan, droopescan, joomscan |
| SSRF | ssrfmap, Burp Collaborator |
| JWT | jwt_tool, hashcat |
| Recon | amass, subfinder, theHarvester |

## Vulnérabilités Couvertes

Cette section documente les techniques d'exploitation des vulnérabilités web les plus courantes en pentest.

| Vulnérabilité | Description | Impact |
|---|---|---|
| SQL Injection | Injection de code SQL | Dump DB, RCE, Auth bypass |
| XSS | Injection de scripts | Vol session, phishing, keylogger |
| LFI / RFI | Inclusion de fichiers | Lecture fichiers, RCE |
| SSRF | Requêtes forgées serveur | Accès services internes |
| Command Injection | Injection de commandes OS | RCE |
| Path Traversal | Navigation hors répertoire | Lecture fichiers sensibles |
| IDOR | Référence directe non sécurisée | Accès données non autorisé |
| File Upload | Upload de fichiers malveillants | RCE, webshell |
| JWT Attacks | Manipulation de tokens | Auth bypass, privilege escalation |
| SSTI | Injection dans les templates | RCE |
| XXE | Injection XML externe | SSRF, LFI, RCE |
| CORS | Mauvaise configuration CORS | Vol de données cross-origin |
| Clickjacking | Superposition d'iframes | Actions non voulues |
| Open Redirect | Redirection non contrôlée | Phishing |

## Environnements de Lab

Pour pratiquer légalement le web pentesting :

| Lab | Description | Lien |
|---|---|---|
| DVWA | Damn Vulnerable Web App | [dvwa.co.uk](https://dvwa.co.uk/) |
| HackTheBox | Machines et challenges web | [hackthebox.com](https://hackthebox.com/) |
| TryHackMe | Parcours guidés web | [tryhackme.com](https://tryhackme.com/) |
| PortSwigger Web Academy | Labs OWASP officiel Burp | [portswigger.net](https://portswigger.net/web-security) |
| OWASP WebGoat | App vulnérable éducative | [owasp.org](https://owasp.org/www-project-webgoat/) |
| PentesterLab | Exercices web progressifs | [pentesterlab.com](https://pentesterlab.com/) |
| VulnHub | VMs vulnérables | [vulnhub.com](https://vulnhub.com/) |

## Checklist Reconnaissance Web

::: details Checklist

- Technologies identifiées (whatweb, wappalyzer)
- WAF détecté (wafw00f)
- Sous-domaines énumérés
- Répertoires et fichiers cachés découverts
- Fichiers sensibles vérifiés (robots.txt, sitemap.xml, .git, .env)
- Headers HTTP analysés
- Cookies inspectés (Secure, HttpOnly, SameSite)
- CMS identifié et version notée
- Formulaires et paramètres cartographiés
- Endpoints API découverts
- Méthodes HTTP testées (OPTIONS, PUT, DELETE)
- Erreurs et messages d'information collectés

:::

::: info Tips

- Toujours commencer par **cartographier** l'intégralité de l'application avant d'exploiter
- Burp Suite est indispensable activer le proxy dès le début et tout intercepter
- Les fichiers `.git`, `.env`, `backup.zip` exposés sont des jackpots en reconnaissance
- Tester **chaque paramètre** les développeurs oublient souvent des paramètres non documentés
- La logique métier est souvent la vulnérabilité la plus impactante et la plus difficile à trouver automatiquement
- Ne jamais sous-estimer les **headers HTTP** `X-Forwarded-For`, `Origin`, `Referer` sont souvent injectables
- Les APIs REST et GraphQL ont souvent des endpoints non documentés accessibles via fuzzing

:::




## Notes
```
 # Notes terrain
```

## Ressources

- [OWASP Top 10](https://owasp.org/www-top-10/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTricks Web Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-web)
- [PayloadsAllTheThings Web](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Bug Bounty Methodology](https://github.com/jhaddix/tbhm)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/web/index.md)</span>

</div>