export default {
  title: "The H@ckers 237",
  description: "Pentesting & Offensive Security Wiki",
  base: "/The-Hackers-237/",
  appearance: true,

  themeConfig: {

    search: {
      provider: "local"
    },

    socialLinks: [
    { icon: 'github', link: 'https://github.com/Hackthus/The-Hackers-237' }
    ],

    nav: [
      { text: "Home", link: "/" },
      { text: "Fundamentals", link: "/fundamentals/linux-basics" },
      { text: "Active Directory", link: "/active-directory/ad-recon" },
      { text: "Web", link: "/web/web-recon" },
      { text: "Cheatsheets", link: "/cheatsheets/linux-cheatsheet" },
      { text: "Articles", link: "/writeups/tryhackme" } 
    ],

    outline: "deep",

    footer: {
      message: "Hackers237 - Offensive Security Knowledge Base",
      copyright: "Copyright © 2026"
    },

    sidebar: [

      // Methodologies
      {
        text: "Pentesting Methodology",
        collapsed: true,
        items: [
          { text: "AD Methodology", link: "/tools/web-tools" },
          { text: "Web Methodology", link: "/web/web-methodology" },
        ]
      },
      // Fundamentals 
      {
        text: "Fundamentals",
        collapsed: false,
        items: [
          { text: "Networking Basics", link: "/fundamentals/networking-basics" },
          { text: "Linux Basics", link: "/fundamentals/linux-basics" },
          { text: "Windows Basics", link: "/fundamentals/windows-basics" },
          { text: "MacOS Basics", link: "/fundamentals/macos-basics" },
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
              { text: "Rustscan", link: "/scanning/rustscan" },
              { text: "Service Detection", link: "/scanning/service-detection" },
              { text: "Vulnerability Scanning", link: "/scanning/vuln-scanning" },
              { text: "Banner Grabbing", link: "/scanning/banner-grabbing" }
            ]
          },

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

        ]
      },

      // Active Directory
      {
        text: "Active Directory",
        collapsed: true,
        items: [

          { text: "Introduction", link: "/active-directory/ad-intro" },

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
              { text: "ASREPRoasting", link: "/active-directory/attacks/asreproasting" },
              { text: "Kerberoasting", link: "/active-directory/attacks/kerberoasting" },
              { text: "Password Spraying", link: "/active-directory/attacks/password-spraying" }
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
              { text: "Pass-the-Hash", link: "/active-directory/lateral-movement/pass-the-hash" },
              { text: "Pass-the-Ticket", link: "/active-directory/lateral-movement/pass-the-ticket" },
              { text: "WinRM", link: "/active-directory/lateral-movement/winrm" },
              { text: "PsExec", link: "/active-directory/lateral-movement/psexec" }
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

          // Defense
          {
            text: "Detection & Defense",
            collapsed: true,
            items: [
              { text: "Detection", link: "/active-directory/defense/detection" },
              { text: "Mitigation", link: "/active-directory/defense/mitigation" }
            ]
          }
        ]
      },

      // Web Application
      {
        text: "Web",
        collapsed: true,
        items: [

        {
        text: "Vulnerabilities",
        collapsed: true,
        items: [
        { text: "SQL Injection", link: "/web/sqli" },
        { text: "XSS", link: "/web/xss" },
        { text: "File Upload", link: "/web/file-upload" },
        { text: "LFI", link: "/web/lfi" },
        { text: "RFI", link: "/web/rfi" },
        { text: "SSRF", link: "/web/ssrf" },
        { text: "Command Injection", link: "/web/command-injection" }
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
            { text: "NetExec", link: "/tools/burpsuite" },
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
              { text: "SqlMap", link: "/tools/sqlmap" },
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
          { text: "MacOS Cheatsheet", link: "/cheatsheets/macos-cheatsheet" }
        ]
      },

       // Articles
      {
        text: "Articles",
        collapsed: true,
        items: [
          { text: "Active Directory", link: "/writeups/tryhackme" },
          { text: "Web", link: "/writeups/hackthebox" },
          { text: "Linux", link: "/writeups/tryhackme" },
          { text: "Windows", link: "/writeups/hackthebox" },
          { text: "MacOS", link: "/writeups/hackthebox" }
        ]
      },

      { text: "Contribution", link: "/writeups/tryhackme" }
         

    ]
  }
}