import { ContentSection } from "./content-section";

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  responsibilities: string[];
}

const experiences: Experience[] = [
  {
    title: "Full Stack Developer",
    company: "Dermatic Health",
    location: "Boston, MA, USA",
    period: "June 2024 - April 2025",
    responsibilities: [
      "Delivered 60% of codebase for three client applications built from scratch, ensuring smooth user experience.",
      "Developed 50% of backend APIs and integrated third-party identity provider for secure authentication.",
      "Owned and enhanced core system enabling users to create complex custom forms for efficient data collection.",
      "Researched and developed appropriate technologies to optimize app functionality and scalability.",
      "Integrated AI-generated reports into frontend, enhancing data insights for users.",
      "Led migration to React Native, boosting mobile app performance and user engagement.",
      "Collaborated with architects, data scientists, and product managers to ensure high-quality application delivery.",
    ],
  },
  {
    title: "Senior Fullstack Developer",
    company: "AtScale",
    location: "Boston, MA, USA",
    period: "February 2020 - May 2024",
    responsibilities: [
      "Owned core integration tools connecting AtScale and third-party systems for seamless data communication.",
      "Maintained and optimized backend functionality, improving system responsiveness by 20%.",
      "Performed database maintenance and migrations using ORM frameworks, enhancing data reliability.",
      "Led code reviews, improved workflows, and mentored junior developers.",
      "Partnered with Product Owners and managers to translate requirements into technical features.",
      "Collaborating cross-functionally with Engineering, DevOps, QA, and Data Science teams",
      "Acted as Deputy Team Leader, ensuring uninterrupted project delivery during leadership absences.",
      "Facilitated Agile ceremonies, driving team coordination and sprint success.",
    ],
  },
  {
    title: "Full Stack Developer",
    company: "IOIO.tv",
    location: "Sofia, Bulgaria",
    period: "January 2018 - September 2019",
    responsibilities: [
      "Developed robust data APIs improving data throughput efficiency.",
      "Reduced build time by 15% through system deployment optimization and distribution.",
      "Integrated multiple external services to extend system capabilities.",
    ],
  },
  {
    title: "Co-founder & Full Stack Developer",
    company: "Web4U",
    location: "Sofia, Bulgaria",
    period: "October 2017 - December 2023",
    responsibilities: [
      "Developed user-friendly web apps for over 10 projects, emphasizing usability and performance.",
      "Designed and implemented scalable front-end, back-end, and database solutions.",
      "Built eCommerce platforms and CRMs using MVC design patterns.",
      "Contributed to project planning, estimations, and client communication.",
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
              <span className="text-sm text-muted-foreground">
                {exp.period}
              </span>
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
