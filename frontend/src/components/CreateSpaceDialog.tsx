import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white cursor-pointer hover:bg-white/15 transition-all">
          <span className="text-lg">+</span>
          <span className="text-sm">New Space</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-white/10">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Create New Space</DialogTitle>
            <DialogDescription className="text-white/60">
              Create a new space to organize your content. Add a name, icon, and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="space-name" className="text-white/90">
                Space Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="space-name"
                placeholder="e.g., Fitness Plans"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="space-icon" className="text-white/90">
                Icon (emoji)
              </Label>
              <Input
                id="space-icon"
                placeholder="e.g., 🏃 or 💡"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                maxLength={2}
              />
              <p className="text-xs text-white/40">
                Enter an emoji to represent your space (optional, defaults to 📁)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="space-description" className="text-white/90">
                Description
              </Label>
              <Textarea
                id="space-description"
                placeholder="What will you use this space for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
