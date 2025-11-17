'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoAIAnalysis } from '@/actions/photo-actions';

interface PhotoAIReportProps {
  analysis: PhotoAIAnalysis;
}

const ScoreIndicator = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <div
          key={value}
          className={`h-3 w-3 rounded-full ${
            value <= score ? getColor(score) : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
      <span className="ml-2 font-semibold text-lg">{score}/5</span>
    </div>
  );
};

export function PhotoAIReport({ analysis }: PhotoAIReportProps) {
  const categories = [
    {
      title: 'Composition',
      icon: '🎨',
      score: analysis.composition.score,
      rationale: analysis.composition.rationale,
      description: 'Rule of thirds, leading lines, balance, framing, and symmetry',
    },
    {
      title: 'Lighting & Exposure',
      icon: '💡',
      score: analysis.lighting.score,
      rationale: analysis.lighting.rationale,
      description: 'Natural or artificial light handling and overall exposure',
    },
    {
      title: 'Subject & Storytelling',
      icon: '📖',
      score: analysis.subject.score,
      rationale: analysis.subject.rationale,
      description: 'Narrative communication and emotional impact',
    },
    {
      title: 'Technical Quality',
      icon: '⚙️',
      score: analysis.technical.score,
      rationale: analysis.technical.rationale,
      description: 'Sharpness, focus, resolution, and absence of artifacts',
    },
    {
      title: 'Creativity & Originality',
      icon: '✨',
      score: analysis.creativity.score,
      rationale: analysis.creativity.rationale,
      description: 'Unique angle, perspective, and conceptual approach',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🤖 AI Photography Analysis
          </CardTitle>
          <CardDescription>
            Professional assessment based on 5 essential photography principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
            <div className="text-4xl font-bold text-primary">
              {analysis.overall.toFixed(1)}
            </div>
            <div>
              <div className="font-semibold text-lg">Overall Score</div>
              <div className="text-sm text-muted-foreground">
                Average of all categories
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScoreIndicator score={category.score} />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.rationale}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            Analysis powered by Claude AI (Anthropic) via AWS Bedrock
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
