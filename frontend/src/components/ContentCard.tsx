import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ContentCardProps {
  type: 'image' | 'text' | 'link';
  content: {
    title?: string;
    text?: string;
    url?: string;
    image?: string;
    domain?: string;
    timestamp: string;
  };
}

export function ContentCard({ type, content }: ContentCardProps) {
  const getCardContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="aspect-[3/4] rounded-xl overflow-hidden">
            {content.image ? (
              <ImageWithFallback
                src={content.image}
                alt={content.title || 'Content image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white/70">
                {content.title || '[Design Inspiration]'}
              </div>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div className="min-h-[120px] text-white/90 text-sm leading-relaxed">
            {content.text}
          </div>
        );
      
      case 'link':
        return (
          <div className="border-l-3 border-white/50 pl-4">
            <h4 className="text-white font-medium mb-2">{content.title}</h4>
            <p className="text-white/70 text-sm leading-relaxed">{content.text}</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'image':
        return content.title?.includes('Screenshot') ? 'Screenshot' : 'Image';
      case 'text':
        return 'Text Note';
      case 'link':
        return content.domain || 'Link';
      default:
        return 'Content';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-white transition-all duration-200 cursor-pointer hover:bg-white/8 hover:border-white/20 hover:-translate-y-0.5">
      {getCardContent()}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
        <span>{getTypeLabel()}</span>
        <span>{content.timestamp}</span>
      </div>
    </div>
  );
}