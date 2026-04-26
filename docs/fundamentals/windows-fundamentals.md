# Windows Fundamentals

Les fondamentaux Windows sont essentiels en pentest la majorité des environnements d'entreprise tournent sur Windows et Active Directory. Comprendre l'architecture, le registre, les permissions et les mécanismes d'authentification est indispensable pour mener des tests d'intrusion efficaces.

## Architecture Windows
```
 Hardware
     └── Windows Kernel (NT Kernel)
             ├── HAL (Hardware Abstraction Layer)
             ├── Drivers
             └── Executive Services
                     ├── Process Manager
                     ├── Memory Manager
                     ├── Security Reference Monitor
                     └── I/O Manager
                             └── Win32 Subsystem
                                     └── Applications
```

### Versions Windows courantes en entreprise

| Version | Build | Usage |
|---|---|---|
| Windows 10 | 10.0.19041+ | Postes de travail |
| Windows 11 | 10.0.22000+ | Postes de travail récents |
| Windows Server 2016 | 10.0.14393 | Serveurs |
| Windows Server 2019 | 10.0.17763 | Serveurs |
| Windows Server 2022 | 10.0.20348 | Serveurs récents |

## Système de Fichiers

### Arborescence Windows
```
 C:\
 ├── Windows\
 │   ├── System32\          → Binaires système 64 bits
 │   ├── SysWOW64\          → Binaires système 32 bits
 │   ├── Temp\              → Fichiers temporaires système
 │   └── NTDS\              → Base de données AD (sur DC)
 ├── Program Files\          → Applications 64 bits
 ├── Program Files (x86)\    → Applications 32 bits
 ├── Users\
 │   ├── Administrator\
 │   ├── Public\            → Partagé entre tous les users
 │   └── <username>\
 │       ├── Desktop\
 │       ├── Documents\
 │       ├── Downloads\
 │       ├── AppData\
 │       │   ├── Local\
 │       │   ├── LocalLow\
 │        │   └── Roaming\
 │       └── .ssh\
 ├── ProgramData\            → Données applications (caché)
 ├── Temp\                   → Fichiers temporaires
 └── inetpub\                → Racine IIS
     └── wwwroot\
```

### Fichiers importants en pentest
```
 # Credentials & Config
 C:\Windows\System32\config\SAM           # Hashes locaux
 C:\Windows\System32\config\SYSTEM        # Clé SYSKEY
 C:\Windows\NTDS\ntds.dit                 # Base AD (DC)
 C:\inetpub\wwwroot\web.config            # Config IIS
 C:\xampp\htdocs\config.php               # Config XAMPP
 C:\Windows\Panther\unattend.xml          # Credentials setup
 C:\Windows\Panther\Unattended.xml

 # Historique & Logs
 C:\Users\<user>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
 C:\Windows\System32\winevt\Logs\

 # SSH
 C:\Users\<user>\.ssh\id_rsa
 C:\Users\<user>\.ssh\known_hosts
 C:\ProgramData\ssh\administrators_authorized_keys
```

## Registre Windows

### Structure du registre

| Hive | Abréviation | Contenu |
|---|---|---|
| HKEY_LOCAL_MACHINE | HKLM | Configuration système globale |
| HKEY_CURRENT_USER | HKCU | Configuration utilisateur courant |
| HKEY_USERS | HKU | Configurations de tous les utilisateurs |
| HKEY_CLASSES_ROOT | HKCR | Associations fichiers / COM |
| HKEY_CURRENT_CONFIG | HKCC | Configuration matérielle active |

### Clés importantes en pentest
```
 # Démarrage automatique
 HKLM\Software\Microsoft\Windows\CurrentVersion\Run
 HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce
 HKCU\Software\Microsoft\Windows\CurrentVersion\Run

 # Credentials stockés
 HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
 HKCU\Software\SimonTatham\PuTTY\Sessions
 HKLM\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\ValidCommunities

 # Politique de mots de passe
 HKLM\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters

 # Services
 HKLM\SYSTEM\CurrentControlSet\Services\

 # UAC
 HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System

 # RDP
 HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server
```

### Commandes registre
```cmd
 # Lire
 reg query HKLM\Software\Microsoft\Windows\CurrentVersion
 reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run

 # Chercher un mot de passe
 reg query HKLM /f "password" /t REG_SZ /s
 reg query HKCU /f "password" /t REG_SZ /s

 # Modifier
 reg add HKLM\...\Run /v evil /t REG_SZ /d "C:\Temp\evil.exe"

 # Supprimer
 reg delete HKLM\...\Run /v evil /f

 # Exporter
 reg export HKLM\Software backup.reg

 # Importer
 reg import backup.reg
```

## Gestion des Utilisateurs
```cmd
 # Utilisateur courant
 whoami
 whoami /all
 whoami /priv
 whoami /groups

 # Lister les utilisateurs
 net user
 net user <username>

 # Créer un utilisateur
 net user hacker Password123! /add
 net user hacker Password123! /add /domain

 # Groupes
 net localgroup
 net localgroup Administrators
 net localgroup Administrators hacker /add

 # Domaine
 net user /domain
 net group /domain
 net group "Domain Admins" /domain
```

