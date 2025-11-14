import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Technology {
  name: string;
  logo: string;
  website?: string;
}

interface SkillCardProps {
  icon: string;
  title: string;
  technologies: Technology[];
}

export function SkillCard({ icon, title, technologies }: SkillCardProps) {
  return (
    <div className="p-6 rounded-lg  border border-border shadow-md">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-primary-foreground text-xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      <TooltipProvider>
        <div className="grid grid-cols-3 gap-4">
          {technologies.map((tech) => {
            const content = (
              <div className="flex flex-col items-center justify-center p-3 rounded-md border border-border/50 hover:border-primary/50 transition-colors">
                <div className="relative w-12 h-12">
                  <Image
                    src={tech.logo}
                    alt={tech.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="lg:hidden text-xs text-center mt-1">{tech.name}</p>
              </div>
            );

            return (
              <Tooltip key={tech.name}>
                <TooltipTrigger asChild>
                  {tech.website ? (
                    <a
                      href={tech.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={tech.name}
                      className="cursor-pointer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div id={tech.name}>{content}</div>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tech.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
