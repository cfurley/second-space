import react from 'react';
export function GlassCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="*
          bg-card
          border border-border
          rounded-x1
          shadow-lg
          p-4
          hover:shadow-xl
          transition
          duration-300
          hover:scale-[1.02]  
          ">
        {children}
        </div>
    );
    }