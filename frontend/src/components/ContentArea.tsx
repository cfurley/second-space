import React, { useState } from 'react';
import { ContentCard } from './ContentCard';
import { CardEditModal } from './CardEditModal';
import { FilterBar } from './FilterBar';

interface ContentAreaProps {
  activeSpace: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  spaceContent: any[];
  searchQuery?: string;
  isDeleteMode?: boolean;
  selectedItemIds?: string[];
  onToggleItemSelection?: (itemId: string) => void;
  isEditMode?: boolean;
  onItemEdit?: (item: any, itemType: 'text' | 'image' | 'link') => void;
}

export function ContentArea({ 
  activeSpace, 
  activeFilter, 
  onFilterChange, 
  spaceContent, 
  searchQuery = '',
  isDeleteMode = false,
  selectedItemIds = [],
  onToggleItemSelection,
  isEditMode = false,
  onItemEdit
}: ContentAreaProps) {
  const [localContent, setLocalContent] = useState<any[]>([]);
  const [addedContent, setAddedContent] = useState<any[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorIndex, setEditorIndex] = useState<number | null>(null);
  const [editorType, setEditorType] = useState<'image' | 'text' | 'link' | 'ad'>('text');
  const [editorInitial, setEditorInitial] = useState<Record<string, any>>({});

  // Use only actual space content (no default/sample cards)
  const allContent = spaceContent.map((item, index) => {
    const localItem = localContent.find(l => l.index === index);
    if (!localItem) return item;
    const edited = localItem.editedFields || {};
    return { ...item, content: { ...item.content, ...edited, isBookmarked: localItem.isBookmarked } };
  });

  // Append any locally added cards (not yet persisted)
  const composedContent = [...allContent, ...addedContent];

  // Apply search filter if query exists - preserve original index
  const filteredContent = searchQuery 
    ? composedContent
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
          const title = item.content?.title?.toLowerCase() || '';
          const text = item.content?.text?.toLowerCase() || '';
          const query = searchQuery.toLowerCase();
          return title.includes(query) || text.includes(query);
        })
    : composedContent.map((item, index) => ({ item, index }));

  // (Pinned/unpinned handling not needed here)

  const handleToggleBookmark = (index: number) => {
    const item = composedContent[index];
    const currentBookmarkState = item.content?.isBookmarked || false;
    
    setLocalContent(prev => {
      const existing = prev.findIndex(l => l.index === index);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], index, isBookmarked: !currentBookmarkState };
        return updated;
      }
      return [...prev, { index, isBookmarked: !currentBookmarkState }];
    });
  };

  const handleEdit = (index: number, fields: Record<string, any>) => {
    setLocalContent(prev => {
      const existing = prev.findIndex(l => l.index === index);
      if (existing >= 0) {
        const updated = [...prev];
        const prevEntry = updated[existing];
        updated[existing] = { ...prevEntry, index, editedFields: { ...(prevEntry.editedFields || {}), ...fields } };
        return updated;
      }
      return [...prev, { index, editedFields: { ...fields } }];
    });
  };

  const openEditor = (index: number | null, type: 'image'|'text'|'link'|'ad', initial: Record<string, any> = {}) => {
    setEditorIndex(index);
    setEditorType(type);
    setEditorInitial(initial || {});
    setEditorOpen(true);
  };

  const handleSaveFromModal = (fields: Record<string, any>) => {
    if (editorIndex === null) {
      // create a new local card
      const now = new Date().toLocaleString();
      const newItem = { type: editorType, content: { ...fields, timestamp: now } };
      setAddedContent(prev => [...prev, newItem]);
    } else {
      // edit existing composed item
      handleEdit(editorIndex, fields);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] p-10 overflow-y-auto relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold uppercase tracking-wide">
          {activeSpace}
        </h1>
      </div>

      <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <div className="grid grid-cols-4 gap-4 mt-8">
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
        
        {/* Content Section */}
        {filteredContent.map(({ item, index }, idx) => {
          const itemId = item.content?.id || `${item.type}-${index}`;
          return (
            <ContentCard
              key={`content-${idx}`}
              type={item.type}
              content={item.content}
              onToggleBookmark={() => handleToggleBookmark(index)}
              isDeleteMode={isDeleteMode}
              isSelected={selectedItemIds.includes(itemId)}
              onToggleSelect={() => onToggleItemSelection?.(itemId)}
              isEditMode={isEditMode}
              onEdit={() => onItemEdit?.(item.content, item.type)}
            />
          );
        })}
      </div>
      
      <CardEditModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        type={editorType}
        initial={editorInitial}
        onSave={handleSaveFromModal}
      />
      
      {/* Floating Action Buttons removed per request */}
    </div>
  );
}