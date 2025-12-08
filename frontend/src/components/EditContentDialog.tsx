import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type EditContentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'text' | 'image' | 'link';
  contentData: any;
  onSave: (updatedContent: any) => void;
};

export function EditContentDialog({ 
  open, 
  onOpenChange, 
  contentType,
  contentData,
  onSave
}: EditContentDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  
  // States for adding attachments
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'text' | 'image' | 'link' | null>(null);
  const [attachmentText, setAttachmentText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>("");

  // CWE-434: Security - File upload validation (synchronized with backend limits)
  const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'mp4', 'webm', 'mov', 'avi', 'pdf', 'txt', 'md', 'json'];
  const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json'
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push('File MIME type not allowed');
    }

    // Check MIME type matches extension
    const mimeToExt: Record<string, string[]> = {
      'image/png': ['png'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/bmp': ['bmp'],
      'image/svg+xml': ['svg'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/quicktime': ['mov'],
      'video/x-msvideo': ['avi'],
      'application/pdf': ['pdf'],
      'text/plain': ['txt'],
      'text/markdown': ['md'],
      'application/json': ['json']
    };
    
    const validExtensions = mimeToExt[file.type];
    if (validExtensions && !validExtensions.includes(extension)) {
      errors.push('File type and extension do not match');
    }

    return { valid: errors.length === 0, errors };
  };

  useEffect(() => {
    if (open && contentData) {
      if (contentType === 'text') {
        // Extract title and content from text
        const lines = contentData.text?.split('\n\n') || ['', ''];
        setTitle(lines[0] || '');
        setContent(lines.slice(1).join('\n\n') || '');
      } else if (contentType === 'image') {
        setTitle(contentData.title || '');
        setDescription(contentData.description || '');
      } else if (contentType === 'link') {
        setTitle(contentData.title || '');
        setUrl(contentData.url || '');
        setNotes(contentData.text || '');
      }
    }
  }, [open, contentData, contentType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(`File validation failed:\n${validation.errors.join('\n')}`);
        e.target.value = ''; // Clear the input
        return;
      }

      setAttachmentFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddAttachment = () => {
    if (!attachmentType) return;
    
    // Add attachment text/link to the content
    let additionalContent = "";
    
    if (attachmentType === 'text' && attachmentText) {
      additionalContent = `\n\n--- Additional Content ---\n${attachmentText}`;
      setContent(content + additionalContent);
      setAttachmentText("");
    } else if (attachmentType === 'link' && attachmentUrl) {
      additionalContent = `\n\n--- Link ---\n${attachmentUrl}`;
      if (contentType === 'text') {
        setContent(content + additionalContent);
      } else {
        setNotes(notes + additionalContent);
      }
      setAttachmentUrl("");
    } else if (attachmentType === 'image' && attachmentPreview) {
      // For images, we'll add them to the description/notes
      const imageNote = `\n\n[Attached Image: ${attachmentFile?.name}]`;
      if (contentType === 'text') {
        setContent(content + imageNote);
      } else if (contentType === 'image') {
        setDescription(description + imageNote);
      } else {
        setNotes(notes + imageNote);
      }
      setAttachmentFile(null);
      setAttachmentPreview("");
    }
    
    setAttachmentType(null);
    alert('Attachment added to content!');
  };

  const handleSave = async () => {
    try {
      let updatedData: any = {};

      if (contentType === 'text') {
        // Update in localStorage
        const allPosts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
        const postIndex = allPosts.findIndex((p: any) => p.id === contentData.id);
        
        if (postIndex !== -1) {
          allPosts[postIndex] = {
            ...allPosts[postIndex],
            title,
            content,
          };
          localStorage.setItem('ss_posts', JSON.stringify(allPosts));
          
          updatedData = {
            type: 'text',
            content: {
              ...contentData,
              text: `${title}\n\n${content}`,
            }
          };
        }
      } else if (contentType === 'image') {
        // Update in localStorage
        const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
        const mediaIndex = allMedia.findIndex((m: any) => m.id === contentData.id);
        
        if (mediaIndex !== -1) {
          allMedia[mediaIndex] = {
            ...allMedia[mediaIndex],
            title,
            description,
          };
          localStorage.setItem('ss_media', JSON.stringify(allMedia));
          
          updatedData = {
            type: 'image',
            content: {
              ...contentData,
              title,
              description,
            }
          };
        }
      } else if (contentType === 'link') {
        // Update in localStorage
        const allBookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
        const bookmarkIndex = allBookmarks.findIndex((b: any) => b.id === contentData.id);
        
        if (bookmarkIndex !== -1) {
          allBookmarks[bookmarkIndex] = {
            ...allBookmarks[bookmarkIndex],
            title,
            url,
            notes,
          };
          localStorage.setItem('ss_bookmarks', JSON.stringify(allBookmarks));
          
          updatedData = {
            type: 'link',
            content: {
              ...contentData,
              title,
              url,
              text: notes,
            }
          };
        }
      }

      onSave(updatedData);
      onOpenChange(false);
      alert('Content updated successfully!');
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Failed to update content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit {contentType === 'text' ? 'Post' : contentType === 'image' ? 'Media' : 'Bookmark'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {contentType === 'text' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content..."
                  rows={6}
                />
              </div>
            </>
          )}

          {contentType === 'image' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="editImageTitle">Title</Label>
                <Input
                  id="editImageTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter media title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editImageDesc">Description</Label>
                <Textarea
                  id="editImageDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter media description"
                  rows={4}
                />
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2">
                <img 
                  src={contentData.image} 
                  alt="Preview" 
                  className="max-w-full max-h-[200px] mx-auto rounded"
                />
              </div>
            </>
          )}

          {contentType === 'link' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="editLinkTitle">Title</Label>
                <Input
                  id="editLinkTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter bookmark title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUrl">URL</Label>
                <Input
                  id="editUrl"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Add Attachments Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-semibold">Add to this post</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAttachments(!showAttachments)}
              >
                {showAttachments ? '− Hide Options' : '+ Add Content'}
              </Button>
            </div>

            {showAttachments && (
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex gap-2">
                  <Button
                    variant={attachmentType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAttachmentType('text')}
                  >
                    📝 Add Text
                  </Button>
                  <Button
                    variant={attachmentType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAttachmentType('image')}
                  >
                    📷 Add Image
                  </Button>
                  <Button
                    variant={attachmentType === 'link' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAttachmentType('link')}
                  >
                    🔗 Add Link
                  </Button>
                </div>

                {attachmentType === 'text' && (
                  <div className="space-y-2">
                    <Textarea
                      value={attachmentText}
                      onChange={(e) => setAttachmentText(e.target.value)}
                      placeholder="Type additional text content..."
                      rows={3}
                    />
                    <Button size="sm" onClick={handleAddAttachment} disabled={!attachmentText}>
                      Add Text to Post
                    </Button>
                  </div>
                )}

                {attachmentType === 'image' && (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.md"
                      onChange={handleFileChange}
                    />
                    {attachmentPreview && (
                      <div className="border rounded p-2">
                        <img src={attachmentPreview} alt="Preview" className="max-h-32 mx-auto" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Allowed: PNG, JPG, JPEG, GIF, WebP, PDF, TXT, MD (Max 10MB)
                    </p>
                    <Button size="sm" onClick={handleAddAttachment} disabled={!attachmentFile}>
                      Add Image Reference
                    </Button>
                  </div>
                )}

                {attachmentType === 'link' && (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <Button size="sm" onClick={handleAddAttachment} disabled={!attachmentUrl}>
                      Add Link to Post
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
