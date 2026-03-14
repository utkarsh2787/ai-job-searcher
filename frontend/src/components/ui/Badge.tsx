interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  size?:    'sm' | 'md';
}

const VARIANTS: Record<string, React.CSSProperties> = {
  default: { background: 'rgba(148,163,184,0.1)', color: '#94a3b8',  border: '1px solid rgba(148,163,184,0.2)' },
  blue:    { background: 'rgba(59,130,246,0.12)', color: '#60a5fa',  border: '1px solid rgba(59,130,246,0.3)'  },
  green:   { background: 'rgba(16,185,129,0.12)', color: '#34d399',  border: '1px solid rgba(16,185,129,0.3)'  },
  yellow:  { background: 'rgba(245,158,11,0.12)', color: '#fbbf24',  border: '1px solid rgba(245,158,11,0.3)'  },
  purple:  { background: 'rgba(124,58,237,0.12)', color: '#a78bfa',  border: '1px solid rgba(124,58,237,0.3)'  },
  gray:    { background: 'rgba(71,85,105,0.2)',   color: '#64748b',  border: '1px solid rgba(71,85,105,0.3)'   },
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZES[size]}`}
      style={VARIANTS[variant]}
    >
      {children}
    </span>
  );
}
