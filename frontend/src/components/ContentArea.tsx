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
    <div className="flex-1 bg-black p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-4xl font-bold uppercase tracking-wide">
          {activeSpace}
        </h1>
        <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mt-8">
        {/* No results message */}
        {searchQuery && filteredContent.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-white/50 text-lg font-medium mb-2">No posts found</h3>
            <p className="text-white/30 text-sm">Try a different search term</p>
          </div>
        )}
        
        {/* Pinned Section */}
        {pinnedContent.length > 0 && (
          <>
            <div className="col-span-full mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                    Pinned ({pinnedContent.length})
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/30 to-transparent"></div>
              </div>
            </div>
            {pinnedContent.map((item, idx) => {
              const originalIndex = allContent.findIndex(c => c === item);
              return (
                <ContentCard
                  key={`pinned-${idx}`}
                  type={item.type}
                  content={item.content}
                  onToggleBookmark={() => handleToggleBookmark(originalIndex)}
                />
              );
            })}
          </>
        )}

        {/* Unpinned Section */}
        {pinnedContent.length > 0 && unpinnedContent.length > 0 && (
          <div className="col-span-full mt-6 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-white/50 text-sm font-semibold uppercase tracking-wider">
                All Posts ({unpinnedContent.length})
              </h2>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
          </div>
        )}
        
        {unpinnedContent.map((item, idx) => {
          const originalIndex = allContent.findIndex(c => c === item);
          return (
            <ContentCard
              key={`unpinned-${idx}`}
              type={item.type}
              content={item.content}
              onToggleBookmark={() => handleToggleBookmark(originalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}