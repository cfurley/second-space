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

  // If not authenticated, show the login screen only. The login component
  // will call onClose when the user submits or cancels — for now cancel
  // also proceeds to the homepage (temporary behavior). See TODO comments.
  if (!isAuthenticated) {
    return (
      <div 
        className="relative flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundColor: 'var(--ss-background)',
          minHeight: '100vh',
          width: '100vw',
          height: '100vh'
        }}
      >
        <AnimatedBackground />
        <Login isOpen={true} onClose={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <FloatingMenu onAddAdvertisement={() => alert('test')} />
      <div className="h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%_,_#e5e7eb_100%)
        dark:bg-[radial-gradient(circle_at_bottom,_#0a0a0a_0%,_#1a1a1a_100%)]
        transition-colors duration-500">
        <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden h-full">
          <div className="h-full bg-black text-foreground">
            <Header activeNav={activeNav} onNavChange={setActiveNav} />
            <div className="flex h-[calc(100vh-76px)]">
              <Sidebar activeSpace={activeSpace} onSpaceChange={setActiveSpace} />
              <ContentArea
                activeSpace={activeSpace}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
            <div className="bg-background text-foreground">
              <Board />
            </div>
            <BottomMenuBar />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}