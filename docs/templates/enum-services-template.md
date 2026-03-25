# Template Page Enumération Service

Utiliser ce template pour documenter l'énumération d'un service réseau (SMB, FTP, SSH, etc.).  
Vous pouvez faire un copier coller du contenu ou <a href="docs/templates/file-enum-services-template.md" download>Télécharger le fichier</a>.

````markdown
    # [SERVICE NAME] Enumeration

    Description rapide du service + rôle en pentest.



    ## Objectifs

    - Objectif 1
    - Objectif 2



    ## Ports

    | Port | Service |
    |------|---------|
    | XX   | Nom     |



    ## Quick Enumeration

    ::: code-group
    ```bash [Nmap]
    nmap -pXX <target>
    ```
    ```bash [Tool principal]
    <tool> <options> <target>
    ```

    :::



    ## Workflow Pentest
    ```
    1. Scan du port
    2. Identification du service
    3. Enumération basique
    4. Test accès anonyme
    5. Bruteforce / credentials
    6. Exploitation
    ```



    ## Nmap

    ### Scan basique
    ```bash
    nmap -pXX <target>
    ```

    ### Scripts NSE
    ```bash
    nmap -pXX --script <scripts> <target>
    ```



    ## Enumeration

    ### Commande basique
    ```bash
    <tool> <target>
    ```

    ### Avec credentials
    ```bash
    <tool> -u user -p password <target>
    ```



    ## Credentials Attacks

    ### Bruteforce
    ```bash
    hydra -l user -P passwords.txt <service>://<target>
    ```



    ## Exploitation

    ### Exploit connu
    ```bash
    searchsploit <service>
    ```



    ## Anonymous Access
    ```bash
    <tool> anonymous <target>
    ```



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
    - [PayloadsAllTheThings](#)








    <div class="page-footer">

    <span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

    <span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/CHEMIN/FICHIER.md)</span>

    </div>
````

<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/CHEMIN/FICHIER.md)</span>

</div>