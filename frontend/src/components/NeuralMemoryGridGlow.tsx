import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Edit3, Image as ImageIcon, Video, Type, X, Save, Plus } from 'lucide-react';

interface MemoryCard {
  id: string;
  type: 'image' | 'video' | 'text' | 'mixed';
  content: {
    title: string;
    description?: string;
    images?: string[];
    videos?: string[];
    text?: string;
    tags?: string[];
  };
  x: number;
  y: number;
  importance: number;
  connections: string[];
  timestamp: Date;
  isSelected?: boolean;
}

interface NeuralMemoryGridProps {
  memories: MemoryCard[];
  onCardClick?: (card: MemoryCard) => void;
  onCardUpdate?: (cardId: string, updates: Partial<MemoryCard>) => void;
  onCardAdd?: (newCard: Omit<MemoryCard, 'id'>) => void;
}

export function NeuralMemoryGrid({
  memories,
  onCardClick,
  onCardUpdate,
  onCardAdd
}: NeuralMemoryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<MemoryCard['content']>>({});
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

  // Generate organic positions (neural network style) - SPREAD OUT MORE
  const getCardPosition = (index: number, total: number) => {
    const angle = index * (Math.PI * 2 / total) * 2.5; // More spread
    const radius = 250 + (index % 5) * 120; // LARGER radius for more spread
    const randomOffset = {
      x: (Math.random() - 0.5) * 150, // MORE random offset
      y: (Math.random() - 0.5) * 150
    };

    return {
      x: Math.cos(angle) * radius + randomOffset.x,
      y: Math.sin(angle) * radius + randomOffset.y
    };
  };

  // Calculate card size based on importance - MAKE MUCH SMALLER (STAR-LIKE)
  const getCardSize = (importance: number) => {
    return 60 + importance * 40; // SMALLER: 60-100px instead of 150-250px
  };

  // Draw connections between cards - MAKE MORE PROMINENT
  const renderConnections = () => {
    return memories.flatMap((card) =>
      card.connections.map((connId) => {
        const connectedCard = memories.find((m) => m.id === connId);
        if (!connectedCard) return null;

        const isHighlighted = hoveredCard === card.id || hoveredCard === connId || selectedCard === card.id || selectedCard === connId;

        return (
          <motion.line
            key={`${card.id}-${connId}`}
            x1={card.x + getCardSize(card.importance) / 2}
            y1={card.y + getCardSize(card.importance) / 2}
            x2={connectedCard.x + getCardSize(connectedCard.importance) / 2}
            y2={connectedCard.y + getCardSize(connectedCard.importance) / 2}
            stroke={isHighlighted ? '#FFD700' : '#87CEEB'} // GOLD and SKY BLUE
            strokeWidth={isHighlighted ? 4 : 2} // EVEN THICKER
            strokeOpacity={isHighlighted ? 0.9 : 0.6} // MORE visible
            strokeDasharray={isHighlighted ? '0' : '12,6'} // LARGER dashes
            filter="url(#glow)" // ADD glow effect
            animate={{
              strokeOpacity: isHighlighted ? [0.7, 1, 0.7] : 0.6,
              strokeWidth: isHighlighted ? [3, 5, 3] : 2, // MORE pulsing
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

  const handleCardClick = (card: MemoryCard) => {
    if (selectedCard === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card.id);
      onCardClick?.(card);
    }
  };

  const handleEditStart = (card: MemoryCard) => {
    setEditingCard(card.id);
    setEditData(card.content);
  };

  const handleEditSave = () => {
    if (editingCard && onCardUpdate) {
      onCardUpdate(editingCard, { content: editData });
    }
    setEditingCard(null);
    setEditData({});
  };

  const handleEditCancel = () => {
    setEditingCard(null);
    setEditData({});
  };

  const handleAddMedia = (type: 'image' | 'video' | 'text') => {
    if (!editingCard) return;

    const input = document.createElement('input');
    input.type = type === 'image' || type === 'video' ? 'file' : 'text';
    input.multiple = type === 'image' || type === 'video';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'text/plain';

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const urls = Array.from(files).map(file => URL.createObjectURL(file));
        setEditData(prev => ({
          ...prev,
          [type === 'image' ? 'images' : type === 'video' ? 'videos' : 'text']:
            type === 'text' ? (e.target as HTMLInputElement).value :
            [...(prev[type === 'image' ? 'images' : 'videos'] || []), ...urls]
        }));
      }
    };

    input.click();
  };

  const renderCardContent = (card: MemoryCard) => {
    if (editingCard === card.id) {
      return (
        <div className="p-2 space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={editData.title || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
          />
          <textarea
            placeholder="Description"
            value={editData.description || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs resize-none"
            rows={2}
          />

          <div className="flex gap-1">
            <button onClick={() => handleAddMedia('image')} className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded text-xs">
              <ImageIcon size={10} /> Image
            </button>
            <button onClick={() => handleAddMedia('video')} className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs">
              <Video size={10} /> Video
            </button>
            <button onClick={() => handleAddMedia('text')} className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-xs">
              <Type size={10} /> Text
            </button>
          </div>

          <div className="flex gap-1">
            <button onClick={handleEditSave} className="flex items-center gap-1 px-2 py-1 bg-green-500 rounded text-xs">
              <Save size={10} /> Save
            </button>
            <button onClick={handleEditCancel} className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded text-xs">
              <X size={10} /> Cancel
            </button>
          </div>
        </div>
      );
    }

    // Display mode - ILLUMINATED STAR APPEARANCE (no logo, just glow)
    return (
      <div className="p-2 text-center relative">
        {/* ILLUMINATED CORE - Bright center */}
        <motion.div
          className="w-4 h-4 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full mx-auto mb-1 shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
            boxShadow: [
              '0 0 10px rgba(255, 215, 0, 0.5)',
              '0 0 20px rgba(255, 215, 0, 0.8)',
              '0 0 10px rgba(255, 215, 0, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <h3 className="text-white font-medium text-xs truncate">{card.content.title}</h3>
        {card.content.tags && card.content.tags.length > 0 && (
          <div className="flex justify-center gap-1 mt-1">
            {card.content.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-1 py-0.5 bg-white/10 rounded text-xs text-white/60">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Connection lines layer - MORE PROMINENT */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
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
          const isSelected = selectedCard === card.id;
          const isEditing = editingCard === card.id;
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
                scale: isSelected ? 1.4 : isHovered ? 1.3 : 1,
                opacity: 1,
                z: isSelected ? 100 : isHovered ? 50 : 0,
              }}
              whileHover={{
                scale: 1.35,
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
              onClick={() => handleCardClick(card)}
            >
              {/* MULTI-LAYER STAR GLOW EFFECTS */}
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 215, 0, ${card.importance * 0.3}) 0%, rgba(135, 206, 235, ${card.importance * 0.2}) 50%, transparent 100%)`,
                  transform: 'scale(3)',
                  filter: 'blur(15px)',
                }}
                animate={{
                  opacity: isHovered ? [0.4, 0.8, 0.4] : [0.2, 0.5, 0.2],
                  scale: isHovered ? [3, 3.5, 3] : [3, 3.2, 3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Middle glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 215, 0, ${card.importance * 0.6}) 0%, rgba(135, 206, 235, ${card.importance * 0.4}) 70%, transparent 100%)`,
                  transform: 'scale(2)',
                  filter: 'blur(8px)',
                }}
                animate={{
                  opacity: isHovered ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4],
                  scale: isHovered ? [2, 2.3, 2] : [2, 2.1, 2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />

              {/* Inner glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 215, 0, ${card.importance * 0.9}) 0%, rgba(135, 206, 235, ${card.importance * 0.6}) 80%, transparent 100%)`,
                  transform: 'scale(1.5)',
                  filter: 'blur(4px)',
                }}
                animate={{
                  opacity: isHovered ? [0.8, 1, 0.8] : [0.6, 0.9, 0.6],
                  scale: isHovered ? [1.5, 1.8, 1.5] : [1.5, 1.6, 1.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />

              {/* Pulsing star core */}
              {card.importance > 0.6 && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-yellow-300"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                    borderColor: ['rgba(253, 224, 71, 0.8)', 'rgba(253, 224, 71, 1)', 'rgba(253, 224, 71, 0.8)'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -inset-6 border-3 border-blue-400 rounded-full"
                  animate={{
                    borderColor: ['rgba(96, 165, 250, 0.6)', 'rgba(96, 165, 250, 1)', 'rgba(96, 165, 250, 0.6)'],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Card content - STAR SHAPE */}
              <div
                className={`relative w-full h-full rounded-full overflow-hidden border transition-all duration-300 ${
                  isSelected || isHovered || isConnected
                    ? 'border-yellow-300 shadow-2xl shadow-yellow-300/60'
                    : 'border-yellow-200/40 shadow-lg shadow-yellow-200/20'
                }`}
                style={{
                  background: `radial-gradient(circle, rgba(10, 10, 10, 0.9) 0%, rgba(20, 20, 30, 0.8) 50%, rgba(30, 30, 40, 0.7) 100%)`,
                  backdropFilter: 'blur(10px)',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', // STAR shape
                  boxShadow: isHovered ? '0 0 40px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.3)' : '0 0 20px rgba(255, 215, 0, 0.3)',
                }}
              >
                {renderCardContent(card)}

                {/* Edit button */}
                {isSelected && !isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(card);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Edit3 size={10} className="text-white" />
                  </button>
                )}
              </div>

              {/* Connection nodes - MORE VISIBLE */}
              {card.connections.length > 0 && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    {card.connections.slice(0, 4).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-blue-400"
                        animate={{
                          opacity: [0.6, 1, 0.6],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add new memory button */}
      <motion.button
        onClick={() => onCardAdd?.({
          type: 'mixed',
          content: { title: 'New Memory', description: '' },
          x: 0,
          y: 0,
          importance: 0.5,
          connections: [],
          timestamp: new Date(),
        })}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400 shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 flex items-center justify-center z-50 group"
        whileHover={{
          scale: 1.1,
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 215, 0, 0.5)',
            '0 0 30px rgba(255, 215, 0, 0.7)',
            '0 0 20px rgba(255, 215, 0, 0.5)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        title="Add New Memory Star"
      >
        <Plus size={28} className="text-white group-hover:scale-110 transition-transform drop-shadow-lg" />
      </motion.button>

      {/* Ambient particles - BRIGHTER STARS */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {Array.from({ length: 40 }).map((_, i) => ( // EVEN MORE particles
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(135, 206, 235, 0.6)'} 0%, transparent 100%)`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
