import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'grid' | 'solid' | 'gradient';
}

export default function Section({ children, className, id, background = 'solid' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-20',
        // Removed backgrounds - only space background visible
        className
      )}
    >
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
