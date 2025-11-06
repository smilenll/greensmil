import { ContentSection } from '@/components/sections';
import { ContactForm } from '@/components/forms';
import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="pt-20 pb-16">
      <ContentSection title="Contact Me">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-lg text-muted-foreground">
                Get in touch with me. I&apos;d love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <ContactForm />

              {/* Contact Information */}
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold">Get in touch</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-muted-foreground">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</p>

                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">Office</h4>
                      <p className="text-muted-foreground">
                        250 Pharr Rd NE<br />
                        Atlanta, GA 30305<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-medium mb-2">Response Time</h4>
                  <p className="text-muted-foreground text-sm">
                    We typically respond to all inquiries within 24 hours during business days.
                    For urgent matters, please call us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
      </ContentSection>
    </div>
  );
}