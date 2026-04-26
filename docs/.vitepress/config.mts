export default {
  title: "The Hackers 237",
  description: "Pentesting & Offensive Security Wiki",
  base: "/The-Hackers-237/",
  appearance: true,
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: './assets/logo.png' }]
  ],

  themeConfig: {

    logo: "/images/logo.png",
    search: {
      provider: "local", 
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Hackthus/The-Hackers-237" }
    ],

    nav: [
      { text: "Home", link: "/" },
      { text: "Fundamentals", link: "/fundamentals/index-fundamentals" },
      { text: "Active Directory", link: "/active-directory/index-active-directory" },
      { text: "Web", link: "/web/index-web" },
      { text: "Cheatsheets", link: "/cheatsheets/linux-cheatsheet" },
      { text: "Mindmap", link: "/evasion/obfuscation" },
      { text: "Contact", link: "/contact" }
    ],

    outline: "deep",

    footer: {
      message: "The Hackers 237 - Offensive Security Knowledge Base",
      copyright: "Copyright © 2026"
    },

    sidebar: [
      // Fundamentals
      {
        text: "Fundamentals",
        collapsed: false,
        items: [
          { text: "Pentest Methodology", link: "/fundamentals/pentest-methodology-fundamentals" },
          { text: "Kill Chain", link: "/fundamentals/kill-chain-fundamentals" },
          { text: "Networking ", link: "/fundamentals/networking-fundamentals" },
          { text: "Linux ", link: "/fundamentals/linux-fundamentals" },
          { text: "Windows ", link: "/fundamentals/windows-fundamentals" },
          { text: "MacOS ", link: "/fundamentals/macos-fundamentals" }
        ]
      },

      // Techniques Tactiques et Proceddures
      {
        text: "TTP",
        collapsed: false,
        items: [
          { text: "DLL Execution", link: "/ttp/dll_execution" },
          { text: "Filess Execution", link: "/ttp/filess_execution" },
       
        ]
      },

      // Reconnaissance
      {
        text: "Reconnaissance",
        collapsed: true,
        items: [
          // Passive Recon
          {
            text: "Passive Recon",
            collapsed: true,
            items: [
              { text: "OSINT", link: "/fundamentals/osint" },
              { text: "Google Dorking", link: "/recon/google-dorking" },
              { text: "Whois", link: "/recon/whois" },
              { text: "Github Recon", link: "/recon/github-recon" },
              { text: "Metadata Analysis", link: "/recon/metadata-analysis" },
              { text: "Email Harvesting", link: "/recon/email-harvesting" }
            ]
          },

          // Active Recon
          {
            text: "Active Recon",
            collapsed: true,
            items: [
              { text: "DNS Recon", link: "/recon/dns-recon" },
              { text: "Subdomain Enumeration", link: "/recon/subdomain-enumeration" },
              { text: "Nmap", link: "/scanning/nmap" },
            ]
          }
        ]
      },

      // Enumeration
      {
        text: "Network Enumeration",
        collapsed: true,
        items: [
          { text: "SMB", link: "/network-enumeration/smb" },
          { text: "LDAP", link: "/network-enumeration/ldap" },
          { text: "RPC", link: "/network-enumeration/rpc" },
          { text: "FTP", link: "/network-enumeration/ftp" },
          { text: "SSH", link: "/network-enumeration/ssh" },
          { text: "RDP", link: "/network-enumeration/rdp" },
          { text: "SNMP", link: "/network-enumeration/snmp" },
          { text: "SMTP", link: "/network-enumeration/smtp" },
          { text: "DNS", link: "/network-enumeration/dns" },
          { text: "Kerberos", link: "/network-enumeration/kerberos" },
          { text: "NFS", link: "/network-enumeration/nfs" }
        ]
      },

       // Active Directory
      {
        text: "Active Directory",
        collapsed: true,
        items: [

          { text: "Methodology", link: "/active-directory/methodology" },

          // Reconnaissance
          {
            text: "Reconnaissance",
            collapsed: true,
            items: [
              { text: "Domain Discovery", link: "/active-directory/recon/domain-discovery" },
              { text: "User Enumeration", link: "/active-directory/recon/user-enumeration" },
              { text: "Service Discovery", link: "/active-directory/recon/service-discovery" }
            ]
          },

          // Enumeration
          {
            text: "Enumeration",
            collapsed: true,
            items: [
              { text: "SMB Enumeration", link: "/active-directory/enumeration/smb" },
              { text: "LDAP Enumeration", link: "/active-directory/enumeration/ldap" },
              { text: "Kerberos Enumeration", link: "/active-directory/enumeration/kerberos" },
              { text: "RPC Enumeration", link: "/active-directory/enumeration/rpc" },
              { text: "BloodHound Mapping", link: "/active-directory/enumeration/bloodhound" }
            ]
          },

          // Credential Attacks
          {
            text: "Credential Attacks",
            collapsed: true,
            items: [
              { text: "ASREPRoasting", link: "/active-directory/attacks/credential-attacks/asreproasting" },
              { text: "Kerberoasting", link: "/active-directory/attacks/credential-attacks/kerberoasting" },
              { text: "Password Spraying", link: "/active-directory/attacks/credential-attacks/password-spraying" }
              
            ]
          },

            // ADCS Attacks
          {
            text: "ADCS Attacks",
            collapsed: true,
            items: [
              { text: "ESC1", link: "/active-directory/attacks/adds-attacks/esc1" },
              { text: "ESC2", link: "/active-directory/attacks/adds-attacks/esc2" },
              { text: "ESC3", link: "/active-directory/attacks/adds-attacks/esc3" },
              { text: "ESC4", link: "/active-directory/attacks/adds-attacks/esc4" },
              
            ]
          },

          // Privilege Escalation
          {
            text: "Privilege Escalation",
            collapsed: true,
            items: [
              { text: "ACL Abuse", link: "/active-directory/privesc/acl-abuse" },
              { text: "DCSync", link: "/active-directory/privesc/dcsync" },
              { text: "DCShadow", link: "/active-directory/privesc/dcshadow" }
            ]
          },

          // Lateral Movement
          {
            text: "Lateral Movement",
            collapsed: true,
            items: [
              { text: "Pass-the-Hash", link: "/active-directory/attacks/lateral-movement/pass-the-hash" },
              { text: "Pass-the-Ticket", link: "/active-directory/attacks/lateral-movement/pass-the-ticket" },
              { text: "WinRM", link: "/active-directory/attacks/lateral-movement/winrm" },
              { text: "PsExec", link: "/active-directory/attacks/lateral-movement/psexec" }
            ]
          },

          // Post-Exploitation
          {
            text: "Post Exploitation",
            collapsed: true,
            items: [
              { text: "Credential Dumping", link: "/post-exploitation/credential-dumping" },
              { text: "Mimikatz", link: "/post-exploitation/mimikatz" },
              { text: "Secretsdump", link: "/post-exploitation/secretsdump" },
              { text: "Pivoting", link: "/post-exploitation/pivoting" },
              { text: "Data Exfiltration", link: "/post-exploitation/data-exfiltration" }
            ]
          },

          // Persistence
          {
            text: "Persistence",
            collapsed: true,
            items: [
              { text: "Golden Ticket", link: "/active-directory/persistence/golden-ticket" },
              { text: "Silver Ticket", link: "/active-directory/persistence/silver-ticket" },
              { text: "SID History", link: "/active-directory/persistence/sid-history" }
            ]
          },

        ]
      },

            // Web Application
      {
        text: "Web",
        collapsed: true,
        items: [

        { text: "Methodology", link: "/web/web-methodology" },
        {
        text: "Vulnerabilities",
        collapsed: true,
        items: [
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

        {
        text: "OWASP Top 10",
        collapsed: true,
        items: [
        { text: "A01 Broken Access Control", link: "/web/owasp/a01-broken-access-control" },
        { text: "A02 Cryptographic Failures", link: "/web/owasp/a02-cryptographic-failures" },
        { text: "A03 Injection", link: "/web/owasp/a03-injection" },
        { text: "A04 Insecure Design", link: "/web/owasp/a04-insecure-design" },
        { text: "A05 Security Misconfiguration", link: "/web/owasp/a05-security-misconfiguration" },
        { text: "A06 Vulnerable Components", link: "/web/owasp/a06-vulnerable-components" },
        { text: "A07 Authentication Failures", link: "/web/owasp/a07-authentication-failures" },
        { text: "A08 Integrity Failures", link: "/web/owasp/a08-integrity-failures" },
        { text: "A09 Logging Failures", link: "/web/owasp/a09-logging-monitoring" },
        { text: "A10 SSRF", link: "/web/owasp/a10-ssrf" }
        ]
        }

        ]
        },    

      // Tools
      {
        text: "Tools",
        collapsed: true,
        items: [
          {
            text: "C2 Frameworks",
            collapsed: true,
            items: [
            { text: "Metasploit", link: "/tools/metasploit" },
            { text: "Sliver", link: "/tools/impacket" }
            ]
          },
          {
            text: "Active Directory",
            collapsed: true,
            items: [
            { text: "Nmap", link: "/tools/nmap" },
            { text: "NetExec", link: "/tools/netexec" },
            { text: "Impacket", link: "/tools/impacket" },
            { text: "BloodHound", link: "/tools/bloodhound" },
            { text: "Responder", link: "/tools/responder" }
            ]
          },

          {
            text: "Web Application",
            collapsed: true,
            items: [
              { text: "Nmap", link: "/tools/nmap" },
              { text: "Burpsuite", link: "/tools/burpsuite" },
              { text: "SqlMap", link: "/tools/sqlmap" },
              { text: "Gobuster", link: "/tools/gobuster" }
              ]
            },
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
          { text: "Web Cheatsheet", link: "/cheatsheets/web-cheatsheet" },
          { text: "Files Transfert", link: "/cheatsheets/files-transfer-cheatsheet" },
          { text: "Pivoting", link: "/cheatsheets/pivoting-cheatsheet" },
        ]
      }

     // add a new section here !
    ]
  }
}