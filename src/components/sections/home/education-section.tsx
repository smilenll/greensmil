import { ContentSection } from './content-section';

interface Education {
  institution: string;
  degree: string;
  period: string;
}

interface Certification {
  name: string;
}

const education: Education[] = [
  {
    institution: 'Telerik Academy',
    degree: 'Software Development Certification',
    period: 'January 2018 - February 2019',
  },
  {
    institution: 'Technical University of Varna',
    degree: "Bachelor's, Computer Science",
    period: 'September 2013 - September 2017',
  },
];

const certifications: Certification[] = [
  { name: 'Meta UI/UX' },
  { name: 'Meta React Advanced' },
  { name: 'Meta React Native' },
  { name: 'EU Operational Program - Software Development' },
];

export function EducationSection() {
  return (
    <ContentSection title="Education & Certifications" className="bg-muted/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <h4 className="font-medium">{edu.institution}</h4>
                <p className="text-sm text-muted-foreground">{edu.degree}</p>
                <p className="text-xs text-muted-foreground">{edu.period}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Certifications</h3>
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-primary rounded-full"></span>
                <span className="text-sm">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentSection>
  );
}
