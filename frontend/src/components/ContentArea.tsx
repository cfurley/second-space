import React from 'react';
import { ContentCard } from './ContentCard';
import { FilterBar } from './FilterBar';

interface ContentAreaProps {
  activeSpace: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ContentArea({ activeSpace, activeFilter, onFilterChange }: ContentAreaProps) {
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

  return (
    <div className="flex-1 bg-black p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-4xl font-bold uppercase tracking-wide">
          {activeSpace}
        </h1>
        <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mt-8">
        {sampleContent.map((item, index) => (
          <ContentCard
            key={index}
            type={item.type}
            content={item.content}
          />
        ))}
      </div>
    </div>
  );
}