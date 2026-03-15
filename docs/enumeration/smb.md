# SMB Enumeration

> SMB (Server Message Block) est un protocole utilisé pour le **partage de fichiers, imprimantes et l'authentification** dans les environnements **Windows et Active Directory**.  
> Lors d'un **pentest**, SMB est souvent une **source importante d'énumération, de credentials et de mouvement latéral**.

---

# Ports

| Port | Service |
|------|---------|
| 139  | NetBIOS Session |
| 445  | SMB |

---

# Quick Enumeration

Commandes rapides pour commencer l'énumération SMB.

```bash
nmap -p139,445 <target>
smbmap -H <target>
enum4linux -a <target>
nxc smb <target>
crackmapexec smb <target>
```

---

# Nmap

Utilisé pour **détecter les services SMB et récupérer des informations sur les shares et utilisateurs**.

## Scan basique

```bash
nmap -p139,445 <target>
```

## Enumération des shares et utilisateurs

```bash
nmap -p445 --script smb-enum-shares,smb-enum-users <target>
```

## Vérifier les versions SMB

```bash
nmap -p445 --script smb-protocols <target>
```

## Enumération complète SMB

```bash
nmap -p445 --script smb-enum-* <target>
```

---

# SMBMap

Outil permettant de **lister les shares SMB et vérifier les permissions**.

## Lister les shares accessibles

```bash
smbmap -H <target>
```

## Utiliser des credentials

```bash
smbmap -H <target> -u user -p password
```

## Lister les fichiers récursivement

```bash
smbmap -H <target> -R
```

## Télécharger un fichier

```bash
smbmap -H <target> --download share/file.txt
```

---

# Enum4linux

Outil classique pour **l'énumération SMB et Active Directory**.

## Enumération complète

```bash
enum4linux -a <target>
```

## Lister les utilisateurs

```bash
enum4linux -U <target>
```

## Lister les shares

```bash
enum4linux -S <target>
```

---

# NetExec (NXC)
::: info
NetExec (`nxc`) est le **successeur moderne de CrackMapExec**.  
Il permet de scanner les services, tester des credentials et effectuer des attaques dans les environnements **Active Directory**.
:::
## Scan SMB

```bash
nxc smb <target>
```

## Tester un utilisateur

```bash
nxc smb <target> -u user -p password
```

## Lister les shares

```bash
nxc smb <target> --shares
```

## Tester plusieurs utilisateurs

```bash
nxc smb <target> -u users.txt -p passwords.txt
```

---

# CrackMapExec

Framework puissant pour **scanner SMB et tester des credentials dans un réseau**.

## Scan SMB

```bash
crackmapexec smb <target>
```

## Tester un utilisateur

```bash
crackmapexec smb <target> -u user -p password
```

## Lister les shares

```bash
crackmapexec smb <target> --shares
```

---

# smbclient

Client SMB permettant **d'accéder directement aux shares**.

## Lister les shares

```bash
smbclient -L //<target>
```

## Connexion à un share

```bash
smbclient //<target>/share
```

## Connexion avec credentials

```bash
smbclient //<target>/share -U user
```

---

# Anonymous Access

Tester si un accès **anonyme est autorisé**.

## Lister les shares anonymes

```bash
smbclient -L //<target> -N
```

## Accéder à un share anonymement

```bash
smbclient //<target>/share -N
```

---

# Points d'attaque à vérifier

Lors d'un pentest SMB :

- Shares accessibles **sans authentification**
- **Credentials stockés** dans les shares
- **Password reuse**
- **SMBv1 activé**
- Enumération des **utilisateurs Active Directory**
- Fichiers contenant **configurations ou mots de passe**

---

# Tools utiles

- [Nmap](https://nmap.org/)
- [SMBMap](https://github.com/ShawnDEvans/smbmap)
- [Enum4linux](https://github.com/CiscoCXSecurity/enum4linux)
- [NetExec (NXC)](https://github.com/Pennyw0rth/NetExec)
- [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec)
- [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html)

---

# 📚 Ressources

- [Nmap Documentation officielle](https://nmap.org/book/man.html)
- [NetExec Wiki](https://www.netexec.wiki/)
- [CrackMapExec GitHub](https://github.com/byt3bl33d3r/CrackMapExec)
- [Impacket GitHub](https://github.com/SecureAuthCorp/impacket)
- [HackTricks SMB Pentesting](https://book.hacktricks.xyz/network-services-pentesting/pentesting-smb)

---

<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/smb.md)</span>

</div>