import { Link } from "react-router-dom";
import { Code2, Github, Twitter } from "lucide-react";

const footerLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Problems", to: "/problems" },
  { label: "Statistics", to: "/statistics" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
//   { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar border-t border-sidebar-border mt-auto">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
         
          {/* <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-sidebar-primary" />
            <span className="text-sm text-sidebar-foreground">
              © {currentYear} byteBin. All rights reserved.
            </span>
            <span className="text-xs text-sidebar-foreground/60 hidden sm:inline">
              v1.0.0
            </span>
          </div> */}

        

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

