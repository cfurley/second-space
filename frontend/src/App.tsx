import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { BottomMenuBar } from './components/BottomMenuBar';
<<<<<<< HEAD
<<<<<<< HEAD
import { Login } from './components/Login';
=======
import Board from './components/Board';
>>>>>>> bf4461b (Make the sidebar and the board hover when you have your mouse is on top of the text or board, also the sidebar now when you click on it, it would selection that option and make it darker than everything else in the bar menu.)
=======
import Board from './components/Board';
=======
import { Login } from './components/Login';
>>>>>>> 6f4648f (Use cursor to set up preliminary login flow)
>>>>>>> e277e2c (Use cursor to set up preliminary login flow)

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeNav, setActiveNav] = useState('Spaces');
  const [activeSpace, setActiveSpace] = useState('My Ideas');
  const [activeFilter, setActiveFilter] = useState('Recent');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app if authenticated
  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%_,_#e5e7eb_100%)
      dark:bg-[radial-gradient(circle_at_bottom,_#0a0a0a_0%,_#1a1a1a_100%)]
      transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden h-full">
<<<<<<< HEAD
<<<<<<< HEAD
        <div className="h-full bg-black">
          <Header activeNav={activeNav} onNavChange={setActiveNav} onLogout={handleLogout} />
=======
        <div className="h-full bg-black text-foreground">
          <Header activeNav={activeNav} onNavChange={setActiveNav} />
>>>>>>> bf4461b (Make the sidebar and the board hover when you have your mouse is on top of the text or board, also the sidebar now when you click on it, it would selection that option and make it darker than everything else in the bar menu.)
=======
        <div className="h-full bg-black text-foreground">
          <Header activeNav={activeNav} onNavChange={setActiveNav} />
=======
        <div className="h-full bg-black">
          <Header activeNav={activeNav} onNavChange={setActiveNav} onLogout={handleLogout} />
>>>>>>> 6f4648f (Use cursor to set up preliminary login flow)
>>>>>>> e277e2c (Use cursor to set up preliminary login flow)
          
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