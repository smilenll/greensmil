import { ShowMoreText } from '@/components/ui/show-more-text';

interface RecommendationCardProps {
  name: string;
  title: string;
  relationship: string;
  date: string;
  text: string;
}

export function RecommendationCard({ name, title, relationship, date, text }: RecommendationCardProps) {
  return (
    <div className="bg-muted/30 p-6 rounded-lg shadow-md">
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {relationship} • {date}
        </p>
      </div>
      <ShowMoreText
        lineClamp={4}
        className="text-muted-foreground text-sm"
      >
        {text}
      </ShowMoreText>
    </div>
  );
}
