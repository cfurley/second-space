import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
import Board from './components/Board';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');

  return (
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
  );
}