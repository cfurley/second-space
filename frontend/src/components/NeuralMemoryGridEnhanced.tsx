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

  // Generate organic positions (neural network style)
  const getCardPosition = (index: number, total: number) => {
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
    return 150 + importance * 100;
  };

  // Draw connections between cards
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
        <div className="p-3 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={editData.title || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
          />
          <textarea
            placeholder="Description"
            value={editData.description || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm resize-none"
            rows={2}
          />

          <div className="flex gap-2">
            <button onClick={() => handleAddMedia('image')} className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded text-xs">
              <ImageIcon size={12} /> Image
            </button>
            <button onClick={() => handleAddMedia('video')} className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs">
              <Video size={12} /> Video
            </button>
            <button onClick={() => handleAddMedia('text')} className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-xs">
              <Type size={12} /> Text
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleEditSave} className="flex items-center gap-1 px-3 py-1 bg-green-500 rounded text-xs">
              <Save size={12} /> Save
            </button>
            <button onClick={handleEditCancel} className="flex items-center gap-1 px-3 py-1 bg-red-500 rounded text-xs">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      );
    }

    // Display mode
    return (
      <div className="p-3">
        {card.content.images && card.content.images.length > 0 && (
          <img
            src={card.content.images[0]}
            alt={card.content.title}
            className="w-full h-20 object-cover rounded mb-2"
          />
        )}
        {card.content.videos && card.content.videos.length > 0 && (
          <video
            src={card.content.videos[0]}
            className="w-full h-20 object-cover rounded mb-2"
            controls={false}
          />
        )}
        <h3 className="text-white font-medium text-sm mb-1">{card.content.title}</h3>
        {card.content.description && (
          <p className="text-white/70 text-xs line-clamp-2">{card.content.description}</p>
        )}
        {card.content.tags && card.content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.content.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1 py-0.5 bg-white/20 rounded text-xs text-white/80">
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
                scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
                opacity: 1,
                z: isSelected ? 100 : isHovered ? 50 : 0,
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
              onClick={() => handleCardClick(card)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-2xl animate-pulse" />
              )}

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
                  isSelected || isHovered || isConnected
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/50'
                    : 'border-white/20 shadow-lg'
                }`}
                style={{
                  background: 'rgba(10, 10, 10, 0.8)',
                  backdropFilter: 'blur(10px)',
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
                    className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 size={12} className="text-white" />
                  </button>
                )}
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

      {/* Add new memory button */}
      <button
        onClick={() => onCardAdd?.({
          type: 'mixed',
          content: { title: 'New Memory', description: '' },
          x: 0,
          y: 0,
          importance: 0.5,
          connections: [],
          timestamp: new Date(),
        })}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="Add New Memory"
      >
        <Plus size={24} className="text-white group-hover:scale-110 transition-transform" />
      </button>

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
