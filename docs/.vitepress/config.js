export default {
  title: "The H@ckers 237",
  description: "Pentesting & Offensive Security Wiki",
  base: "/The-Hackers-237/",
  appearance: true,

  themeConfig: {

    search: {
      provider: "local"
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Fundamentals", link: "/fundamentals/pentest-methodology" },
      { text: "Web", link: "/web/web-methodology" },
      { text: "Active Directory", link: "/active-directory/ad-intro" },
      { text: "Red Team", link: "/red-team/red-team-methodology" },
      { text: "Cheatsheets", link: "/cheatsheets/linux-cheatsheet" }
    ],

    outline: "deep",

    footer: {
      message: "Hackers237 - Offensive Security Knowledge Base",
      copyright: "Copyright © 2026"
    },

    sidebar: [

      // Fundamentals
      {
        text: "Fundamentals",
        collapsed: false,
        items: [
          { text: "Pentest Methodology", link: "/fundamentals/pentest-methodology" },
          { text: "Kill Chain", link: "/fundamentals/kill-chain" },
          { text: "OSINT", link: "/fundamentals/osint" },
          { text: "Networking Basics", link: "/fundamentals/networking-basics" },
          { text: "Linux Basics", link: "/fundamentals/linux-basics" },
          { text: "Windows Basics", link: "/fundamentals/windows-basics" }
        ]
      },

      // Recon
      {
        text: "Recon",
        collapsed: true,
        items: [
          { text: "Passive Recon", link: "/recon/passive-recon" },
          { text: "Google Dorking", link: "/recon/google-dorking" },
          { text: "Whois", link: "/recon/whois" },
          { text: "DNS Recon", link: "/recon/dns-recon" },
          { text: "Subdomain Enumeration", link: "/recon/subdomain-enumeration" },
          { text: "Github Recon", link: "/recon/github-recon" },
          { text: "Metadata Analysis", link: "/recon/metadata-analysis" },
          { text: "Email Harvesting", link: "/recon/email-harvesting" }
        ]
      },

      // Scanning
      {
        text: "Scanning",
        collapsed: true,
        items: [
          { text: "Nmap", link: "/scanning/nmap" },
          { text: "Masscan", link: "/scanning/masscan" },
          { text: "Rustscan", link: "/scanning/rustscan" },
          { text: "Service Detection", link: "/scanning/service-detection" },
          { text: "Vulnerability Scanning", link: "/scanning/vuln-scanning" },
          { text: "Banner Grabbing", link: "/scanning/banner-grabbing" }
        ]
      },

      // Enumeration
      {
        text: "Enumeration",
        collapsed: true,
        items: [
          { text: "SMB", link: "/enumeration/smb" },
          { text: "LDAP", link: "/enumeration/ldap" },
          { text: "RPC", link: "/enumeration/rpc" },
          { text: "FTP", link: "/enumeration/ftp" },
          { text: "SSH", link: "/enumeration/ssh" },
          { text: "RDP", link: "/enumeration/rdp" },
          { text: "SNMP", link: "/enumeration/snmp" },
          { text: "SMTP", link: "/enumeration/smtp" },
          { text: "DNS", link: "/enumeration/dns" },
          { text: "Kerberos", link: "/enumeration/kerberos" },
          { text: "NFS", link: "/enumeration/nfs" }
        ]
      },

      // Web
      {
        text: "Web",
        collapsed: true,
        items: [
          { text: "Web Methodology", link: "/web/web-methodology" },
          { text: "Directory Bruteforce", link: "/web/directory-bruteforce" },
          { text: "File Upload", link: "/web/file-upload" },
          { text: "Authentication Bypass", link: "/web/authentication-bypass" },
          { text: "XSS", link: "/web/xss" },
          { text: "SQL Injection", link: "/web/sqli" },
          { text: "SSRF", link: "/web/ssrf" },
          { text: "LFI", link: "/web/lfi" },
          { text: "RFI", link: "/web/rfi" },
          { text: "Command Injection", link: "/web/command-injection" },
          { text: "CSRF", link: "/web/csrf" },
          { text: "Open Redirect", link: "/web/open-redirect" },
          { text: "Deserialization", link: "/web/deserialization" }
        ]
      },

      // Active Directory
      {
        text: "Active Directory",
        collapsed: true,
        items: [
          { text: "AD Introduction", link: "/active-directory/ad-intro" },
          { text: "Bloodhound", link: "/active-directory/bloodhound" },
          { text: "LDAP Enumeration", link: "/active-directory/ldap-enumeration" },
          { text: "Kerberoasting", link: "/active-directory/kerberoasting" },
          { text: "ASREPRoasting", link: "/active-directory/asreproasting" },
          { text: "Pass The Hash", link: "/active-directory/pass-the-hash" },
          { text: "Pass The Ticket", link: "/active-directory/pass-the-ticket" },
          { text: "DCSync", link: "/active-directory/dcsync" },
          { text: "Golden Ticket", link: "/active-directory/golden-ticket" },
          { text: "Silver Ticket", link: "/active-directory/silver-ticket" }
        ]
      },

      // Lateral Movement
      {
        text: "Lateral Movement",
        collapsed: true,
        items: [
          { text: "PsExec", link: "/lateral-movement/psexec" },
          { text: "WMIExec", link: "/lateral-movement/wmiexec" },
          { text: "WinRM", link: "/lateral-movement/winrm" },
          { text: "SMBExec", link: "/lateral-movement/smbexec" }
        ]
      },

      // Persistence
      {
        text: "Persistence",
        collapsed: true,
        items: [
          { text: "Startup Folder", link: "/persistence/startup-folder" },
          { text: "Registry Run Keys", link: "/persistence/registry-run-keys" },
          { text: "Scheduled Tasks", link: "/persistence/scheduled-tasks" },
          { text: "Services", link: "/persistence/services" }
        ]
      },

      // Evasion
      {
        text: "Evasion",
        collapsed: true,
        items: [
          { text: "AV Bypass", link: "/evasion/av-bypass" },
          { text: "Obfuscation", link: "/evasion/obfuscation" },
          { text: "Living Off The Land", link: "/evasion/lolbins" },
          { text: "Log Cleaning", link: "/evasion/log-cleaning" }
        ]
      },
      // Tools
      {
        text: "Tools",
        collapsed: true,
        items: [
          { text: "Nmap", link: "/tools/nmap" },
          { text: "BurpSuite", link: "/tools/burpsuite" },
          { text: "Metasploit", link: "/tools/metasploit" },
          { text: "Bloodhound", link: "/tools/bloodhound" },
          { text: "Impacket", link: "/tools/impacket" },
          { text: "Responder", link: "/tools/responder" }
        ]
      },

      // Cheatsheets
      {
        text: "Cheatsheets",
        collapsed: true,
        items: [
          { text: "Linux Cheatsheet", link: "/cheatsheets/linux-cheatsheet" },
          { text: "Windows Cheatsheet", link: "/cheatsheets/windows-cheatsheet" },
          { text: "Nmap Cheatsheet", link: "/cheatsheets/nmap-cheatsheet" },
          { text: "AD Cheatsheet", link: "/cheatsheets/ad-cheatsheet" },
          { text: "Web Cheatsheet", link: "/cheatsheets/web-cheatsheet" }
        ]
      }

    ]
  }
}