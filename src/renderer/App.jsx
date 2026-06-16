import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './router';
import AppShell from './components/layout/AppShell';

export default function App() {
  return (
    <MemoryRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </MemoryRouter>
  );
}
