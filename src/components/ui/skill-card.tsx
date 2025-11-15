import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { statusCardVariants, type StatusVariant } from "@/components/admin/status-cards/StatusCard";
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
  icon: ReactNode;
  title: string;
  technologies: Technology[];
  variant?: StatusVariant;
  className?: string;
}

export function SkillCard({ icon, title, technologies, variant = 'default', className }: SkillCardProps) {
  return (
    <div className={cn(statusCardVariants({ variant }), className)}>
      <div className="flex items-center justify-center mb-4">
        <div className="flex flex-col items-center gap-3">
          {icon}
          <div>
            <h4 className="text-lg font-medium">{title}</h4>
          </div>
        </div>
      </div>
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
