import { ContentSection } from './content-section';

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  responsibilities: string[];
}

const experiences: Experience[] = [
  {
    title: 'Full Stack Developer',
    company: 'Dermatic Health',
    location: 'Boston, MA, USA',
    period: 'June 2024 - July 2025',
    responsibilities: [
      'Building mobile and web apps from UI designs, ensuring smooth user experience',
      'Integrating third-party identity APIs to authenticate and manage users, groups, and permissions',
      'Owning a core system enabling users to create complex custom forms for data collection',
      'Developing APIs to manage data and automate workflows effectively',
      'Migrating to React Native, enhancing mobile performance and UX',
    ],
  },
  {
    title: 'Senior Fullstack Developer',
    company: 'AtScale',
    location: 'Boston, MA, USA',
    period: 'February 2019 - May 2024',
    responsibilities: [
      'Owning core integration tools, connecting AtScale and third-party systems',
      'Creating test plans and implementing automated tests to enable CI/CD workflows',
      'Acting as Deputy Team Leader, leading Agile ceremonies and mentoring junior developers',
      'Collaborating cross-functionally with Engineering, DevOps, QA, and Data Science teams',
    ],
  },
  {
    title: 'Full Stack Developer',
    company: 'Next-Stream',
    location: 'Sofia, Bulgaria',
    period: 'January 2017 - September 2018',
    responsibilities: [
      'Developing data APIs and optimizing system structure',
      'Reduced build time by 15% through system deployment distribution',
      'Integrating external services',
    ],
  },
  {
    title: 'Co-founder & Full Stack Developer',
    company: 'Web4U',
    location: 'Sofia, Bulgaria',
    period: 'October 2017 - December 2023',
    responsibilities: [
      'Building a user-friendly client-side interfaces for 10+ projects',
      'Developing eCommerce web applications and CRMs using the MVC design pattern',
      'Participating in project planning and estimations',
      'Communicating with clients',
      'Designing front-end, back-end, and databases',
    ],
  },
];

export function ExperienceSection() {
  return (
    <ContentSection title="Professional Experience">
      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <div key={index} className="border-l-4 border-primary pl-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
              <h3 className="text-xl font-semibold">{exp.title}</h3>
              <span className="text-sm text-muted-foreground">{exp.period}</span>
            </div>
            <p className="text-primary font-medium mb-3">
              {exp.company} - {exp.location}
            </p>
            <ul className="text-muted-foreground space-y-1 text-sm list-disc list-inside">
              {exp.responsibilities.map((responsibility, idx) => (
                <li key={idx}>{responsibility}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ContentSection>
  );
}
