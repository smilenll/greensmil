import { ContentSection } from './content-section';
import { AdminSection } from './admin-section';

export function ContactSection() {
  return (
    <ContentSection>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Let&apos;s Work Together</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Based in Atlanta, GA. Available for full-time opportunities and consulting projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-primary hover:underline">
            📧 {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>
        </div>

        {/* Admin-only section */}
        <div className="mt-12">
          <AdminSection />
        </div>
      </div>
    </ContentSection>
  );
}
