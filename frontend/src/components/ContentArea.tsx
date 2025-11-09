import React, { useState, useEffect } from 'react';
import { NeuralMemoryGrid } from './NeuralMemoryGridStar';
import { motion } from 'framer-motion';

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

interface ContentAreaProps {
  activeSpace: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  forceNeuralView?: boolean;
}

export function ContentArea({ activeSpace, activeFilter, onFilterChange, forceNeuralView = false }: ContentAreaProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'neural'>('neural');
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load memories from localStorage or API
  useEffect(() => {
    const loadMemories = async () => {
      try {
        // Try to load from localStorage first
        const savedMemories = localStorage.getItem(`memories_${activeSpace}`);
        if (savedMemories) {
          const parsed = JSON.parse(savedMemories);
          setMemories(parsed.map((m: any, index: number) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            x: m.x || 0,
            y: m.y || 0,
          })));
        } else {
          // Generate sample memories
          const sampleMemories: MemoryCard[] = [
            {
              id: '1',
              type: 'mixed',
              content: {
                title: 'Beach Day 2024',
                description: 'Perfect summer day with friends',
                images: ['https://picsum.photos/200/150?random=1'],
                tags: ['beach', 'friends', 'summer']
              },
              x: 0,
              y: 0,
              importance: 0.8,
              connections: ['2', '3'],
              timestamp: new Date('2024-07-15'),
            },
            {
              id: '2',
              type: 'image',
              content: {
                title: 'Sunset View',
                description: 'Golden hour magic',
                images: ['https://picsum.photos/200/150?random=2'],
                tags: ['sunset', 'nature', 'peaceful']
              },
              x: 100,
              y: 100,
              importance: 0.9,
              connections: ['1', '4'],
              timestamp: new Date('2024-07-15'),
            },
            {
              id: '3',
              type: 'text',
              content: {
                title: 'Summer Thoughts',
                text: 'The best memories are made in the sun...',
                tags: ['reflection', 'summer', 'life']
              },
              x: -100,
              y: 50,
              importance: 0.6,
              connections: ['1'],
              timestamp: new Date('2024-07-16'),
            },
            {
              id: '4',
              type: 'video',
              content: {
                title: 'Waves Crashing',
                description: 'Ocean sounds and sights',
                videos: ['https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'],
                tags: ['ocean', 'video', 'nature']
              },
              x: 50,
              y: -100,
              importance: 0.7,
              connections: ['2'],
              timestamp: new Date('2024-07-15'),
            },
          ];
          setMemories(sampleMemories);
        }
      } catch (error) {
        console.error('Error loading memories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [activeSpace]);

  // Save memories to localStorage
  const saveMemories = (updatedMemories: MemoryCard[]) => {
    localStorage.setItem(`memories_${activeSpace}`, JSON.stringify(updatedMemories));
    setMemories(updatedMemories);
  };

  const handleCardUpdate = (cardId: string, updates: Partial<MemoryCard>) => {
    const updatedMemories = memories.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    saveMemories(updatedMemories);
  };

  const handleCardAdd = (newCard: Omit<MemoryCard, 'id'>) => {
    const card: MemoryCard = {
      ...newCard,
      id: Date.now().toString(),
    };
    const updatedMemories = [...memories, card];
    saveMemories(updatedMemories);
  };

  const handleCardClick = (card: MemoryCard) => {
    console.log('Card clicked:', card);
  };

  // Force neural view if specified
  useEffect(() => {
    if (forceNeuralView) {
      setViewMode('neural');
    }
  }, [forceNeuralView]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/50">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* View Toggle - Only show when not forced to neural view */}
      {!forceNeuralView && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            ?? Grid
          </button>
          <button
            onClick={() => setViewMode('neural')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              viewMode === 'neural'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            ?? Neural
          </button>
        </div>
      )}

      {/* Content */}
      {viewMode === 'neural' ? (
        <NeuralMemoryGrid
          memories={memories}
          onCardClick={handleCardClick}
          onCardUpdate={handleCardUpdate}
          onCardAdd={handleCardAdd}
        />
      ) : (
        // Traditional grid view
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleCardClick(memory)}
            >
              {memory.content.images && memory.content.images.length > 0 && (
                <img
                  src={memory.content.images[0]}
                  alt={memory.content.title}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-white font-medium mb-1">{memory.content.title}</h3>
                {memory.content.description && (
                  <p className="text-white/70 text-sm line-clamp-2">{memory.content.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {memory.content.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/80">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {memories.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/50">
            <div className="text-6xl mb-4">??</div>
            <h3 className="text-xl font-medium mb-2">Your Memory Constellation</h3>
            <p className="mb-4">Click the green + button to add your first memory</p>
            <p className="text-sm">Each memory becomes a star in your personal universe</p>
          </div>
        </div>
      )}
    </div>
  );
}