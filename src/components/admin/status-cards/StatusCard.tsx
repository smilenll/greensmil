import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const statusCardVariants = cva(
  'p-6 rounded-lg border',
  {
    variants: {
      variant: {
        success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
        destructive: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
        default: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        secondary: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type StatusVariant = VariantProps<typeof statusCardVariants>['variant'];


export interface StatusCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: StatusVariant;
  subtitle?: string;
  className?: string;
}

export function StatusCard({ title, value, icon, variant = 'default', subtitle, className }: StatusCardProps) {
  return (
    <div className={cn(statusCardVariants({ variant }), className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="text-4xl font-bold">
        {value}
      </div>
    </div>
  );
}
