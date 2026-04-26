# 🔐 [SERVICE NAME] Enumeration

Description rapide du service + rôle en pentest. Exemple : FTP est utilisé pour le transfert de fichiers et peut exposer des accès anonymes ou des credentials.

---

## 🧭 Objectifs

- Identifier le service
- Enumérer les accès
- Trouver des credentials
- Identifier des vecteurs d'exploitation

---

## 🔌 Ports

| Port | Service          |
|------|------------------|
| XX   | Nom du service   |

---

## ⚡ Quick Enumeration
```bash
# Scan rapide
nmap -pXX <target>

# Tool principal
<tool> <options>
```

---

## 🔍 Workflow Pentest
```
1. Scan du port
2. Identification du service
3. Enumération basique
4. Test accès anonyme
5. Bruteforce / credentials
6. Exploitation
7. Post-exploitation
```

---

## 🛰️ Nmap

### Scan basique
```bash
nmap -pXX <target>
```

### Détection version
```bash
nmap -pXX -sV <target>
```

### Scripts NSE
```bash
nmap -pXX --script <scripts> <target>
```

---

## 🧰 Enumeration

### Commande basique
```bash
<tool> <target>
```

### Avec credentials
```bash
<tool> -u user -p password <target>
```

### Enum avancée
```bash
<tool> --advanced <target>
```

---

## 🔑 Credentials Attacks

### Bruteforce
```bash
hydra -l user -P passwords.txt <service>://<target>
```

### Password spraying
```bash
<tool> spray <target>
```

---

## 💥 Exploitation

### Exploit connu
```bash
searchsploit <service>
```

### Exploit manuel
```bash
# commandes spécifiques
```

---

## 🧗 Post-Exploitation

- Escalade de privilèges
- Mouvement latéral
- Dump credentials

---

## 👤 Anonymous Access

### Test accès anonyme
```bash
<tool> anonymous <target>
```

---

## ⚠️ Points d'attaque

- Mauvaise configuration
- Credentials exposés
- Version vulnérable
- Accès anonyme

---

::: info 🧠 Tips Red Team

- Toujours vérifier les accès anonymes
- Automatiser + manuel
- Corréler plusieurs outils
- Chercher fichiers sensibles

:::

---

## 🧰 Tools

- Nmap
- Hydra
- Metasploit
- Outils spécifiques au service

---

## 📚 Ressources

- [Documentation officielle](#)
- [HackTricks](#)
- [PayloadsAllTheThings](#)

---

## 🧾 Notes
```
# Notes terrain
```

---

::: details Checklist
- Port 445 ouvert
- Shares listés
- Anonymous testé
- Users identifiés
- Credentials testés
- Fichiers récupérés
:::

---

<div class="page-footer">

<span>📅 ![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![✏️ Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/template.md)</span>

</div>