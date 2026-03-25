# [ATTACK NAME] 

Description de l'attaque + contexte AD.



## Mécanisme

Explication du fonctionnement.
```
[Attaquant] → Action → [Cible]
[Cible]     → Réponse → [Attaquant]
```



## Prérequis

| Élément            | Détail              |
|--------------------|---------------------|
| Accès requis       | User / Admin / DA   |
| Credentials        | Hash / Password     |
| Position réseau    | LAN / Domain joined |
| Outils nécessaires | Impacket / NXC      |



## Quick Attack

::: code-group
```bash [Impacket]
impacket-<tool> domain/user:password@<target>
```
```bash [NetExec]
nxc smb <target> -u user -p password --<module>
```
```bash [Windows]
<tool>.exe <options>
```

:::



## Workflow
```
1. Prérequis
2. Enumération
3. Exploitation
4. Post-exploitation
```



## Enumération
```bash
# Identifier les cibles vulnérables
nxc ldap <DC> -u user -p password --<check>
```



## Exploitation

### Méthode 1 Impacket
```bash
impacket-<tool> domain/user:password@<target>
```

### Méthode 2 NetExec
```bash
nxc smb <target> -u user -p password --<module>
```

### Méthode 3 Windows
```bash
<tool>.exe <options>
```



## Post-Exploitation
```bash
# Mouvement latéral
impacket-psexec domain/user:password@<target>
```



## Detection & IOC

| Event ID | Description |
|----------|-------------|
| XXXX     | Description |



## Contre-mesures

- Contre-mesure 1
- Contre-mesure 2



## Points d'attaque

- Point 1
- Point 2



::: info Tips 

- Tip 1
- Tip 2

:::


::: details Checklist

- [ ] Etape 1
- [ ] Etape 2

:::


## Notes
```
# Notes terrain
```



## Tools

- [Tool 1](https://lien)
- [Tool 2](https://lien)



## Ressources

- [HackTricks](#)
- [The Hacker Recipes](#)
- [PayloadsAllTheThings](#)





<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/CHEMIN/FICHIER.md)</span>

</div>