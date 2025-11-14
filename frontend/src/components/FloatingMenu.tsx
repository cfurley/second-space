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
};

export function FloatingMenu({ currentSpaceId, currentUserId, onContentAdded }: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const [showTextPostDialog, setShowTextPostDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  
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
            text: `**${postTitle}**\n\n${postContent}`,
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
            url: bookmarkUrl
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
        <div
          style={{
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
            padding: '8px',
            marginBottom: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '200px'
          }}
        >
          <button
            onClick={() => {
              setShowTextPostDialog(true);
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C3C3C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>📝</span> Create Text Post
          </button>
          <button
            onClick={() => {
              setShowMediaDialog(true);
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C3C3C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>�</span> Upload Media
          </button>
          <button
            onClick={() => {
              setShowBookmarkDialog(true);
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C3C3C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>🔖</span> Save Bookmark
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        <button
        onClick={() => alert('New Note')}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        ✏️
      </button>

      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        +
      </button>

      <button
        onClick={() => alert('Search')}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        🔍
      </button>
    </div>

      {/* Create Text Post Dialog */}
      <Dialog open={showTextPostDialog} onOpenChange={setShowTextPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Text Post</DialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mediaTitle" className="text-right">Title</Label>
              <Input
                id="mediaTitle"
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter media title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mediaDescription" className="text-right">Description</Label>
              <Input
                id="mediaDescription"
                value={mediaDescription}
                onChange={(e) => setMediaDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter media description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mediaFile" className="text-right">File</Label>
              <Input
                id="mediaFile"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
            </div>
            {mediaPreview && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Preview</Label>
                <div className="col-span-3">
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                  />
                </div>
              </div>
            )}
            {mediaFile && !mediaFile.type.startsWith('image/') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">File Info</Label>
                <div className="col-span-3 text-sm">
                  <p><strong>Name:</strong> {mediaFile.name}</p>
                  <p><strong>Type:</strong> {mediaFile.type}</p>
                  <p><strong>Size:</strong> {(mediaFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleMediaSubmit}>Upload Media</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Bookmark Dialog */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Bookmark</DialogTitle>
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
    </div>
  );
}