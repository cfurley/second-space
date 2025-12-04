import React, { useState } from 'react';
import { ContentCard } from './ContentCard';
import { FilterBar } from './FilterBar';

interface ContentAreaProps {
  activeSpace: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  spaceContent: any[];
  searchQuery?: string;
}

export function ContentArea({ activeSpace, activeFilter, onFilterChange, spaceContent, searchQuery = '' }: ContentAreaProps) {
  const [localContent, setLocalContent] = useState<any[]>([]);

  const sampleContent = [
    {
      type: 'image' as const,
      content: {
        title: 'Design Inspiration',
        image: 'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU2MzE3NTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        timestamp: '2 hours ago',
      },
    },
    {
      type: 'text' as const,
      content: {
        text: 'App idea: A mood board platform that doesn\'t require social features and focuses on personal organization. Users can drag and drop content from anywhere on the web into organized spaces.',
        timestamp: '1 day ago',
      },
    },
    {
      type: 'link' as const,
      content: {
        title: 'Dribbble Design',
        text: 'Beautiful UI design inspiration for dark themed applications with glassmorphism effects',
        domain: 'dribbble.com',
        timestamp: '3 days ago',
      },
    },
    {
      type: 'image' as const,
      content: {
        title: 'UI Screenshot',
        image: 'https://images.unsplash.com/photo-1734009617600-ff7b688d4a72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGVzaWduJTIwaW5zcGlyYXRpb258ZW58MXx8fHwxNzU2Mzk5NzE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        timestamp: '5 days ago',
      },
    },
    {
      type: 'text' as const,
      content: {
        text: 'Color palette ideas: Dark backgrounds with high contrast white text and subtle glass effects for depth. Consider using rgba values for transparency.',
        timestamp: '1 week ago',
      },
    },
    {
      type: 'link' as const,
      content: {
        title: 'GitHub Repository',
        text: 'SwiftUI design system with golden ratio spacing and modern component library',
        domain: 'github.com',
        timestamp: '1 week ago',
      },
    },
    {
      type: 'image' as const,
      content: {
        title: 'Creative Workspace',
        image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdWklMjBkZXNpZ258ZW58MXx8fHwxNzU2Mzk5NzE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        timestamp: '2 weeks ago',
      },
    },
    {
      type: 'text' as const,
      content: {
        text: 'Browser extension concept: Allow users to drag any content from web pages directly into their organized spaces. Should work with images, text, links, and even entire page sections.',
        timestamp: '2 weeks ago',
      },
    },
  ];

  // Combine user-created content with sample content and local modifications
  const allContent = [...spaceContent, ...sampleContent].map((item, index) => {
    const localItem = localContent.find(l => l.index === index);
    return localItem ? { ...item, content: { ...item.content, isBookmarked: localItem.isBookmarked } } : item;
  });

  // Apply search filter if query exists
  const filteredContent = searchQuery 
    ? allContent.filter(item => {
        const title = item.content?.title?.toLowerCase() || '';
        const text = item.content?.text?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return title.includes(query) || text.includes(query);
      })
    : allContent;

  // Separate pinned and unpinned content
  const pinnedContent = filteredContent.filter(item => item.content?.isBookmarked);
  const unpinnedContent = filteredContent.filter(item => !item.content?.isBookmarked);

  const handleToggleBookmark = (index: number) => {
    const item = allContent[index];
    const currentBookmarkState = item.content?.isBookmarked || false;
    
    setLocalContent(prev => {
      const existing = prev.findIndex(l => l.index === index);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { index, isBookmarked: !currentBookmarkState };
        return updated;
      }
      return [...prev, { index, isBookmarked: !currentBookmarkState }];
    });
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] p-10 overflow-y-auto relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold uppercase tracking-wide">
          {activeSpace}
        </h1>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 mt-8">
        {/* No results message */}
        {searchQuery && filteredContent.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-300 dark:text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-gray-500 dark:text-white/50 text-lg font-medium mb-2">No posts found</h3>
            <p className="text-gray-400 dark:text-white/30 text-sm">Try a different search term</p>
          </div>
        )}
        
        {/* Content Cards in Masonry Layout */}
        {filteredContent.map((item, idx) => {
          const originalIndex = allContent.findIndex(c => c === item);
          return (
            <div key={`content-${idx}`} className="break-inside-avoid mb-4">
              <ContentCard
                type={item.type}
                content={item.content}
                onToggleBookmark={() => handleToggleBookmark(originalIndex)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <button 
          className="w-14 h-14 rounded-full bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center transition-all group shadow-md"
          aria-label="Edit"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          className="w-14 h-14 rounded-full bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 backdrop-blur-md border border-gray-200 dark:border-white/20 flex items-center justify-center transition-all group shadow-md"
          aria-label="Add"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          className="w-14 h-14 rounded-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-white/90 flex items-center justify-center transition-all shadow-lg"
          aria-label="Search"
        >
          <svg className="w-5 h-5 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}