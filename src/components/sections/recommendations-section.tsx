import { ContentSection } from './home/content-section';
import { RecommendationCard } from '@/components/ui/recommendation-card';

interface Recommendation {
  name: string;
  title: string;
  relationship: string;
  date: string;
  text: string;
}

const recommendations: Recommendation[] = [
  {
    name: 'Elizabeth Morales-Ramos, MBA',
    title: 'Director of Operations @ Linville Law Group | MBA, Legal Administration',
    relationship: 'Elizabeth was senior to Smilen but didn\'t manage Smilen directly',
    date: 'October 1, 2025',
    text: 'I had the opportunity to bring Smilen onto our team at Linville Law Group when we identified the need for deeper Salesforce development expertise. As the Director of Operations, I oversee the firm\'s broader operations, and Smilen has been working closely under our Director of Data, Jaclyn, to ensure our database and Salesforce environment run efficiently and remain compliant.\n\nFrom day one, Smilen impressed us with his attention to detail and strong problem-solving skills. He has played a key role in integrating Salesforce with our vendors, supporting them in navigating the Salesforce API, and creating clear documentation that has greatly improved the ease of our integrations. Beyond that, he has strengthened our system reliability by developing backup and management strategies, improved API security, and supported version updates with careful test refactoring.\n\nWhat I appreciate most is that Smilen doesn\'t just deliver "quick fixes." He takes the time to understand the larger picture, which has helped us better identify our long-term needs. Thanks to his contributions, we\'ve made significant improvements that go beyond incremental updates and move us toward long-term progress.\n\nSmilen is not only technically skilled but also collaborative, reliable, and forward-thinking. He would be a tremendous asset to any team looking to go beyond surface-level improvements and make meaningful strides in Salesforce development.',
  },
  {
    name: 'Trey Hoover',
    title: 'Architect @ Dermatic Health',
    relationship: 'Trey managed Smilen directly',
    date: 'January 15, 2025',
    text: 'I had the pleasure of working with Smilen at Dermatic Health and was consistently impressed by his dedication and accountability. His thoughtfulness and attention to detail were evident in every solution he delivered.\n\nSmilen is proactive and always eager to grow—whether by learning new skills or stepping in to tackle challenges before they become issues. His initiative and strong work ethic made a significant impact on our team\'s success.\n\nBeyond his technical expertise, Smilen\'s positive attitude and collaborative approach make him a fantastic teammate. I highly recommend him to any team looking for a driven and solutions-oriented professional.',
  },
  {
    name: 'Martin Antonov',
    title: 'Mathematician and Frontend Architect',
    relationship: 'Martin managed Smilen directly',
    date: 'June 15, 2022',
    text: 'Smilen is an extremely reliable and hard-working developer. He takes on the most difficult of tasks, works quickly and efficiently and produces clean code. It has always been a pleasure, having him on team!',
  },
];

export function RecommendationsSection() {
  return (
    <ContentSection title="Recommendations">
      <div className="space-y-8 max-w-4xl mx-auto">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={index}
            name={rec.name}
            title={rec.title}
            relationship={rec.relationship}
            date={rec.date}
            text={rec.text}
          />
        ))}
      </div>
    </ContentSection>
  );
}
