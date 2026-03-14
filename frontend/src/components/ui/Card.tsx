interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   'sm' | 'md' | 'lg';
  glow?:      boolean;
}

const PADDING = { sm: 'p-3', md: 'p-5', lg: 'p-6' };

export function Card({ children, className = '', padding = 'md', glow = false }: CardProps) {
  return (
    <div
      className={`card-dark ${PADDING[padding]} ${className}`}
      style={glow ? { boxShadow: '0 0 30px rgba(0,212,255,0.07)' } : undefined}
    >
      {children}
    </div>
  );
}
