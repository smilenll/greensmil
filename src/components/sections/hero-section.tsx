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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-test="hero-section">
      {/* Blurred Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/green.jpeg"
          alt=""
          fill
          className="object-cover scale-110"
          style={{
            filter: 'blur(100px)',
          }}
          priority
        />
        {/* Green overlay for better text readability while keeping green tone */}
        <div className="absolute inset-0 bg-emerald-950/30" />
        {/* Gradient fade to background at bottom */}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Badge/Logo */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
            {/* Blurred background version of the profile image */}
            <div className="absolute inset-0 -z-10">
              <Image
                src="/GreenSMiL.png"
                alt=""
                fill
                className="rounded-full object-cover scale-150 opacity-30"
                style={{
                  filter: 'blur(40px)',
                }}
              />
            </div>
            {/* Main profile image */}
            <Image
              src="/GreenSMiL.png"
              alt="Smilen Lyubenov"
              fill
              className="rounded-full object-cover ring-4"
              priority
            />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg">
              {title}
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 drop-shadow-md">
            {subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto min-w-[200px] shadow-2xl">
              <a href={primaryAction.href} className="flex items-center justify-center gap-2">
                <span>{primaryAction.text}</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto min-w-[200px] shadow-2xl bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 text-white">
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
