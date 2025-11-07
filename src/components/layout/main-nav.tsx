'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTrigger, NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from '@/components/ui';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from '@/app/auth';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Photography', href: '/photography' },
  { name: 'Contact Me', href: '/contact' },
];

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background when scrolled
      setIsScrolled(currentScrollY > 10);

      // Hide/show navigation based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navigationClass = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
    {
      'transform -translate-y-full': !isVisible,
      'bg-background/80 backdrop-blur-md border-b border-border': isScrolled,
      'bg-transparent': !isScrolled,
    }
  );

  return (
    <header className={navigationClass}>
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo - Left side with fixed width */}
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center space-x-2" data-test="site-logo">
            <Image
              src="/GreenSMiL.png"
              alt="SmiL Logo"
              width={48}
              height={48}
              className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex space-x-6">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            {/* Admin Section */}
            {isAuthenticated && isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/admin"
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      pathname === '/admin'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                  >
                    Admin
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Actions - Right side with fixed width matching left */}
        <div className="hidden md:flex items-center space-x-2 flex-1 justify-end">
          <ThemeToggle data-test="theme-toggle" />
          <UserMenu />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle data-test="theme-toggle-mobile" />
          <UserMenu />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" data-test="mobile-menu-button">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]" data-test="mobile-menu">
              <div className="flex flex-col space-y-4 mt-6" data-test="mobile-nav-items">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                    data-test={`mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Admin Section */}
                {isAuthenticated && isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      pathname === '/admin'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
                    )}
                    data-test="mobile-nav-admin"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}