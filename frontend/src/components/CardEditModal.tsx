import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from './ui/dialog';

interface CardEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'image' | 'text' | 'link' | 'ad';
  initial?: Record<string, any>;
  onSave: (fields: Record<string, any>) => void;
}

export function CardEditModal({ open, onOpenChange, type, initial = {}, onSave }: CardEditModalProps) {
  const [title, setTitle] = useState(initial.title || '');
  const [text, setText] = useState(initial.text || '');
  const [image, setImage] = useState(initial.image || '');
  const [url, setUrl] = useState(initial.url || '');

  useEffect(() => {
    setTitle(initial.title || '');
    setText(initial.text || '');
    setImage(initial.image || '');
    setUrl(initial.url || '');
  }, [initial]);

  const handleSave = () => {
    const fields: Record<string, any> = {};
    if (title) fields.title = title;
    if (text) fields.text = text;
    if (image) fields.image = image;
    if (url) fields.url = url;
    onSave(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{type === 'text' ? 'Edit Text' : type === 'image' ? 'Edit Image' : type === 'link' ? 'Edit Link' : 'Create Ad'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label htmlFor="card-title" className="text-sm text-gray-700">Title</label>
          <input id="card-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded border" />

          {(type === 'text' || type === 'ad' || type === 'link') && (
            <>
              <label htmlFor="card-text" className="text-sm text-gray-700">Text</label>
              <textarea id="card-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full px-3 py-2 rounded border" />
            </>
          )}

          {type === 'image' && (
            <>
              <label htmlFor="card-image" className="text-sm text-gray-700">Image URL</label>
              <input id="card-image" value={image} onChange={(e) => setImage(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </>
          )}

          {type === 'link' && (
            <>
              <label htmlFor="card-url" className="text-sm text-gray-700">Target URL</label>
              <input id="card-url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
