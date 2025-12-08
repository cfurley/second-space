import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
import Board from './components/Board';
import Login from './components/login';
import { FloatingMenu } from './components/FloatingMenu';
import { EditContentDialog } from './components/EditContentDialog';
import AnimatedBackground from './components/AnimatedBackground';
import { api } from './utils/api';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { getDefaultSpaceContent } from './utils/demo';
import { ChatBot } from './components/ChatBot';
import { ChatBotButton } from './components/ChatBotButton';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');
  // Simple demo auth: app starts unauthenticated and shows login screen
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Set to false to require login
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // User and space IDs for FloatingMenu
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user-123');
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('space-my-ideas');
  
  // Content items stored by space
  const [spaceContent, setSpaceContent] = useState<{[key: string]: any[]}>(getDefaultSpaceContent());
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Delete mode state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // ChatBot state
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  
  // Load content from localStorage and backend on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load localStorage content (posts and bookmarks - not on backend yet)
        const posts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
        const bookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
        
        // Fetch media from backend for each space
        let backendMedia: any[] = [];
        try {
          // Fetch media for each space (space IDs 1, 2, 3)
          const spaceIds = [1, 2, 3];
          const mediaPromises = spaceIds.map(async (spaceId) => {
            try {
              const result = await api.getMediaBySpace(spaceId.toString());
              if (result.success && Array.isArray(result.data)) {
                return result.data.map((m: any) => ({
                  ...m,
                  spaceId: spaceId === 1 ? 'space-my-ideas' : spaceId === 2 ? 'space-work' : 'space-personal'
                }));
              }
              return [];
            } catch (err) {
              console.error(`Failed to load media for space ${spaceId}:`, err);
              return [];
            }
          });
          const mediaArrays = await Promise.all(mediaPromises);
          backendMedia = mediaArrays.flat();
        } catch (err) {
          console.error('Failed to load media from backend:', err);
        }
        
        // Combine all content
        const allContent = [...posts, ...backendMedia, ...bookmarks];
        
        // Group content by space
        const contentBySpace: {[key: string]: any[]} = {
          'My Ideas': [],
          'Work': [],
          'Personal': [],
        };
        
        allContent.forEach((item: any) => {
          // Map spaceId to space name
          let spaceName = 'My Ideas'; // default
          if (item.spaceId === 'space-work') spaceName = 'Work';
          else if (item.spaceId === 'space-personal') spaceName = 'Personal';
          
          // Convert to content format expected by ContentArea
          if (item.type === 'text') {
            contentBySpace[spaceName].push({
              type: 'text',
              content: {
                id: item.id,
                text: `${item.title}\n\n${item.content}`,
                timestamp: new Date(item.createdAt).toLocaleString(),
                isBookmarked: item.isBookmarked || false
              }
            });
          } else if (item.type === 'image' || item.fileData || item.filename) {
            // Handle both localStorage media (fileData) and backend media (filename/filepath)
            const imageUrl = item.fileData || (item.filepath ? `http://localhost:8080${item.filepath}` : '');
            contentBySpace[spaceName].push({
              type: 'image',
              content: {
                id: item.id,
                title: item.title || item.filename,
                description: item.description || '',
                image: imageUrl,
                timestamp: item.create_date_utc ? new Date(item.create_date_utc).toLocaleString() : new Date(item.createdAt).toLocaleString(),
                isBookmarked: item.isBookmarked || false
              }
            });
          } else if (item.type === 'bookmark') {
            // Extract domain from URL
            let domain = '';
            try {
              const urlObj = new URL(item.url);
              domain = urlObj.hostname;
            } catch (e) {
              domain = item.url;
            }
            
            contentBySpace[spaceName].push({
              type: 'link',
              content: {
                id: item.id,
                title: item.title,
                text: item.notes || 'No description provided',
                domain: domain,
                timestamp: new Date(item.createdAt).toLocaleString(),
                url: item.url,
                isBookmarked: item.isBookmarked || false
              }
            });
          }
        });
        
        setSpaceContent(contentBySpace);
      } catch (error) {
        console.error('Error loading content from localStorage:', error);
      }
    };
    
    loadContent();
  }, []);
  
  // Function to add new content to current space
  const addContentToSpace = (content: any) => {
    setSpaceContent(prev => ({
      ...prev,
      [activeSpace]: [...(prev[activeSpace] || []), content]
    }));
  };
  
  // Toggle delete mode
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedItemIds([]);
  };
  
  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItemIds.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedItemIds.length} item(s)? This cannot be undone.`)) {
      return;
    }
    
    try {
      const allPosts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
      const allMedia = JSON.parse(localStorage.getItem('ss_media') || '[]');
      const allBookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
      
      const filteredPosts = allPosts.filter((item: any) => !selectedItemIds.includes(item.id));
      const filteredMedia = allMedia.filter((item: any) => !selectedItemIds.includes(item.id));
      const filteredBookmarks = allBookmarks.filter((item: any) => !selectedItemIds.includes(item.id));
      
      localStorage.setItem('ss_posts', JSON.stringify(filteredPosts));
      localStorage.setItem('ss_media', JSON.stringify(filteredMedia));
      localStorage.setItem('ss_bookmarks', JSON.stringify(filteredBookmarks));
      
      // Update local state by reloading content from localStorage
      const allContent = [...filteredPosts, ...filteredMedia, ...filteredBookmarks];
      
      // Group content by space
      const contentBySpace: {[key: string]: any[]} = {
        'My Ideas': [],
        'Work': [],
        'Personal': [],
      };
      
      allContent.forEach((item: any) => {
        // Map spaceId to space name
        let spaceName = 'My Ideas'; // default
        if (item.spaceId === 'space-work') spaceName = 'Work';
        else if (item.spaceId === 'space-personal') spaceName = 'Personal';
        
        // Convert to content format expected by ContentArea
        if (item.type === 'text') {
          contentBySpace[spaceName].push({
            type: 'text',
            content: {
              id: item.id,
              text: `${item.title}\n\n${item.content}`,
              timestamp: new Date(item.createdAt).toLocaleString(),
              isBookmarked: item.isBookmarked || false
            }
          });
        } else if (item.type === 'image' || item.fileData) {
          contentBySpace[spaceName].push({
            type: 'image',
            content: {
              id: item.id,
              title: item.title,
              description: item.description,
              image: item.fileData,
              timestamp: new Date(item.createdAt).toLocaleString(),
              isBookmarked: item.isBookmarked || false
            }
          });
        } else if (item.type === 'bookmark') {
          // Extract domain from URL
          let domain = '';
          try {
            const urlObj = new URL(item.url);
            domain = urlObj.hostname;
          } catch (e) {
            domain = item.url;
          }
          
          contentBySpace[spaceName].push({
            type: 'link',
            content: {
              id: item.id,
              title: item.title,
              text: item.notes || 'No description provided',
              domain: domain,
              timestamp: new Date(item.createdAt).toLocaleString(),
              url: item.url,
              isBookmarked: item.isBookmarked || false
            }
          });
        }
      });
      
      setSpaceContent(contentBySpace);
      setSelectedItemIds([]);
      setIsDeleteMode(false);
      
      alert(`Successfully deleted ${selectedItemIds.length} item(s)!`);
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items');
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Handle item click for editing
  const handleItemEdit = (item: any, itemType: 'text' | 'image' | 'link') => {
    setEditingItem({ ...item, itemType });
    setShowEditDialog(true);
  };
  
  // Handle content save after editing
  const handleContentSave = (updatedContent: any) => {
    // Reload content from localStorage
    const loadContent = () => {
      try {
        const posts = JSON.parse(localStorage.getItem('ss_posts') || '[]');
        const media = JSON.parse(localStorage.getItem('ss_media') || '[]');
        const bookmarks = JSON.parse(localStorage.getItem('ss_bookmarks') || '[]');
        
        const allContent = [...posts, ...media, ...bookmarks];
        
        const contentBySpace: {[key: string]: any[]} = {
          'My Ideas': [],
          'Work': [],
          'Personal': [],
        };
        
        allContent.forEach((item: any) => {
          let spaceName = 'My Ideas';
          if (item.spaceId === 'space-work') spaceName = 'Work';
          else if (item.spaceId === 'space-personal') spaceName = 'Personal';
          
          if (item.type === 'text') {
            contentBySpace[spaceName].push({
              type: 'text',
              content: {
                id: item.id,
                text: `${item.title}\n\n${item.content}`,
                timestamp: new Date(item.createdAt).toLocaleString(),
                isBookmarked: item.isBookmarked || false
              }
            });
          } else if (item.type === 'image' || item.fileData) {
            contentBySpace[spaceName].push({
              type: 'image',
              content: {
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.fileData,
                timestamp: new Date(item.createdAt).toLocaleString(),
                isBookmarked: item.isBookmarked || false
              }
            });
          } else if (item.type === 'bookmark') {
            let domain = '';
            try {
              const urlObj = new URL(item.url);
              domain = urlObj.hostname;
            } catch (e) {
              domain = item.url;
            }
            
            contentBySpace[spaceName].push({
              type: 'link',
              content: {
                id: item.id,
                title: item.title,
                text: item.notes || 'No description provided',
                domain: domain,
                timestamp: new Date(item.createdAt).toLocaleString(),
                url: item.url,
                isBookmarked: item.isBookmarked || false
              }
            });
          }
        });
        
        setSpaceContent(contentBySpace);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    
    loadContent();
    setShowEditDialog(false);
  };

  // If not authenticated, show the landing page with "Open Login" button
  if (!isAuthenticated) {
    return (
      <div 
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ 
          backgroundColor: 'var(--ss-background)',
          minHeight: '100vh',
          width: '100vw',
          height: '100vh'
        }}
      >
        
        {/* Landing page content with circular gradient blur exclusion zone */}
        <div className="relative z-10 flex flex-col items-center pointer-events-auto">
          {/* Circular gradient mask - blur only in center, clear edges */}
          <div 
            className="absolute"
            style={{
              width: '500px',
              height: '500px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.85) 20%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.1) 75%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle, black 0%, black 50%, transparent 100%)',
              maskImage: 'radial-gradient(circle, black 0%, black 50%, transparent 100%)',
              borderRadius: '50%',
              zIndex: -1,
              pointerEvents: 'none',
            }}
          >
            {/* Inner blur layer - only affects center */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backdropFilter: 'blur(0px)',
                WebkitBackdropFilter: 'blur(0px)',
                background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'radial-gradient(circle, black 0%, black 60%, transparent 100%)',
                maskImage: 'radial-gradient(circle, black 0%, black 60%, transparent 100%)',
              }}
            />
          </div>
          
          {/* Blur overlay only in center area */}
          <div
            className="absolute"
            style={{
              width: '350px',
              height: '350px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
              maskImage: 'radial-gradient(circle, black 20%, transparent 70%)',
              borderRadius: '50%',
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
          
          <h1 
            className="mb-8 text-center"
            style={{
              fontSize: '4rem',
              fontWeight: 700,
              color: 'white',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.02em',
              position: 'relative',
              zIndex: 2,
            }}
          >
            Second Space
          </h1>
          
          <button
            onClick={() => setShowLoginModal(true)}
            className="rounded-full transition-all duration-300"
            style={{
              padding: '18px 60px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
            }}
          >
            Open Login
          </button>
        </div>
        
        <Login 
          isOpen={showLoginModal} 
          onClose={(authenticated = false) => {
            setShowLoginModal(false);
            if (authenticated) {
              setIsAuthenticated(true);
            }
          }} 
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-black overflow-hidden relative">
      {/* Theme Selector Button is now embedded in the Sidebar */}
      
      <FloatingMenu 
        currentSpaceId={currentSpaceId} 
        currentUserId={currentUserId}
        onContentAdded={addContentToSpace}
        onSearchChange={setSearchQuery}
        isDeleteMode={isDeleteMode}
        onToggleDeleteMode={toggleDeleteMode}
        selectedCount={selectedItemIds.length}
        onDeleteSelected={deleteSelectedItems}
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
      />
      <EditContentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        contentType={editingItem?.itemType || 'text'}
        contentData={editingItem}
        onSave={handleContentSave}
      />
      
      {/* ChatBot Components */}
      <ChatBotButton onClick={() => setIsChatBotOpen(true)} />
      <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
      
      <div className="w-full h-full flex flex-col relative z-10">
        <Header 
          activeNav={activeNav} 
          onNavChange={setActiveNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeSpace={activeSpace} onSpaceChange={setActiveSpace} />
          <ContentArea
            activeSpace={activeSpace}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            spaceContent={spaceContent[activeSpace] || []}
            searchQuery={searchQuery}
            isDeleteMode={isDeleteMode}
            selectedItemIds={selectedItemIds}
            onToggleItemSelection={toggleItemSelection}
            isEditMode={isEditMode}
            onItemEdit={handleItemEdit}
          />
        </div>
      </div>
    </div>
  );
}