## Permissions NTFS

### Types de permissions

| Permission | Fichier | Dossier |
|---|---|---|
| Read (R) | Lire le contenu | Lister les fichiers |
| Write (W) | Modifier | Créer des fichiers |
| Execute (X) | Exécuter | Entrer dans le dossier |
| Delete | Supprimer | Supprimer le contenu |
| Full Control | Toutes | Toutes + modifier permissions |
| Modify | R+W+X+Delete | R+W+X+Delete |
| Read & Execute | R+X | R+X+Lister |

### icacls
```cmd
 # Afficher les permissions
 icacls C:\path\to\file
 icacls C:\path\to\dir

 # Modifier
 icacls C:\path /grant user:(F)          # Full Control
 icacls C:\path /grant user:(R,W)        # Read + Write
 icacls C:\path /deny user:(W)           # Refuser Write
 icacls C:\path /remove user             # Supprimer

 # Récursif
 icacls C:\path /grant user:(F) /T

 # Héritage
 icacls C:\path /inheritance:d           # Désactiver héritage
 icacls C:\path /inheritance:e           # Activer héritage
```

## Processus & Services
```cmd
 # Processus
 tasklist
 tasklist /v
 tasklist /svc
 taskkill /PID <pid> /F
 taskkill /IM process.exe /F

 # Services
 sc query
 sc query state= all
 sc qc <service>
 sc start <service>
 sc stop <service>
 sc config <service> start= auto
 sc config <service> binpath= "C:\Temp\evil.exe"
 net start
 net start <service>
 net stop <service>

 # Tâches planifiées
 schtasks /query /fo LIST /v
 schtasks /create /tn "Task" /tr "C:\Temp\evil.exe" /sc onlogon /ru System
 schtasks /run /tn "Task"
 schtasks /delete /tn "Task" /f
```

## Réseau
```cmd
 # Interfaces
 ipconfig /all
 ipconfig /flushdns

 # Connexions
 netstat -ano
 netstat -ano | findstr LISTENING
 netstat -ano | findstr <port>

 # Routes
 route print
 route add <network> mask <mask> <gateway>

 # ARP
 arp -a
 arp -d <ip>

 # Firewall
 netsh advfirewall show allprofiles
 netsh advfirewall set allprofiles state off
 netsh advfirewall firewall add rule name="rule" protocol=TCP dir=in localport=4444 action=allow

 # Partages réseau
 net share
 net use
 net use Z: \\<target>\share /user:user password
```

## Authentification Windows

### Protocoles d'authentification

| Protocole | Usage | Sécurité |
|---|---|---|
| LM | Legacy Windows < Vista | Très faible obsolète |
| NTLM | Authentification réseau | Faible vulnerable PtH |
| NTLMv2 | NTLM amélioré | Moyen vulnerable relay |
| Kerberos | Active Directory | Fort standard AD |

### Processus NTLM
```
 [Client]  ->  NEGOTIATE -> [Serveur]
 [Serveur] ->  CHALLENGE (nonce) ->  [Client]
 [Client]  ->  AUTHENTICATE (hash) ->  [Serveur]
```

### Processus Kerberos
```
 [Client] ->  AS-REQ ->  [KDC]
 [KDC]    ->  AS-REP (TGT) ->  [Client]
 [Client] ->  TGS-REQ (TGT) ->  [KDC]
 [KDC]    ->  TGS-REP (TGS) ->  [Client]
 [Client] ->  AP-REQ (TGS) ->  [Service]
 [Service]->  AP-REP ->  [Client]
```

### Stockage des credentials
```
 SAM       ->  Hashes locaux (C:\Windows\System32\config\SAM)
 LSASS     ->  Hashes en mémoire (processus lsass.exe)
 NTDS.dit  ->  Base de données AD (C:\Windows\NTDS\ntds.dit)
 LSA Secrets ->  Credentials services (registre SECURITY)
 Credential Manager ->  Credentials sauvegardés
```

## UAC User Account Control

### Niveaux UAC

| Niveau | Description |
|---|---|
| Always notify | Demande pour tout changement |
| Default | Demande pour les apps seulement |
| Notify only | Notification sans demande |
| Never notify | UAC désactivé |
```cmd
 # Vérifier le niveau UAC
 reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA
 reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v ConsentPromptBehaviorAdmin

 # Désactiver UAC
 reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA /t REG_DWORD /d 0 /f
```

## PowerShell

### Bases
```powershell
 # Variables
 $var = "value"
 $number = 42
 $array = @(1, 2, 3)
 $hash = @{key = "value"}

 # Conditions
 if ($var -eq "value") { "Match" }
 if ($var -ne "value") { "No match" }
 if ($number -gt 10) { "Greater" }
 if ($number -lt 10) { "Lower" }

 # Boucles
 foreach ($item in $array) { Write-Output $item }
 for ($i = 0; $i -lt 10; $i++) { Write-Output $i }
 while ($true) { Start-Sleep 1 }

 # Fonctions
 function Get-Hello {
     param([string]$Name)
     Write-Output "Hello $Name"
 }
 Get-Hello -Name "World"
```

