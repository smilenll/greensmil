'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type PhotoAIAnalysis } from '@/types/photo';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface PhotoAIReportProps {
  analysis: PhotoAIAnalysis;
}

const ScoreIndicator = ({ score, label }: { score: number; label: string }) => {
  const getColor = (score: number) => {
    if (score >= 4.5) return 'from-green-500 to-emerald-600';
    if (score >= 4) return 'from-green-400 to-green-500';
    if (score >= 3) return 'from-yellow-400 to-orange-500';
    if (score >= 2) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  const getTextColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const percentage = (score / 5) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <div
              key={value}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                value <= score
                  ? `bg-gradient-to-r ${getColor(score)} shadow-sm`
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span className={`font-bold text-xl ${getTextColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor(score)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function PhotoAIReport({ analysis }: PhotoAIReportProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getOverallRating = (score: number) => {
    if (score >= 4.5) return { text: 'Outstanding', color: 'text-green-600 dark:text-green-400' };
    if (score >= 4) return { text: 'Excellent', color: 'text-green-500 dark:text-green-400' };
    if (score >= 3.5) return { text: 'Very Good', color: 'text-lime-600 dark:text-lime-400' };
    if (score >= 3) return { text: 'Good', color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 2.5) return { text: 'Fair', color: 'text-orange-600 dark:text-orange-400' };
    return { text: 'Needs Improvement', color: 'text-red-600 dark:text-red-400' };
  };

  const rating = getOverallRating(analysis.overall);

  return (
    <Card className="border-2 border-primary/50 shadow-lg bg-gradient-to-br from-background to-primary/5">
      {/* Collapsed Header - Always Visible */}
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">AI Photography Analysis</CardTitle>
              <CardDescription className="text-sm mt-1">
                Overall Score: <span className={`font-bold ${rating.color}`}>{analysis.overall.toFixed(1)}/5.0</span> · {rating.text}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            {isExpanded ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Details <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Overall Score Detail */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  {analysis.overall.toFixed(1)}
                </span>
                <span className="text-2xl text-muted-foreground">/5.0</span>
              </div>
              <div className={`text-lg font-semibold mt-1 ${rating.color}`}>
                {rating.text}
              </div>
            </div>
            <div className="text-6xl opacity-20">🏆</div>
          </div>

          {/* Category Cards */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {categories.map((category, index) => (
              <Card
                key={category.title}
                className="border-l-4 border-l-primary/50 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-2 bg-primary/10 rounded-lg">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{category.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScoreIndicator score={category.score} label={category.title} />
                  <div className="pl-3 border-l-2 border-muted">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.rationale}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
            <Sparkles className="h-3 w-3" />
            <span>Analysis powered by Claude 3 Haiku (Anthropic) via AWS Bedrock</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
