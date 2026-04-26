# Fondamentaux

Les fondamentaux sont la base de tout parcours en cybersécurité offensive. Avant d'attaquer des systèmes, comprendre comment ils fonctionnent est indispensable — un bon pentester est avant tout un bon technicien.

## Pourquoi les fondamentaux ?

La cybersécurité offensive repose sur une compréhension profonde des systèmes, des protocoles et des architectures. Sans ces bases solides, il est impossible de comprendre pourquoi une attaque fonctionne, comment l'adapter à un contexte différent ou comment expliquer l'impact d'une vulnérabilité à un client.

Les fondamentaux couverts dans cette section sont :

- Les systèmes d'exploitation Linux et Windows
- Les réseaux protocoles, ports, flux de données
- La méthodologie structurer un engagement de bout en bout

## Contenu de la Section

### Méthodologie Pentest

Cadre structuré pour mener un test d'intrusion de la phase de pré-engagement jusqu'au rapport final.

- Les 7 phases d'un pentest
- Cadres méthodologiques (PTES, OWASP, MITRE ATT&CK)
- Pre-engagement et règles d'engagement
- Reconnaissance, scanning, exploitation, post-exploitation
- Rédaction de rapport professionnel
- OPSEC et discrétion opérationnelle

[Voir la page →](/fundamentals/pentest-methodology-fundamentals)

### Linux Fundamentals

Maîtrise de la ligne de commande Linux indispensable car la majorité des outils offensifs et des serveurs cibles tournent sur Linux.

- Architecture et système de fichiers
- Navigation, permissions et gestion des fichiers
- Utilisateurs, groupes et sudo
- Processus, services et cron jobs
- Réseau et outils de diagnostic
- Scripting Bash bases
- Commandes essentielles pour le pentest

[Voir la page →](/fundamentals/linux-fundamentals)

### Windows Fundamentals

Compréhension de l'architecture Windows et de ses mécanismes essentiel pour les environnements d'entreprise et Active Directory.

- Architecture Windows et système de fichiers
- Registre Windows structure et clés importantes
- Permissions NTFS et gestion des utilisateurs
- Processus, services et tâches planifiées
- Authentification NTLM et Kerberos
- PowerShell bases et techniques d'exécution
- Logs et Event IDs critiques

[Voir la page →](/fundamentals/windows-fundamentals)

### Networking

Protocoles réseau, adressage IP, ports et outils d'analyse la base pour comprendre comment les systèmes communiquent et comment intercepter ou manipuler ce trafic.

- Modèles OSI et TCP/IP
- TCP vs UDP Three-Way Handshake
- Adressage IP, CIDR et subnetting
- Ports et protocoles essentiels
- DNS, DHCP, ARP, ICMP, HTTP
- Outils réseau tcpdump, Wireshark, Nmap
- Pivoting et tunneling SSH, ProxyChains, Chisel, Ligolo-ng
- Attaques réseau ARP Spoofing, MITM, Responder

[Voir la page →](/fundamentals/networking-fundamentals)

## Ordre d'Apprentissage Recommandé
```
 1. Networking        → Comprendre comment les systèmes communiquent
 2. Linux             → Maîtriser l'environnement de travail offensif
 3. Windows           → Comprendre les cibles d'entreprise
 4. Méthodologie      → Structurer les engagements
```

## Prérequis

Aucun prérequis strict n'est nécessaire pour commencer cette section. Une familiarité basique avec l'informatique (utiliser un terminal, naviguer dans des fichiers) est suffisante pour aborder les fondamentaux.

Pour aller plus loin après cette section :

| Section suivante | Lien |
|---|---|
| Enumération réseau | [Voir →](/enumeration/) |
| Active Directory | [Voir →](/ad/) |
| Web Pentesting | [Voir →](/web/) |
| Cheatsheets | [Voir →](/cheatsheets/) |

::: info Conseil

Ne pas chercher à tout mémoriser comprendre les concepts et savoir où trouver l'information rapidement est bien plus efficace. Ces pages sont conçues pour être consultées pendant un engagement, pas uniquement pour l'apprentissage.

:::

## Ressources Complémentaires

- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) Linux en pratique
- [TryHackMe Pre-Security](https://tryhackme.com/path/outline/presecurity) Fondamentaux interactifs
- [HackTheBox Academy Fundamentals](https://academy.hackthebox.com/) Cours structurés
- [The Linux Command Line William Shotts](https://linuxcommand.org/tlcl.php) Référence Linux gratuite
- [Professor Messer CompTIA Network+](https://www.professormesser.com/) Réseau complet

<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/fundamentals/index.md)</span>

</div>