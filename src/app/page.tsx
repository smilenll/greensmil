import {
  HeroSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  RecommendationsSection,
  ContactSection,
} from '@/components/sections';

export default function PortfolioPage() {
  return (
    <>
      <HeroSection
        title="Smilen Lyubenov"
        subtitle="Full Stack Developer"
        description="Full-stack developer with experience in startup, product, and service companies. Skilled in visualizing complex data, optimizing system performance, and maintaining scalable architecture. Strong background in team collaboration, project planning, and mentoring."
        primaryAction={{ text: "Contact Me", href: `/contact`}}
        secondaryAction={{ text: "LinkedIn", href: "https://linkedin.com/in/smilenll/" }}
      />

      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <RecommendationsSection />
      <ContactSection />
    </>
  );
}