### Commandes utiles
```powershell
 # Système
 Get-ComputerInfo
 Get-Process
 Get-Service
 Get-EventLog -LogName Security -Newest 50

 # Fichiers
 Get-ChildItem
 Get-ChildItem -Recurse -Filter *.txt
 Get-Content file.txt
 Set-Content file.txt "content"
 Add-Content file.txt "content"
 Copy-Item source dest
 Remove-Item file.txt

 # Réseau
 Get-NetIPAddress
 Get-NetTCPConnection
 Test-NetConnection <target> -Port 445

 # Utilisateurs
 Get-LocalUser
 Get-LocalGroup
 Get-LocalGroupMember Administrators

 # Registre
 Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion
 Set-ItemProperty HKLM:\...\Run -Name evil -Value "C:\Temp\evil.exe"
```

### Execution Policy
```powershell
 # Vérifier
 Get-ExecutionPolicy

 # Bypass
 Set-ExecutionPolicy Bypass -Scope Process
 powershell -ExecutionPolicy Bypass -File script.ps1
 powershell -ep bypass

 # Encodage base64
 $cmd = 'Write-Output "Hello"'
 $bytes = [System.Text.Encoding]::Unicode.GetBytes($cmd)
 $encoded = [Convert]::ToBase64String($bytes)
 powershell -EncodedCommand $encoded
```

## Logs & Journaux

### Event Logs importants

| Log | Chemin | Contenu |
|---|---|---|
| Security | Security.evtx | Authentifications, accès objets |
| System | System.evtx | Démarrage, services, drivers |
| Application | Application.evtx | Applications, erreurs |
| PowerShell | Microsoft-Windows-PowerShell | Exécution PS |
| Sysmon | Microsoft-Windows-Sysmon | Surveillance avancée |

### Event IDs critiques

| Event ID | Description |
|---|---|
| 4624 | Logon réussi |
| 4625 | Logon échoué |
| 4634 | Logoff |
| 4648 | Logon credentials explicites |
| 4657 | Modification registre |
| 4663 | Accès objet |
| 4672 | Privilèges spéciaux assignés |
| 4688 | Création processus |
| 4698 | Création tâche planifiée |
| 4720 | Création compte utilisateur |
| 4732 | Ajout membre groupe local |
| 4768 | TGT Kerberos demandé |
| 4769 | TGS Kerberos demandé |
| 4776 | Validation NTLM |

```powershell
 # Lire les logs
 Get-EventLog -LogName Security -Newest 100
 Get-EventLog -LogName Security -InstanceId 4624 -Newest 50
 Get-WinEvent -LogName Security -MaxEvents 100
 Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 50
```

## Windows Defender & Antivirus
```powershell
 # Statut
 Get-MpComputerStatus
 Get-MpPreference

 # Désactiver (admin requis)
 Set-MpPreference -DisableRealtimeMonitoring $true
 Set-MpPreference -DisableIOAVProtection $true

 # Exclusions
 Add-MpPreference -ExclusionPath "C:\Temp"
 Add-MpPreference -ExclusionExtension ".exe"

 # Via cmd
 sc stop WinDefend
 sc config WinDefend start= disabled
```

::: info Tips 

- `whoami /priv` en premier `SeImpersonatePrivilege` et `SeDebugPrivilege` sont les privilèges les plus exploitables
- Le registre `HKLM\...\Winlogon` contient souvent des credentials en clair (DefaultPassword)
- `C:\Windows\Panther\unattend.xml` expose régulièrement des credentials d'installation
- L'historique PowerShell (`ConsoleHost_history.txt`) est souvent oublié et très riche en informations
- Les services avec `Unquoted Service Path` sont un vecteur classique d'escalade de privilèges
- Connaître les Event IDs par coeur accélère l'analyse des logs lors d'investigations
- `cmdkey /list` révèle les credentials Windows sauvegardés souvent des comptes admin

:::

## Notes
```
 # Notes terrain
```

## Ressources

- [HackTricks Windows Privilege Escalation](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation)
- [PayloadsAllTheThings Windows](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md)
- [LOLBAS Living off the Land](https://lolbas-project.github.io/)
- [WinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/winPEAS)
- [Microsoft Docs](https://docs.microsoft.com/en-us/windows/)



<div class="page-footer">

<span>![Last updated](https://img.shields.io/github/last-commit/Hackthus/The-Hackers-237?label=Last%20updated&style=flat-square&color=gray)</span>

<span>[![Edit this page on GitHub](https://img.shields.io/badge/✏️%20Edit%20this%20page-GitHub-black?style=flat-square&logo=github)](https://github.com/Hackthus/The-Hackers-237/edit/main/docs/fundamentals/windows.md)</span>

</div>