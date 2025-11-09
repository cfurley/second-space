import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MemoryCard {
  id: string;
  type: 'image' | 'text' | 'link';
  content: any;
  x: number;
  y: number;
  importance: number; // 0-1, affects size and glow
  connections: string[]; // IDs of connected cards
  timestamp: Date;
}

interface NeuralMemoryGridProps {
  memories: MemoryCard[];
  onCardClick?: (card: MemoryCard) => void;
}

export function NeuralMemoryGrid({ memories, onCardClick }: NeuralMemoryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate organic positions (neural network style)
  const getCardPosition = (index: number, total: number) => {
    // Spiral pattern with randomness for organic feel
    const angle = index * (Math.PI * 2 / total) * 3;
    const radius = 150 + (index % 3) * 100;
    const randomOffset = {
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80
    };
    
    return {
      x: Math.cos(angle) * radius + randomOffset.x,
      y: Math.sin(angle) * radius + randomOffset.y
    };
  };

  // Calculate card size based on importance
  const getCardSize = (importance: number) => {
    return 150 + importance * 100; // 150-250px
  };

  // Draw connections between cards
  const renderConnections = () => {
    return memories.flatMap((card) =>
      card.connections.map((connId) => {
        const connectedCard = memories.find((m) => m.id === connId);
        if (!connectedCard) return null;

        const isHighlighted = hoveredCard === card.id || hoveredCard === connId;
        
        return (
          <motion.line
            key={`${card.id}-${connId}`}
            x1={card.x + getCardSize(card.importance) / 2}
            y1={card.y + getCardSize(card.importance) / 2}
            x2={connectedCard.x + getCardSize(connectedCard.importance) / 2}
            y2={connectedCard.y + getCardSize(connectedCard.importance) / 2}
            stroke={isHighlighted ? '#60a5fa' : '#ffffff'}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeOpacity={isHighlighted ? 0.6 : 0.2}
            strokeDasharray={isHighlighted ? '0' : '5,5'}
            animate={{
              strokeOpacity: isHighlighted ? [0.4, 0.8, 0.4] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: isHighlighted ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        );
      })
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Connection lines layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {renderConnections()}
      </svg>

      {/* Cards layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(50%, 50%)`,
          zIndex: 2,
        }}
      >
        {memories.map((card, index) => {
          const size = getCardSize(card.importance);
          const isHovered = hoveredCard === card.id;
          const isConnected = memories.some(
            (m) => hoveredCard === m.id && m.connections.includes(card.id)
          );

          return (
            <motion.div
              key={card.id}
              className="absolute cursor-pointer group"
              style={{
                left: card.x,
                top: card.y,
                width: size,
                height: size,
                transformOrigin: 'center center',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: 1,
                z: isHovered ? 50 : 0,
              }}
              whileHover={{
                scale: 1.15,
                z: 100,
                transition: { duration: 0.2 },
              }}
              transition={{
                delay: index * 0.05,
                duration: 0.5,
                type: 'spring',
              }}
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => onCardClick?.(card)}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, rgba(96, 165, 250, ${card.importance}) 0%, transparent 70%)`,
                  transform: 'scale(1.2)',
                }}
              />

              {/* Pulsing importance indicator */}
              {card.importance > 0.7 && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-blue-500"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Card content */}
              <div
                className={`relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isHovered || isConnected
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/50'
                    : 'border-white/20 shadow-lg'
                }`}
                style={{
                  background: 'rgba(10, 10, 10, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {card.type === 'image' && (
                  <img
                    src={card.content.image}
                    alt={card.content.title}
                    className="w-full h-full object-cover"
                  />
                )}

                {card.type === 'text' && (
                  <div className="p-4 flex items-center justify-center text-center">
                    <p className="text-white/90 text-sm line-clamp-6">
                      {card.content.text}
                    </p>
                  </div>
                )}

                {card.type === 'link' && (
                  <div className="p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl mb-2">??</div>
                    <p className="text-white font-medium text-sm mb-1">
                      {card.content.title}
                    </p>
                    <p className="text-white/50 text-xs">{card.content.domain}</p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="text-white text-xs">
                    <p className="font-medium mb-1">
                      {card.type === 'image' && card.content.title}
                      {card.type === 'text' && 'Note'}
                      {card.type === 'link' && card.content.title}
                    </p>
                    <p className="text-white/50">{card.timestamp.toLocaleDateString()}</p>
                    {card.connections.length > 0 && (
                      <p className="text-blue-400 text-xs mt-1">
                        {card.connections.length} connection{card.connections.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Connection nodes */}
              {card.connections.length > 0 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    {card.connections.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-500 opacity-50"
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
