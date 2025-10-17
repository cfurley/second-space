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
        duration: 20 + Math.random() * 30,
        delay: Math.random() * 10,
        opacity: 0.6 + Math.random() * 0.3,
        rotate: Math.random() * 360,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Dark overlay for deeper background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(29, 29, 29, 0.6) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(122, 122, 122, 0.5) 0%, transparent 50%)',
        }}
      />
      
      {/* Floating Icons - with higher z-index to appear above orbs */}
      {floatingIcons.map((icon, index) => {
        const IconComponent = icon.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: icon.x,
              y: icon.y,
            }}
            animate={{
              x: [icon.x, icon.x + (Math.random() - 0.5) * 100, icon.x],
              y: [icon.y, icon.y + (Math.random() - 0.5) * 100, icon.y],
              rotate: [0, icon.rotate, 0],
            }}
            transition={{
              duration: icon.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              color: 'rgba(255, 255, 255, 1)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
              strokeWidth: 2.5,
              zIndex: 10,
            }}
          >
            <IconComponent size={icon.size} strokeWidth={2.5} />
          </motion.div>
        );
      })}      {/* Subtle glass orbs - reduced opacity so icons show through */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          left: '10%',
          top: '20%',
          background: 'radial-gradient(circle, rgba(122, 122, 122, 0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          right: '10%',
          bottom: '20%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Additional accent orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(29, 29, 29, 0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
