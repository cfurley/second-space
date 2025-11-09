import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
import Board from './components/Board';
import Login from './components/login';
import { FloatingMenu } from './components/FloatingMenu';
import AnimatedBackground from './components/AnimatedBackground';
import { AIChatBot } from './components/AIChatBot';
import { Sparkles, Stars, X } from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showNeuralView, setShowNeuralView] = useState(false);

  // Login persistence - check if user was previously logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const loginTime = localStorage.getItem('loginTime');

        if (authToken && userData && loginTime) {
          // Check if login is still valid (24 hours)
          const loginTimestamp = parseInt(loginTime);
          const now = Date.now();
          const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);

          if (hoursSinceLogin < 24) {
            // Still valid, restore session
            setIsAuthenticated(true);
            console.log('? Restored login session');
          } else {
            // Expired, clear data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('loginTime');
            console.log('? Login session expired');
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('loginTime');
      }
    };

    checkLoginStatus();
  }, []);

  // Save login session
  const handleLoginSuccess = (userData: any) => {
    try {
      localStorage.setItem('authToken', 'mock-token-' + Date.now());
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('loginTime', Date.now().toString());
      setIsAuthenticated(true);
      setShowLoginModal(false);
      console.log('?? Login session saved');
    } catch (error) {
      console.error('Error saving login session:', error);
    }
  };

  // Clear login session
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    console.log('?? Logged out and cleared session');
  };

  // If not authenticated, show the landing page
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
      <FloatingMenu onAddAdvertisement={() => alert('test')} />
      
      {/* AI Chat Bot Button - Fixed position */}
      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="Open AI Assistant"
      >
        <Sparkles size={24} className="text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
      </button>

      {/* Neural Memory Stars Button - Fixed position */}
      <button
        onClick={() => setShowNeuralView(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        title="View Memory Constellation"
      >
        <Stars size={24} className="text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black animate-pulse" />
      </button>

      {/* AI Chat Modal */}
      <AIChatBot
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        context={{
          spaceName: activeSpace,
        }}
      />

      {/* Neural Memory Stars Modal */}
      {showNeuralView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl h-[80vh] bg-black border border-yellow-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Stars size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Memory Constellation</h3>
                  <p className="text-white/50 text-xs">
                    {activeSpace} • Neural Network View
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNeuralView(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-white/70" />
              </button>
            </div>

            {/* Neural Grid Content */}
            <div className="flex-1 h-full">
              <ContentArea
                activeSpace={activeSpace}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                forceNeuralView={true}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="h-screen w-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%_,_#e5e7eb_100%)
        dark:bg-[radial-gradient(circle_at_bottom,_#0a0a0a_0%,_#1a1a1a_100%)]
        transition-colors duration-500">
        <div className="w-full h-full bg-black text-foreground">
          <Header
            activeNav={activeNav}
            onNavChange={setActiveNav}
            onLogout={handleLogout}
          />
          <div className="flex h-[calc(100vh-140px)]">
            <Sidebar activeSpace={activeSpace} onSpaceChange={setActiveSpace} />
            <ContentArea
              activeSpace={activeSpace}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}