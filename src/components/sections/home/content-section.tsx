interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({
  title,
  children,
  className = ""
}: ContentSectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {title}
            </h2>
          )}
          <div className="prose prose-lg dark:prose-invert mx-auto">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}