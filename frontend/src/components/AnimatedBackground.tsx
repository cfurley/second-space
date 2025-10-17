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
        size: 20 + Math.random() * 40,
        duration: 20 + Math.random() * 30,
        delay: Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.25,
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
      
      {/* Floating icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: `${item.x}vw`,
            y: `${item.y}vh`,
            rotate: item.rotate,
          }}
          animate={{
            x: [
              `${item.x}vw`,
              `${(item.x + 20) % 100}vw`,
              `${(item.x + 10) % 100}vw`,
              `${item.x}vw`,
            ],
            y: [
              `${item.y}vh`,
              `${(item.y - 20 + 100) % 100}vh`,
              `${(item.y + 10) % 100}vh`,
              `${item.y}vh`,
            ],
            rotate: [item.rotate, item.rotate + 180, item.rotate + 360],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            opacity: item.opacity,
          }}
        >
          <item.Icon
            size={item.size}
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              filter: 'blur(0.3px) drop-shadow(0 0 12px rgba(255, 255, 255, 0.3))',
              strokeWidth: 1.5,
            }}
          />
        </motion.div>
      ))}

      {/* Subtle glass orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '600px',
          height: '600px',
          left: '10%',
          top: '20%',
          background: 'radial-gradient(circle, rgba(122, 122, 122, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
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
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
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
          background: 'radial-gradient(circle, rgba(29, 29, 29, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
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
