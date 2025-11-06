import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const footerLinks = {
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'LinkedIn', href: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/in/smilenll', icon: Linkedin },
  { name: 'GitHub', href: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/smilenll', icon: Github },
  { name: 'Email', href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`, icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Logo and Description */}
          <div className="max-w-md">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/GreenSMiL.png"
                alt="SmiL Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="font-bold text-lg">SmiL</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Creating innovative digital solutions with passion and expertise.
              Transforming ideas into exceptional web experiences.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-muted-foreground text-sm">
            <span>Crafted with</span>
            <Heart className="h-4 w-4 mx-1 text-green-800" />
            <span>by SmiL</span>
          </div>

          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SmiL. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}