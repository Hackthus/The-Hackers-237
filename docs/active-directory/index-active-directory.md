# Active Directory

Active Directory (AD) est le service d'annuaire de Microsoft utilisé par la quasi-totalité des entreprises pour gérer les utilisateurs, les ordinateurs, les groupes et les politiques de sécurité. C'est l'environnement le plus ciblé lors des tests d'intrusion en entreprise — compromettre AD signifie souvent compromettre l'ensemble du système d'information.

## Qu'est-ce qu'Active Directory ?

Active Directory est un service d'annuaire basé sur le protocole LDAP et le système d'authentification Kerberos. Il centralise la gestion des identités et des accès dans un environnement Windows d'entreprise. Un contrôleur de domaine (DC) héberge et gère cette base de données.

### Composants clés

| Composant | Description |
|---|---|
| Domain | Unité administrative de base (domain.com) |
| Domain Controller (DC) | Serveur qui héberge AD et authentifie les utilisateurs |
| Forest | Ensemble de domaines partageant un schéma commun |
| Tree | Ensemble de domaines liés hiérarchiquement |
| Organizational Unit (OU) | Conteneur pour organiser les objets AD |
| Group Policy Object (GPO) | Politiques appliquées aux utilisateurs et machines |
| Trust | Relation de confiance entre domaines |

### Objets Active Directory
```
Forest
    └── Domain (domain.com)
            ├── Domain Controllers
            ├── Users
            ├── Groups
            │   ├── Security Groups
            │   └── Distribution Groups
            ├── Computers
            ├── Organizational Units (OU)
            │   ├── Users OU
            │   ├── Computers OU
            │   └── Servers OU
            ├── Group Policy Objects (GPO)
            └── Service Principal Names (SPN)
```

## Protocoles Active Directory

### Protocoles d'authentification

| Protocole | Port | Usage | Sécurité |
|---|---|---|---|
| Kerberos | 88 TCP/UDP | Authentification AD | Fort standard |
| NTLM | 445 TCP | Legacy réseau | Faible PtH, relay |
| LDAP | 389 TCP | Interrogation annuaire | Moyen |
| LDAPS | 636 TCP | LDAP chiffré | Fort |

### Ports Active Directory

| Port | Protocole | Service |
|---|---|---|
| 53 | TCP/UDP | DNS |
| 88 | TCP/UDP | Kerberos |
| 135 | TCP | RPC |
| 139 | TCP | NetBIOS |
| 389 | TCP/UDP | LDAP |
| 445 | TCP | SMB |
| 464 | TCP/UDP | Kerberos password |
| 636 | TCP | LDAPS |
| 3268 | TCP | LDAP Global Catalog |
| 3269 | TCP | LDAPS Global Catalog |
| 3389 | TCP | RDP |
| 5985 | TCP | WinRM HTTP |
| 5986 | TCP | WinRM HTTPS |
| 49152+ | TCP | RPC dynamique |

## Kerberos Mécanisme d'authentification
```
 [Client]  -> AS-REQ -> [KDC — DC]
 [KDC]     -> AS-REP (TGT) -> [Client]
 [Client]  -> TGS-REQ (TGT) -> [KDC — DC]
 [KDC]     -> TGS-REP (TGS) -> [Client]
 [Client]  -> AP-REQ (TGS) -> [Service]
 [Service] -> AP-REP -> [Client]
             Accès accordé
```

### Composants Kerberos

| Composant | Description |
|---|---|
| KDC | Key Distribution Center hébergé sur le DC |
| AS | Authentication Service émet les TGT |
| TGS | Ticket Granting Service émet les tickets de service |
| TGT | Ticket Granting Ticket preuve d'identité |
| ST | Service Ticket accès à un service spécifique |
| SPN | Service Principal Name identifiant d'un service |
| krbtgt | Compte service Kerberos hash critique |

## NTLM - Mécanisme d'authentification
```
 [Client] -> NEGOTIATE -> [Serveur]
 [Serveur] -> CHALLENGE (nonce 8 bytes) -> [Client]
 [Client]  -> AUTHENTICATE (hash) -> [Serveur]
 [Serveur] -> Validation via DC -> [Client]
             Accès accordé
```

### Types de hashes NTLM

| Type | Format | Hashcat |
|---|---|---|
| NTHash | `hash` | 1000 |
| NTLMv1 | `user::domain:hash:hash:challenge` | 5500 |
| NTLMv2 | `user::domain:hash:hash:challenge` | 5600 |

## Surface d'Attaque Active Directory

### Kill Chain AD typique
```
Accès initial
    └── Compte utilisateur du domaine
            ├── Enumération AD (BloodHound, LDAP, RPC)
            ├── Password Spraying
            ├── AS-REP Roasting (sans pré-auth)
            └── Kerberoasting (comptes avec SPN)
                    └── Credentials compromis
                            ├── Pass-the-Hash
                            ├── Pass-the-Ticket
                            ├── Overpass-the-Hash
                            └── Mouvement latéral
                                    └── Escalade vers Domain Admin
                                            ├── DCSync
                                            ├── Golden Ticket
                                            └── Contrôle total du domaine
```

### Attaques couvertes

