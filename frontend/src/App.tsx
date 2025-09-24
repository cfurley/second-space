import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');

  return (
    <div className="h-screen bg-gray-100">
      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden h-full">
        <div className="h-full bg-black">
          <Header activeNav={activeNav} onNavChange={setActiveNav} />
          
          <div className="flex h-[calc(100vh-76px)]">
            <Sidebar activeSpace={activeSpace} onSpaceChange={setActiveSpace} />
            <ContentArea
              activeSpace={activeSpace}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          
          <BottomMenuBar />
        </div>
      </div>
    </div>
  );
}