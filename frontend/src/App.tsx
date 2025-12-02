import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
import Board from './components/Board';
import Login from './components/login';
import { FloatingMenu } from './components/FloatingMenu';
import AnimatedBackground from './components/AnimatedBackground';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');
  // Simple demo auth: app starts unauthenticated and shows login screen
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // User and space IDs for FloatingMenu
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user-123');
  const [currentSpaceId, setCurrentSpaceId] = useState<string>('space-my-ideas');
  
  // Content items stored by space
  const [spaceContent, setSpaceContent] = useState<{[key: string]: any[]}>({
    'My Ideas': [],
    'Work': [],
    'Personal': [],
  });
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Function to add new content to current space
  const addContentToSpace = (content: any) => {
    setSpaceContent(prev => ({
      ...prev,
      [activeSpace]: [...(prev[activeSpace] || []), content]
    }));
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
        <AnimatedBackground />
        
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <FloatingMenu 
        currentSpaceId={currentSpaceId} 
        currentUserId={currentUserId}
        onContentAdded={addContentToSpace}
        onSearchChange={setSearchQuery}
      />
      <div className="h-screen w-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%_,_#e5e7eb_100%)]
        dark:bg-[radial-gradient(circle_at_bottom,_#0a0a0a_0%,_#1a1a1a_100%)]
        transition-colors duration-500">
        <div className="w-full h-full bg-black text-foreground">
          <Header activeNav={activeNav} onNavChange={setActiveNav} />
          <div className="flex h-[calc(100vh-140px)]">
            <Sidebar activeSpace={activeSpace} onSpaceChange={setActiveSpace} />
            <ContentArea
              activeSpace={activeSpace}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              spaceContent={spaceContent[activeSpace] || []}
              searchQuery={searchQuery}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}