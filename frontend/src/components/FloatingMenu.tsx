import React, { useState } from 'react';
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
import { api } from "../utils/api";

type FloatingMenuProps = {
  currentSpaceId?: string;
  currentUserId?: string;
  onContentAdded?: (content: any) => void;
  onSearchChange?: (searchQuery: string) => void;
};

export function FloatingMenu({ currentSpaceId, currentUserId, onContentAdded, onSearchChange }: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const [showTextPostDialog, setShowTextPostDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  
  // Form states for Text Post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  
  // Form states for Media Upload
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaDescription, setMediaDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // Form states for Bookmark
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [bookmarkNotes, setBookmarkNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
    
    // Create preview for images
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const handleTextPostSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }

    try {
      const postData = {
        type: 'text',
        title: postTitle,
        content: postContent,
        spaceId: currentSpaceId,
        userId: currentUserId,
        createdAt: new Date().toISOString(),
        timestamp: 'just now'
      };
      
      console.log("Creating text post:", postData);
      
      // Add to local state
      if (onContentAdded) {
        onContentAdded({
          type: 'text',
          content: {
            text: `${postTitle}\n\n${postContent}`,
            timestamp: 'just now'
          }
        });
      }
      
      // TODO: When backend is ready, call: await api.createPost(postData);
      
      alert("Text post created successfully!");
      setShowTextPostDialog(false);
      setPostTitle("");
      setPostContent("");
    } catch (error) {
      console.error("Error creating text post:", error);
      alert("Failed to create text post");
    }
  };

  const handleMediaSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }
    
    if (!mediaFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('title', mediaTitle);
      formData.append('description', mediaDescription);
      formData.append('spaceId', currentSpaceId);
      if (currentUserId) {
        formData.append('userId', currentUserId);
      }
      formData.append('fileType', mediaFile.type);
      formData.append('fileName', mediaFile.name);
      formData.append('fileSize', mediaFile.size.toString());
      formData.append('createdAt', new Date().toISOString());
      
      console.log("Uploading media:", {
        title: mediaTitle,
        description: mediaDescription,
        fileName: mediaFile.name,
        fileType: mediaFile.type,
        fileSize: mediaFile.size,
        spaceId: currentSpaceId
      });
      
      // Add to local state with preview
      if (onContentAdded && mediaPreview) {
        onContentAdded({
          type: 'image',
          content: {
            title: mediaTitle,
            description: mediaDescription,
            image: mediaPreview,
            timestamp: 'just now'
          }
        });
      }
      
      // TODO: When backend is ready, call: await api.uploadMedia(formData);
      
      alert(`Media "${mediaTitle}" uploaded successfully!`);
      setShowMediaDialog(false);
      setMediaTitle("");
      setMediaDescription("");
      setMediaFile(null);
      setMediaPreview(null);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Failed to upload media");
    }
  };

  const handleBookmarkSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }

    try {
      const bookmarkData = {
        type: 'bookmark',
        title: bookmarkTitle,
        url: bookmarkUrl,
        notes: bookmarkNotes,
        spaceId: currentSpaceId,
        userId: currentUserId,
        createdAt: new Date().toISOString()
      };
      
      console.log("Creating bookmark:", bookmarkData);
      
      // Add to local state
      if (onContentAdded) {
        // Extract domain from URL
        let domain = '';
        try {
          const urlObj = new URL(bookmarkUrl);
          domain = urlObj.hostname;
        } catch (e) {
          domain = bookmarkUrl;
        }
        
        onContentAdded({
          type: 'link',
          content: {
            title: bookmarkTitle,
            text: bookmarkNotes || 'No description provided',
            domain: domain,
            timestamp: 'just now',
            url: bookmarkUrl,
            isBookmarked: true
          }
        });
      }
      
      // TODO: When backend is ready, call: await api.createBookmark(bookmarkData);
      
      alert("Bookmark saved successfully!");
      setShowBookmarkDialog(false);
      setBookmarkTitle("");
      setBookmarkUrl("");
      setBookmarkNotes("");
    } catch (error) {
      console.error("Error creating bookmark:", error);
      alert("Failed to save bookmark");
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        zIndex: 99999
      }}
    >
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '60px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              setShowTextPostDialog(true);
              setOpen(false);
            }}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2C2C2C',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            title="Create Text Post"
          >
            📝
          </button>

          <button
            onClick={() => {
              setShowMediaDialog(true);
              setOpen(false);
            }}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2C2C2C',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.05s backwards',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            title="Upload Media"
          >
            📷
          </button>

          <button
            onClick={() => {
              setShowBookmarkDialog(true);
              setOpen(false);
            }}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2C2C2C',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s backwards',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            title="Save Bookmark"
          >
            🔖
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        <button
        onClick={() => alert('New Note')}
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
      >
        ✏️
      </button>

      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.3s, box-shadow 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = open ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
      >
        +
      </button>

      <button
        onClick={() => setShowSearchDialog(true)}
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
      >
        🔍
      </button>
    </div>

      {/* Add CSS animation keyframes */}
      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Create Text Post Dialog */}
      <Dialog open={showTextPostDialog} onOpenChange={setShowTextPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create Text Post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postTitle" className="text-right">Title</Label>
              <Input
                id="postTitle"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter post title"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="postContent" className="text-right mt-2">Content</Label>
              <Textarea
                id="postContent"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="col-span-3"
                placeholder="Write your post content..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleTextPostSubmit}>Create Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Media</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="mediaTitle">Title</Label>
              <Input
                id="mediaTitle"
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
                placeholder="Enter media title"
                className="w-full"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="mediaDescription">Description</Label>
              <Input
                id="mediaDescription"
                value={mediaDescription}
                onChange={(e) => setMediaDescription(e.target.value)}
                placeholder="Enter media description"
                className="w-full"
              />
            </div>

            {/* Drag and Drop File Area */}
            <div className="space-y-2">
              <Label>File</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
                onClick={() => document.getElementById('mediaFile')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/30');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const event = { target: { files } } as any;
                    handleFileChange(event);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {mediaFile ? mediaFile.name : 'Drag and drop your file here'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports: Images, Videos, Audio, PDF, Documents
                  </p>
                </div>
                <Input
                  id="mediaFile"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
              </div>
            </div>

            {/* Preview Section */}
            {mediaPreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-4">
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="max-w-full max-h-[300px] mx-auto rounded"
                  />
                </div>
              </div>
            )}

            {/* File Info for non-images */}
            {mediaFile && !mediaFile.type.startsWith('image/') && (
              <div className="space-y-2">
                <Label>File Information</Label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{mediaFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{mediaFile.type || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{(mediaFile.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleMediaSubmit} className="w-full sm:w-auto">Upload Media</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Save Bookmark</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bookmarkTitle" className="text-right">Title</Label>
              <Input
                id="bookmarkTitle"
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter bookmark title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bookmarkUrl" className="text-right">URL</Label>
              <Input
                id="bookmarkUrl"
                type="url"
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="bookmarkNotes" className="text-right mt-2">Notes</Label>
              <Textarea
                id="bookmarkNotes"
                value={bookmarkNotes}
                onChange={(e) => setBookmarkNotes(e.target.value)}
                className="col-span-3"
                placeholder="Add optional notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBookmarkSubmit}>Save Bookmark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog 
        open={showSearchDialog} 
        onOpenChange={(isOpen) => {
          if (!isOpen && searchQuery.trim()) {
            // Save to history when closing dialog with search query
            const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
            setSearchHistory(newHistory);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
          }
          setShowSearchDialog(isOpen);
          if (!isOpen) {
            setShowHistory(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Search Posts</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Helper text above input */}
            <p className="text-sm text-gray-400 mb-3">
              {searchQuery ? `Searching for: "${searchQuery}"` : 'Type to search posts by title'}
            </p>
            
            {/* Search input without icon */}
            <div className="relative">
              <Input
                id="searchInput"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // Save to history on Enter
                    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
                    setSearchHistory(newHistory);
                    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                    setShowHistory(false);
                  }
                }}
                onFocus={() => setShowHistory(true)}
                className="w-full"
                placeholder="Search by title..."
                autoFocus
              />
              
              {/* Search History Dropdown */}
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 w-1/4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto z-50">
                  {searchHistory.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                      onClick={() => {
                        setSearchQuery(item);
                        onSearchChange?.(item);
                        setShowHistory(false);
                      }}
                    >
                      <span className="text-sm text-gray-700 flex-1">{item}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newHistory = searchHistory.filter((_, i) => i !== index);
                          setSearchHistory(newHistory);
                          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete from history"
                      >
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                onSearchChange?.("");
                setShowSearchDialog(false);
                setShowHistory(false);
              }}
            >
              Clear Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}