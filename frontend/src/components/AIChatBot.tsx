import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Image as ImageIcon, MessageSquare, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    spaceCreated?: boolean;
    spaceName?: string;
  };
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    spaceId?: string;
    spaceName?: string;
  };
  onSpaceCreate?: (spaceData: any) => void;
}

export function AIChatBot({ isOpen, onClose, context, onSpaceCreate }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI assistant for ${context?.spaceName || 'Second Space'}. I can help you:

• Analyze and organize your images
• Generate tags and captions  
• Create mood timelines from your photos
• Suggest new spaces and categories
• Answer questions about your content

What would you like to do?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Enhanced AI response with space creation
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Detect space creation intent
    if (lowerMessage.includes('create') && lowerMessage.includes('space')) {
      // Check for specific themes
      if (lowerMessage.includes('vib') || lowerMessage.includes('aesthetic') || lowerMessage.includes('mood')) {
        return `? Love it! Let's create a "Vibes & Aesthetics" space!

?? **Space Concept:**
- Name: "Vibes & Aesthetics"
- Icon: ?
- Purpose: Curate mood boards, aesthetic inspiration, color palettes

This space will be perfect for:
• Collecting visual inspiration
• Building mood boards
• Organizing by color/theme
• Creating aesthetic collections

Want me to create this space for you? Just say "yes" or tell me a different name!`;
      }

      if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('gym')) {
        return `?? Great choice! Creating a "Fitness Journey" space!

This space will help you:
• Track workout progress
• Save exercise routines
• Log fitness milestones
• Share transformation photos

Click the + button in the sidebar to finalize, or I can suggest more options!`;
      }

      // General space creation
      return `?? Let's create a space! What vibe are you going for?

**Popular themes:**
? Vibes & Aesthetics - Mood boards and inspiration
?? Fitness Journey - Workouts and progress
?? Learning Hub - Notes and resources
?? Travel Dreams - Places and memories
?? Home Sanctuary - Cozy spaces and ideas
?? Creative Projects - Art and designs

Just tell me the vibe, and I'll help you set it up!`;
    }

    // "Vibey" or aesthetic focus
    if (lowerMessage.includes('vib') || lowerMessage.includes('aesthetic') || lowerMessage.includes('chill')) {
      return `? Vibey spaces are my favorite! Here are some ideas:

?? **Ocean Dreams** - Calming blues, beaches, sunset vibes
?? **Soft Pink Aesthetic** - Gentle, dreamy, pastel paradise
?? **Midnight Thoughts** - Dark, moody, introspective
?? **Nature's Peace** - Greens, plants, earthly vibes
?? **Color Explosion** - Bold, vibrant, energetic

Which vibe resonates with you? Or describe your own!`;
    }

    // Help with organization
    if (lowerMessage.includes('organize') || lowerMessage.includes('help')) {
      return `I can help you organize! Here's my advice:

?? **Start with spaces** - Think of them as themed albums
??? **Add tags** - Make content easy to find later
?? **Use dates** - Track when memories were created
?? **Connect related items** - Build a web of memories

**Pro tip:** The neural network view shows how your memories connect. Hover over cards to see relationships!

What would you like to organize first?`;
    }

    // Single letter or unclear
    if (userMessage.length <= 2) {
      return `I didn't quite catch that! ?? 

Try asking me:
• "Create a space" - I'll guide you through it
• "Help me organize" - Get organization tips
• "What's the neural view?" - Learn about memory connections

What's on your mind?`;
    }

    // Try AI server
    try {
      const response = await fetch('http://localhost:8081/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          conversationHistory: messages.slice(-5).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reply) {
          return data.reply;
        }
      }
    } catch (error) {
      console.log('AI server not available, using smart fallback');
    }

    // General helpful response
    return `I'm here to help! Here's what you can do:

?? **Create spaces** - Click the + button in sidebar
?? **Search** - Find memories quickly
?? **Mood Timeline** - See emotional patterns
?? **Neural View** - Explore memory connections

What interests you most?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm still learning! Try:

• "Create a vibey space"
• "Help me organize"
• "Show me the neural view"

What would you like to explore?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { 
      icon: <Sparkles size={16} />, 
      label: 'Vibey Space', 
      prompt: 'Create a vibey aesthetic space' 
    },
    { 
      icon: <ImageIcon size={16} />, 
      label: 'Organize', 
      prompt: 'Help me organize my content' 
    },
    { 
      icon: <MessageSquare size={16} />, 
      label: 'Neural View', 
      prompt: 'What is the neural network view?' 
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[600px] bg-[#0a0a0a] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <p className="text-white/50 text-xs">
                {context?.spaceName || 'Second Space'} • Always Ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white border border-white/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(action.prompt);
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white text-xs whitespace-nowrap transition-colors"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0a0a0a]">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your vibe..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="text-xs text-white/30 mt-2">
            ? Try: "Create a vibey space" or "something aesthetic"
          </p>
        </div>
      </div>
    </div>
  );
}
