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
      { text: "Tools", link: "/tools/c2-frameworks" },
      { text: "Cheatsheets", link: "/cheatsheets/linux-cheatsheet" },
      { text: "Articles", link: "/writeups/tryhackme" },
      { text: "Writeups", link: "/writeups/tryhackme" }
    ],

    outline: "deep",

    footer: {
      message: "Hackers237 - Offensive Security Knowledge Base",
      copyright: "Copyright © 2026"
    },

    sidebar: [

      // Fundamentals / Methodologies
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

        ]
      },

      // Active Directory
      {
        text: "Active Directory",
        collapsed: true,
        items: [
          { text:"Active Directory Methodology", link: "/fundamentals/pentest-methodology" },
          { text: "Reconnaissance", link: "/active-directory/ad-recon" },
           // Enumeration
          {
            text: "Enumeration",
            collapsed: true,
            items: [
              { text: "SMB", link: "/enumeration/active-directory/smb" },
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
          { text: "Exploitation", link: "/active-directory/ad-exploitation" },
          { text: "Post Exploitation", link: "/active-directory/ad-post-exploitation" }
        ]
      },

      // Web Application
      {
        text: "Web",
        collapsed: true,
        items: [
          { text: "Web Methodology", link: "/fundamentals/pentest-methodology" },
          { text: "Reconnaissance", link: "/web/web-recon" },
          { text: "Enumeration", link: "/web/web-enumeration" },
          { text: "Exploitation", link: "/web/web-exploitation" },
          { text: "Post Exploitation", link: "/web/web-post-exploitation" },
          {
            text: "OWASP Top 10",
            collapsed: true,
            items: [
              { text: "Introduction", link: "/web/owasp-top-10" },
              { text: "A01 - Broken Access Control", link: "/web/owasp/a01-broken-access-control" },
              { text: "A02 - Cryptographic Failures", link: "/web/owasp/a02-cryptographic-failures" },
              { text: "A03 - Injection", link: "/web/owasp/a03-injection" },
              { text: "A04 - Insecure Design", link: "/web/owasp/a04-insecure-design" },
              { text: "A05 - Security Misconfiguration", link: "/web/owasp/a05-security-misconfiguration" },
              { text: "A06 - Vulnerable Components", link: "/web/owasp/a06-vulnerable-components" },
              { text: "A07 - Identification and Authentication Failures", link: "/web/owasp/a07-authentication-failures" },
              { text: "A08 - Software and Data Integrity Failures", link: "/web/owasp/a08-integrity-failures" },
              { text: "A09 - Security Logging and Monitoring Failures", link: "/web/owasp/a09-logging-monitoring" },
              { text: "A10 - Server-Side Request Forgery (SSRF)", link: "/web/owasp/a10-ssrf" }
            ]
          }
        ]
      },

      // Tools
      {
        text: "Tools",
        collapsed: true,
        items: [
          { text: "C2 Frameworks", link: "/tools/c2-frameworks" },
          { text: "Active Directory Tools", link: "/tools/ad-tools" },
          { text: "Web Application Tools", link: "/tools/web-tools" }
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

      // Writeups
      {
        text: "Writeups",
        collapsed: true,
        items: [
          { text: "TryHackMe", link: "/writeups/tryhackme" },
          { text: "HackTheBox", link: "/writeups/hackthebox" }
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