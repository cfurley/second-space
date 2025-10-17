import React from 'react';
import AuthGate from './containers/AuthGate';
import MainLayout from './containers/MainLayout';

export default function App() {
  return (
    <AuthGate>
      <MainLayout />
    </AuthGate>
  );
}