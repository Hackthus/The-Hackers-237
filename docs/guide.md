# Guide de Contribution

Merci de contribuer à **The H@ckers 237** :-)  
Ce guide explique comment ajouter du contenu de manière cohérente avec le reste du projet.



## Prérequis

- Avoir un compte GitHub
- Connaître les bases de Git
- Connaître la syntaxe Markdown
- Avoir lu le [Code de conduite](#code-de-conduite)



## Workflow de Contribution
````
 1. Forker le dépôt
 2. Cloner votre fork en local
 3. Rédiger votre contenu en suivant le template
 4. Tester le rendu en local (VitePress)
 5. Commit et push
 6. Ouvrir une Pull Request
````



## Mise en Place en Local

### Cloner le dépôt
````bash
git clone https://github.com/hackthus/The-Hackers-237.git
cd The-Hackers-237
````

### Installer les dépendances
````bash
npm install
````

### Lancer le serveur de développement
````bash
npm run docs:dev
````

### Build de production
````bash
npm run docs:build
````



## Créer une Nouvelle Page

### Convention de nommage des fichiers

````
    docs/
    ├── active-directory
    │   ├── attacks
    │   │   ├── credential-attacks
    │   │   │   ├── kerberoasting.md
    │   │   ├── lateral-movement
    │   │   │   ├── pass-the-hash.md
    │   ├── enumeration
    │   └── privesc
    └── web
        ├── authentication-bypass.md
        ├── command-injection.md
        ├── csrf.md
        ├── deserialization.md
        ├── directory-bruteforce.md
        ├── file-upload.md
        ├── lfi.md
        ├── rfi.md
        ├── sqli.md
        ├── ssrf.md
        ├── web-methodology.md
        └── xss.md

````

| Type de page          | Dossier           | Exemple               |
|-----------------------|-------------------|-----------------------|
| Enumération service   | `enumeration/`    | `enumeration/ssh.md`  |
| Attaque AD            |`active-directory/`| `attacks/credential-attacks/kerberoasting.md`        |
| Web Pentesting        | `web/`            | `web/xss.md`          |
| Privilege Escalation  | `privesc/`        | `privesc/linux.md`    |
| Pivoting              | `pivoting/`       | `pivoting/ssh.md`     |
| Cheatsheet            | `cheatsheets/`    | `cheatsheets/nmap.md` |



## Template Page Enumération Service

::: info Template disponible
Un template est disponible pour créer de nouvelles pages pour l'énumération de services, de manière cohérente.
[consulter le template →](/templates/enum-services-template.md)
:::

## Template Page Attaque Active Directory

::: info Template disponible
Un template est disponible pour créer de nouvelles pages pour les attacks active directory, de manière cohérente.
[consulter le template →](/templates/ad-attacks-template.md)
:::


## Bonnes Pratiques de Rédaction

### Ce qu'il faut faire

- Ecrire en **français** (commentaires de code en anglais)
- Tester toutes les commandes avant de les documenter
- Ajouter des exemples de **output** quand c'est pertinent
- Citer les **sources** dans la section Ressources
- Utiliser les blocs `::: code-group` pour les alternatives d'outils
- Utiliser `::: info` pour les tips et `::: warning` pour les mises en garde
- Utiliser `::: danger` pour les actions irréversibles ou à risque

### Ce qu'il ne faut pas faire

- Ne pas publier de **exploits 0-day** non divulgués
- Ne pas documenter des techniques ciblant des **infrastructures réelles spécifiques**
- Ne pas inclure de **credentials réels** ou de données sensibles
- Ne pas copier du contenu sans **citer la source**



## Blocs VitePress Disponibles
````markdown
 ::: info
 Information générale ou tip.
 :::

 ::: warning
 Mise en garde  action à risque.
 :::

 ::: danger
 Action irréversible ou critique.
 :::

 ::: details Titre du bloc
 Contenu masqué par défaut (checklist, notes, etc.).
 :::

 ::: code-group
 ```bash [Onglet 1]
 commande 1
 ```
 ```bash [Onglet 2]
 commande 2
 ```
 :::
````



## Ouvrir une Pull Request

### Titre de la PR
````
 [ADD] Enumération SSH
 [ADD] Attaque AD DCSync
 [FIX] Correction commande Kerberoasting
 [UPDATE] Mise à jour section FTP
````

### Description de la PR
````markdown
 ## Description
 Courte description de ce qui a été ajouté ou modifié.

 ## Type de changement
 - Nouvelle page
 - Correction
 - Mise à jour
 - Amélioration

 ## Checklist
 - Le contenu suit le template
 - Les commandes ont été testées
 - Les sources sont citées
 - La page est ajoutée dans la sidebar (config.ts)
````



## Code de Conduite

- Respecter les autres contributeurs
- Documenter uniquement pour un usage **éthique et légal**
- Pas de contenu offensant ou discriminatoire
- Toute contribution malveillante sera immédiatement rejetée

> 📘 **[Consulter le Code de Conduite →](/code-of-conduct)**



## Besoin d'aide ?

- Ouvrir une **issue** sur GitHub
- Rejoindre la discussion dans les **Discussions GitHub**
- Contacter les mainteneurs via GitHub



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/contributing.md)</span>

</div>