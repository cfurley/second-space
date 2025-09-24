import React from 'react';

export function FloatingMenu() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      <button className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform">
        ✏️
      </button>
      <button className="w-14 h-14 rounded-full bg-white text-gray-800 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform">
        +
      </button>
    </div>
  );
}