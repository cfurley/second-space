import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CreateSpaceDialogProps {
  onCreateSpace: (spaceData: { 
    title: string; 
    icon: string; 
    description: string;
  }) => void | Promise<void>;
}

export function CreateSpaceDialog({ onCreateSpace }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a space name');
      return;
    }

    onCreateSpace({
      title: title.trim(),
      icon: icon.trim() || '📁',
      description: description.trim(),
    });

    // Reset form and close dialog
    setTitle('');
    setIcon('');
    setDescription('');
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <div 
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white cursor-pointer hover:bg-white/15 transition-all"
      >
        <span className="text-lg">+</span>
        <span className="text-sm">New Space</span>
      </div>

      {/* Dialog */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          
          {/* Dialog Content */}
          <div 
            className="fixed top-[120px] left-8 z-50 w-[320px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-left fade-in duration-200"
            style={{
              boxShadow: '0 0 60px rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Custom Close Button - Pill with X */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/95 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg z-10"
            >
              <span className="text-sm">✕</span>
              <span className="text-xs">Close</span>
            </button>

            <form onSubmit={handleSubmit} className="p-6 pt-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">New Space</h2>
                <p className="text-xs text-white/50">Create a space to organize your content</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="space-name" className="text-white/90 text-xs">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="space-name"
                    placeholder="e.g., Fitness Plans"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="space-icon" className="text-white/90 text-xs">
                    Icon
                  </Label>
                  <Input
                    id="space-icon"
                    placeholder="🏃"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="space-description" className="text-white/90 text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="space-description"
                    placeholder="What will you use this space for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-16 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white h-9 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
