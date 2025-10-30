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
  onOpenChange?: (open: boolean) => void;
}

export function CreateSpaceDialog({ onCreateSpace, onOpenChange }: CreateSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [touched, setTouched] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    
    // Reset validation state when closing
    if (!newOpen) {
      setErrors({});
      setTouched(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // Name validation
    if (!trimmedTitle) {
      newErrors.name = 'Please enter a space name';
    } else if (trimmedTitle.length < 3) {
      newErrors.name = 'Space name must be at least 3 characters';
    } else if (trimmedTitle.length > 50) {
      newErrors.name = 'Space name must be 50 characters or less';
    }

    // Description validation
    if (trimmedDescription.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    // Validate form
    const newErrors: { name?: string; description?: string } = {};
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // Name validation
    if (!trimmedTitle) {
      newErrors.name = 'Please enter a space name';
    } else if (trimmedTitle.length < 3) {
      newErrors.name = 'Space name must be at least 3 characters';
    } else if (trimmedTitle.length > 50) {
      newErrors.name = 'Space name must be 50 characters or less';
    }

    // Description validation
    if (trimmedDescription.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    setErrors(newErrors);

    // If there are errors, show alert and return
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name) {
        alert(newErrors.name);
      } else if (newErrors.description) {
        alert(newErrors.description);
      }
      return;
    }

    onCreateSpace({
      title: trimmedTitle,
      icon: icon.trim() || '📁',
      description: trimmedDescription,
    });

    // Reset form and close dialog
    setTitle('');
    setIcon('');
    setDescription('');
    setErrors({});
    setTouched(false);
    handleOpenChange(false);
  };

  return (
    <div className="relative">
      {/* Button that toggles between New Space and Close */}
      {!open ? (
        <div 
          onClick={() => handleOpenChange(true)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white cursor-pointer hover:bg-white/15 transition-all"
        >
          <span className="text-lg">+</span>
          <span className="text-sm">New Space</span>
        </div>
      ) : (
        <button
          onClick={() => handleOpenChange(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all"
        >
          <span className="text-lg">✕</span>
          <span className="text-sm">Close</span>
        </button>
      )}

      {/* Dialog Portal - Rendered outside the normal flow */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChange(false);
            }}
          />
          
          {/* Dialog Content - Positioned in the sidebar area */}
          <div 
            className="fixed top-[140px] left-[32px] z-[150] w-[320px] rounded-3xl shadow-2xl animate-in slide-in-from-left fade-in duration-300 overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div 
              className="bg-[#0a0a0a] border border-white/20 rounded-3xl"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
            >
            <form onSubmit={handleSubmit} className="p-6">
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
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (touched) validateForm();
                    }}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm ${
                      touched && errors.name ? 'border-red-500' : ''
                    }`}
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  {touched && errors.name && (
                    <p className="text-xs text-red-400">{errors.name}</p>
                  )}
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
                  <p className="text-xs text-white/40">Optional - defaults to 📁</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="space-description" className="text-white/90 text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="space-description"
                    placeholder="What will you use this space for?"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (touched) validateForm();
                    }}
                    className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-16 text-sm resize-none ${
                      touched && errors.description ? 'border-red-500' : ''
                    }`}
                    maxLength={200}
                  />
                  {touched && errors.description && (
                    <p className="text-xs text-red-400">{errors.description}</p>
                  )}
                  <p className="text-xs text-white/40">{description.length}/200 characters</p>
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
          </div>
        </>
      )}
    </div>
  );
}
