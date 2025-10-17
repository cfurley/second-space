import { motion } from 'motion/react';
import { 
  Calendar, 
  CheckSquare, 
  Dumbbell, 
  UtensilsCrossed, 
  ShoppingBag, 
  Lightbulb,
  Image as ImageIcon,
  Video,
  FileText,
  Heart,
  Coffee,
  Package,
  Sparkles,
  ListTodo,
  Camera,
  Clipboard,
  Target,
  Palette,
  BookOpen,
  Music,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useMemo } from 'react';

const icons = [
  Calendar, CheckSquare, Dumbbell, UtensilsCrossed, ShoppingBag, Lightbulb,
  ImageIcon, Video, FileText, Heart, Coffee, Package, Sparkles, ListTodo,
  Camera, Clipboard, Target, Palette, BookOpen, Music, TrendingUp, Zap
];

interface FloatingIcon {
  Icon: typeof Calendar;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotate: number;
}

export default function AnimatedBackground() {
  const floatingIcons = useMemo<FloatingIcon[]>(() => {
    return Array.from({ length: 35 }, (_, i) => {
      const Icon = icons[Math.floor(Math.random() * icons.length)];
      return {
        Icon,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 24 + Math.random() * 32,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        opacity: 0.6 + Math.random() * 0.3,
        rotate: Math.random() * 360,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating Icons - rendered first with high z-index to be on top */}
      {floatingIcons.map((icon, index) => {
        const IconComponent = icon.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              color: 'rgba(255, 255, 255, 1)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
              strokeWidth: 2.5,
              zIndex: 10,
            }}
            animate={{
              x: [-80, 80, -80],
              y: [-60, 60, -60],
              rotate: [0, icon.rotate, 0],
            }}
            transition={{
              duration: icon.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: icon.delay,
            }}
          >
            <IconComponent size={icon.size} strokeWidth={2.5} />
          </motion.div>
        );
      })}      {/* Brighter colored orbs with random fade - more orbs */}
      {/* Purple orb - top left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          left: '5%',
          top: '15%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.4, 0.9, 0.6, 1, 0.5, 0.8],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
      />

      {/* Blue orb - bottom right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          right: '8%',
          bottom: '15%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.9, 1.05, 1],
          opacity: [0.6, 1, 0.5, 0.9, 0.7],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />

      {/* Pink orb - center */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '450px',
          height: '450px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.12) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          opacity: [0.5, 1, 0.6, 0.9, 0.7, 0.8],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
      />

      {/* Cyan orb - top right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          right: '15%',
          top: '10%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.15, 0.9, 1],
          opacity: [0.4, 0.85, 0.5, 0.95, 0.6],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />

      {/* Orange orb - bottom left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '380px',
          height: '380px',
          left: '10%',
          bottom: '10%',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.28) 0%, rgba(251, 146, 60, 0.1) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 0.95, 1.1, 1],
          opacity: [0.5, 0.9, 0.6, 1, 0.7],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />

      {/* Green orb - left center */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '350px',
          height: '350px',
          left: '20%',
          top: '45%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.1) 40%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, 35, -25, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.4, 0.8, 0.55, 0.95, 0.65],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      />
    </div>
  );
}
