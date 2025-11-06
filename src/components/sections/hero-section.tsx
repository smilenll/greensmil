import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import Image from 'next/image';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
}

export function HeroSection({
  title = "Welcome to SmiL",
  subtitle = "Build amazing experiences with modern technology",
  description = "Create stunning web applications with our cutting-edge platform. Fast, secure, and scalable solutions for your business needs.",
  primaryAction = { text: "Get Started", href: "/contact" },
  secondaryAction = { text: "Learn More", href: "#features" }
}: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20" data-test="hero-section">
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Badge/Logo */}
          <Image
            src="/GreenSMiL.png"
            alt="Smilen Lyubenov"
            width={160}
            height={160}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto"
            priority
          />

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground">
            {subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed ">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto min-w-[200px]">
              <a href={primaryAction.href} className="flex items-center justify-center gap-2">
                <span>{primaryAction.text}</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto min-w-[200px]">
              <a href={secondaryAction.href} className="flex items-center justify-center gap-2">
                <PlayCircle className="h-5 w-5" />
                <span>{secondaryAction.text}</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