| Attaque | Prérequis | Impact |
|---|---|---|
| Password Spraying | Aucun | Credentials utilisateur |
| AS-REP Roasting | Liste d'utilisateurs | Hash cracké → credentials |
| Kerberoasting | Compte utilisateur | Hash cracké → credentials service |
| Pass-the-Hash | Hash NTLM | Mouvement latéral |
| Pass-the-Ticket | Ticket Kerberos | Mouvement latéral |
| Overpass-the-Hash | Hash NTLM | Ticket Kerberos |
| DCSync | Droits réplication | Dump tous les hashes du domaine |
| Golden Ticket | Hash krbtgt | Persistance totale 10 ans |
| Silver Ticket | Hash service | Accès service spécifique |
| BloodHound | Compte utilisateur | Cartographie des chemins d'attaque |

## Enumération Initiale

::: code-group
```bash [NetExec]
  nxc smb <DC>
  nxc smb <DC> -u '' -p ''
  nxc smb <DC> -u user -p password --users
  nxc smb <DC> -u user -p password --groups
  nxc smb <DC> -u user -p password --pass-pol
```
```bash [BloodHound]
  bloodhound-python -u user -p password -d domain.com -dc <DC> -c all
```
```bash [LDAP]
  ldapsearch -x -H ldap://<DC> -s base namingcontexts
  ldapsearch -x -H ldap://<DC> -b "dc=domain,dc=com" -D "user@domain.com" -w password
```
```bash [RPC]
  rpcclient -U "" -N <DC>
  rpcclient -U "user%password" <DC> -c "enumdomusers"
```

:::

## BloodHound Cartographie AD

BloodHound est l'outil le plus puissant pour visualiser et analyser les chemins d'attaque dans Active Directory.
```bash
# Collecte des données
  bloodhound-python -u user -p password -d domain.com -dc <DC> -c all -o /tmp/bh

# Lancer Neo4j + BloodHound
  sudo neo4j start
  bloodhound
```

### Requêtes Cypher essentielles
```
 # Comptes kerberoastables
 MATCH (u:User {hasspn:true}) RETURN u

 # Comptes AS-REP roastables
 MATCH (u:User {dontreqpreauth:true}) RETURN u

 # Chemin le plus court vers Domain Admins
 MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"})) RETURN p

 # Machines avec délégation non contrainte
 MATCH (c:Computer {unconstraineddelegation:true}) RETURN c

 # Sessions actives des Domain Admins
 MATCH (u:User)-[:MemberOf]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"}),
 (u)-[:HasSession]->(c:Computer) RETURN u,c
```

## Outils Essentiels

| Outil | Usage | OS |
|---|---|---|
| BloodHound | Cartographie AD et chemins d'attaque | Linux / Windows |
| Impacket | Suite d'outils AD offensifs | Linux |
| NetExec (NXC) | Enumération et exploitation AD | Linux |
| Mimikatz | Dump credentials et tickets | Windows |
| Rubeus | Attaques Kerberos | Windows |
| Kerbrute | Enumération et spraying | Linux / Windows |
| PowerView | Enumération AD via PowerShell | Windows |
| ldapdomaindump | Dump LDAP structuré | Linux |
| Evil-WinRM | Shell WinRM avec hash / password | Linux |
| CrackMapExec | Enumération et exploitation | Linux |

## Environnements de Lab

Pour pratiquer légalement les attaques AD :

| Lab | Description | Lien |
|---|---|---|
| GOAD | Game of Active Directory lab complet | [GitHub](https://github.com/Orange-Cyberdefense/GOAD) |
| Vulnerable-AD | Lab AD vulnérable simple | [GitHub](https://github.com/WazeHell/vulnerable-AD) |
| HackTheBox | Machines et ProLabs AD | [hackthebox.com](https://hackthebox.com/) |
| TryHackMe | Parcours guidés AD | [tryhackme.com](https://tryhackme.com/) |
| PentesterLab | Exercices AD | [pentesterlab.com](https://pentesterlab.com/) |

## Checklist Enumération AD

::: details Checklist

- Ports AD identifiés (88, 389, 445, 636, 3268)
- Domaine et DC identifiés
- Null session testée
- Utilisateurs énumérés
- Groupes énumérés
- Politique de mots de passe récupérée
- BloodHound lancé et analysé
- Comptes kerberoastables identifiés
- Comptes AS-REP roastables identifiés
- Comptes avec délégation identifiés
- Chemins vers DA analysés

:::

::: info Tips 

- Toujours **lancer BloodHound en premier** cartographier avant d'attaquer évite les actions inutiles et bruyantes
- La politique de mots de passe est critique la récupérer avant tout password spray pour éviter les lockouts
- Un simple compte utilisateur suffit pour énumérer 90% des informations d'un domaine via LDAP
- Les comptes de service avec SPN et mots de passe faibles sont les cibles les plus rentables en Kerberoasting
- Le hash `krbtgt` est le Saint Graal il permet un Golden Ticket valable 10 ans par défaut
- Corréler BloodHound + Impacket + NetExec pour une couverture complète de l'environnement AD

:::

## Notes
```
 # Notes terrain
```

## Ressources

- [HackTricks Active Directory](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology)
- [The Hacker Recipes AD](https://www.thehacker.recipes/ad/)
- [PayloadsAllTheThings AD Attack](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md)
- [adsecurity.org](https://adsecurity.org/)
- [BloodHound Documentation](https://bloodhound.readthedocs.io/)
- [MITRE ATT&CK Enterprise](https://attack.mitre.org/matrices/enterprise/)



authors: hackthus
--- 

<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/ad/index.md)</span>

</div>