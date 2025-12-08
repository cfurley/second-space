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
}

export function ContentArea({ activeSpace, activeFilter, onFilterChange, spaceContent, searchQuery = '' }: ContentAreaProps) {
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
        
        {/* Content Cards in Grid Layout (4 per row on md+). Render placeholders to fill the last row so cards don't stretch. */}
        {filteredContent.map(({ item, index }) => (
          <div key={`content-${index}`} className="col-span-1 w-full">
            <ContentCard
              type={item.type}
              content={item.content}
              onToggleBookmark={() => handleToggleBookmark(index)}
              onEdit={(fields: Record<string, any>) => handleEdit(index, fields)}
              onRequestEdit={() => openEditor(index, item.type, item.content)}
            />
          </div>
        ))}

        {/* Add empty placeholders to ensure exactly 4 columns appear on larger viewports */}
        {(() => {
          const columns = 4; // desired columns on md+
          const count = filteredContent.length;
          const remainder = count % columns;
          const placeholders = remainder === 0 ? 0 : columns - remainder;
          return Array.from({ length: placeholders }).map((_, i) => (
            <div key={`placeholder-${i}`} className="col-span-1">
              <div className="h-56" />
            </div>
          ));
        })()}
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