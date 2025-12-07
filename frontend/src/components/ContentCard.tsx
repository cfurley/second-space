import React, { useState } from 'react';
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
    description?: string;
    isBookmarked?: boolean;
  };
  onToggleBookmark?: () => void;
  onEdit?: (fields: Record<string, any>) => void;
  onRequestEdit?: () => void;
}

export function ContentCard({ type, content, onToggleBookmark, onEdit, onRequestEdit }: ContentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const getCardContent = () => {
    switch (type) {
      case 'image':
        return (
          <div 
            className="rounded-xl overflow-hidden relative cursor-pointer bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg h-56"
            onClick={() => content.description && setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div 
              className="relative transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of card - Image with title and timestamp */}
              <div 
                style={{ backfaceVisibility: 'hidden' }}
              >
                {content.image ? (
                  <div className="relative">
                    <ImageWithFallback
                      src={content.image}
                      alt={content.title || 'Content image'}
                      className="w-full h-40 rounded-2xl object-cover"
                    />
                    {/* Title and timestamp overlay on front. Add an Edit link for images. */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between">
                      <div>
                        {content.title && (
                          <h3 className="text-white font-medium text-sm mb-1">{content.title}</h3>
                        )}
                        <p className="text-white/60 text-xs">{content.timestamp}</p>
                      </div>
                      {onRequestEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRequestEdit(); }}
                          className="text-white/80 underline text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white/70">
                    {content.title || '[Design Inspiration]'}
                  </div>
                )}
              </div>

              {/* Back of card - Description */}
              {content.description && (
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex flex-col justify-center"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-white/90 text-sm leading-relaxed overflow-y-auto">
                    {content.description}
                  </div>
                  {/* Bubble instruction at bottom right */}
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full text-xs text-white font-medium border border-white/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Click to flip back
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="p-3 h-56 overflow-y-auto text-gray-700 dark:text-white/80 text-xs leading-relaxed bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg">
            <div className="h-full">{content.text}</div>
          </div>
        );
      
      case 'link':
        return (
          <div className="p-3 h-56 overflow-y-auto bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg">
            <div className="h-full">
              <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-1.5">{content.title}</h4>
              <p className="text-gray-600 dark:text-white/60 text-xs leading-relaxed mb-2">{content.text}</p>
              {content.domain && (
                <p className="text-gray-400 dark:text-white/40 text-xs">{content.domain}</p>
              )}
            </div>
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

  const doEdit = () => {
    if (!onEdit) return;
    if (type === 'text') {
      const newText = prompt('Edit text', content.text || '')
      if (newText !== null) onEdit({ text: newText });
      return;
    }
    if (type === 'image') {
      const newTitle = prompt('Edit image title', content.title || '')
      const newUrl = prompt('Edit image URL', content.image || '')
      const fields: Record<string, any> = {}
      if (newTitle !== null) fields.title = newTitle;
      if (newUrl !== null) fields.image = newUrl;
      if (Object.keys(fields).length) onEdit(fields);
      return;
    }
    if (type === 'link') {
      const newTitle = prompt('Edit link title', content.title || '')
      const newText = prompt('Edit link text', content.text || '')
      const fields: Record<string, any> = {}
      if (newTitle !== null) fields.title = newTitle;
      if (newText !== null) fields.text = newText;
      if (Object.keys(fields).length) onEdit(fields);
      return;
    }
  }

  return (
    <div className="relative group w-full">
      {/* Bookmark toggle button - appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark?.();
        }}
        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title={content.isBookmarked ? "Unpin from top" : "Pin to top"}
      >
        {content.isBookmarked ? (
          <div className="bg-yellow-400 rounded-full p-1.5 shadow-lg">
            <svg className="w-4 h-4 text-yellow-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white/15 transition-colors">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </button>
      {/* Small Edit link will be rendered in card content (overlay or bottom bar) */}
      
      <div>
        {getCardContent()}
      </div>
      
      {/* Only show bottom bar for non-image types, since images have title/timestamp in overlay */}
      {type !== 'image' && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-white/50">
          <div className="flex items-center gap-3">
            <span>{getTypeLabel()}</span>
            {onRequestEdit && (
              <button onClick={(e) => { e.stopPropagation(); onRequestEdit(); }} className="underline text-xs text-gray-600 dark:text-white/60">Edit</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>{content.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}