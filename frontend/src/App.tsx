import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
import FloatingMenu from './components/FloatingMenu';

export default function App() {
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');

  // NEW — spaces state lives here
  const [spaces, setSpaces] = useState<string[]>([
    'My Ideas', 'Inspiration', 'Favorites'
  ]);
  
  const addSpace = (name: string) => {
    const n = name.trim();
    if (!n) return;
    if (spaces.includes(n)) return alert(`Space "${n}" already exists.`);
    setSpaces(prev => [...prev, n]);
    setActiveSpace(n);
  };

  const deleteSpace = (name: string) => {
    setSpaces(prev => prev.filter(s => s !== name));
    if (activeSpace === name && spaces.length > 1) {
      setActiveSpace(spaces.find(s => s !== name) || 'My Ideas');
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden h-full">
        <div className="h-full bg-black">
          <Header activeNav={activeNav} onNavChange={setActiveNav} />
          
          <div className="flex h-[calc(100vh-76px)]">
            <Sidebar 
              spaces={spaces}
              activeSpace={activeSpace}
              onSpaceChange={setActiveSpace}
              onAddSpace={addSpace}          // NEW
              onDeleteSpace={deleteSpace}    // NEW
              />

            <ContentArea
              activeSpace={activeSpace}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          
          <BottomMenuBar />

          <div className="fixed bottom-6 right-6 z-50">
          <FloatingMenu
            type="image" content={{ timestamp: "2025-10-06 12:00" }}
            onEdit={() => console.log('Edit Space clicked')}
            onAdd={() => {
              const name = prompt('New space name?');
              if (name) addSpace(name);
            }}
            onSearch={() => console.log('Search Media clicked')}
          />
          </div>
        </div>
      </div>
    </div>
  );
}