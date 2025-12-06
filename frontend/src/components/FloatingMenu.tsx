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
import { MediaUploadDialog } from "./MediaUploadDialog";
import { api } from "../utils/api";

type FloatingMenuProps = {
  currentSpaceId?: string;
  currentUserId?: string;
  onContentAdded?: (content: any) => void;
  onSearchChange?: (searchQuery: string) => void;
  isDeleteMode?: boolean;
  onToggleDeleteMode?: () => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
};

export function FloatingMenu({ 
  currentSpaceId, 
  currentUserId, 
  onContentAdded, 
  onSearchChange,
  isDeleteMode = false,
  onToggleDeleteMode,
  selectedCount = 0,
  onDeleteSelected,
  isEditMode = false,
  onToggleEditMode
}: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const [showTextPostDialog, setShowTextPostDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState<'text' | 'media' | 'bookmark' | null>(null);
  
  // Form states for Text Post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  
  // Form states for Bookmark
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [bookmarkNotes, setBookmarkNotes] = useState("");
  
  // Delete dialog state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const handleTextPostSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }

    try {
      const postData = {
        title: postTitle,
        content: postContent,
        spaceId: currentSpaceId,
        userId: currentUserId
      };
      
      console.log("Creating text post:", postData);
      
      // Save to API (localStorage)
      const result = await api.createPost(postData);
      
      // Add to local state for immediate UI update
      if (onContentAdded && result.success) {
        onContentAdded({
          type: 'text',
          content: {
            id: result.data.id,
            text: `${postTitle}\n\n${postContent}`,
            timestamp: 'just now'
          }
        });
      }
      
      alert("Text post created successfully!");
      setShowTextPostDialog(false);
      setPostTitle("");
      setPostContent("");
    } catch (error) {
      console.error("Error creating text post:", error);
      alert("Failed to create text post. Please try again.");
    }
  };

  const handleBookmarkSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }

    try {
      const bookmarkData = {
        title: bookmarkTitle,
        url: bookmarkUrl,
        notes: bookmarkNotes,
        spaceId: currentSpaceId,
        userId: currentUserId
      };
      
      console.log("Creating bookmark:", bookmarkData);
      
      // Save to API (localStorage)
      const result = await api.createBookmark(bookmarkData);
      
      // Add to local state for immediate UI update
      if (onContentAdded && result.success) {
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
            id: result.data.id,
            title: bookmarkTitle,
            text: bookmarkNotes || 'No description provided',
            domain: domain,
            timestamp: 'just now',
            url: bookmarkUrl,
            isBookmarked: false
          }
        });
      }
      
      alert("Link saved successfully!");
      setShowBookmarkDialog(false);
      setBookmarkTitle("");
      setBookmarkUrl("");
      setBookmarkNotes("");
    } catch (error) {
      console.error("Error creating bookmark:", error);
      alert("Failed to save link. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }
    
    if (selectedItems.length === 0) {
      alert("Please select at least one item to delete");
      return;
    }

    try {
      const allPosts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
      const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      const allBookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
      
      // Filter out selected items
      const updatedPosts = allPosts.filter((item: any) => !selectedItems.includes(item.id));
      const updatedMedia = allMedia.filter((item: any) => !selectedItems.includes(item.id));
      const updatedBookmarks = allBookmarks.filter((item: any) => !selectedItems.includes(item.id));
      
      localStorage.setItem('ss_posts', JSON.stringify(updatedPosts));
      localStorage.setItem('ss_media', JSON.stringify(updatedMedia));
      localStorage.setItem('ss_bookmarks', JSON.stringify(updatedBookmarks));
      
      alert(`Successfully deleted ${selectedItems.length} item(s)!`);
      setShowDeleteDialog(false);
      setSelectedItems([]);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
  };
  
  // Load available items when delete dialog opens
  const loadAvailableItems = () => {
    if (!currentSpaceId) return;
    
    try {
      const allPosts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
      const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      const allBookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
      
      // Filter by current space and combine
      const items = [
        ...allPosts.filter((item: any) => item.spaceId === currentSpaceId).map((item: any) => ({
          ...item,
          itemType: 'post',
          displayTitle: item.title || 'Text Post',
          displayDescription: item.content?.substring(0, 50) + '...' || ''
        })),
        ...allMedia.filter((item: any) => item.spaceId === currentSpaceId).map((item: any) => ({
          ...item,
          itemType: 'media',
          displayTitle: item.title || item.fileName,
          displayDescription: item.description || `${item.fileType} - ${(item.fileSize / 1024).toFixed(2)} KB`
        })),
        ...allBookmarks.filter((item: any) => item.spaceId === currentSpaceId).map((item: any) => ({
          ...item,
          itemType: 'bookmark',
          displayTitle: item.title,
          displayDescription: item.url
        }))
      ];
      
      setAvailableItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems.map(item => item.id));
    }
  };
  
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
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
            title="Save Link"
          >
            🔖
          </button>

          <button
            onClick={() => {
              onToggleEditMode?.();
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
              animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.15s backwards',
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
            title="Edit Mode"
          >
            ✏️
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        {isEditMode ? (
          <button
            onClick={onToggleEditMode}
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
            title="Exit Edit Mode"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        ) : isDeleteMode ? (
          <>
            <button
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: selectedCount > 0 ? '#2C2C2C' : '#6B7280',
                color: 'white',
                borderRadius: '50%',
                border: 'none',
                cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: selectedCount > 0 ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: selectedCount > 0 ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (selectedCount > 0) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = selectedCount > 0 ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              title={`Delete ${selectedCount} item(s)`}
            >
              🗑️
              {selectedCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '2px solid #1F2937'
                }}>
                  {selectedCount}
                </span>
              )}
            </button>
            <button
              onClick={onToggleDeleteMode}
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
              title="Cancel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onToggleDeleteMode}
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
              title="Delete Mode"
            >
              🗑️
            </button>
          </>
        )}

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
      <MediaUploadDialog
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
        currentSpaceId={currentSpaceId}
        currentUserId={currentUserId}
        onMediaUploaded={onContentAdded}
      />

      {/* Save Link Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Save Link</DialogTitle>
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
            <Button onClick={handleBookmarkSubmit}>Save Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (open) loadAvailableItems();
        else setSelectedItems([]);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete Content</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {availableItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No content in this space to delete</p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select items to delete ({selectedItems.length} selected)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedItems.length === availableItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {availableItems.map((item) => (
                    <label 
                      key={item.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                            {item.itemType === 'post' ? '📝 Post' : 
                             item.itemType === 'media' ? '📷 Media' : 
                             '🔖 Bookmark'}
                          </span>
                          <span className="font-medium truncate">{item.displayTitle}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {item.displayDescription}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
            
            {selectedItems.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-4">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Warning: You are about to delete {selectedItems.length} item(s). This action cannot be undone!
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={selectedItems.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Selected ({selectedItems.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Search Posts</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <Input
                id="searchInput"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                className="pl-10 w-full"
                placeholder="Search by title..."
                autoFocus
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {searchQuery ? `Searching for: "${searchQuery}"` : 'Type to search posts by title'}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                onSearchChange?.("");
                setShowSearchDialog(false);
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