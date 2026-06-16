import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BrowsePage from '../pages/BrowsePage';
import ComparePage from '../pages/ComparePage';
import StatsPage from '../pages/StatsPage';
import SettingsPage from '../pages/SettingsPage';
import WelcomePage from '../pages/WelcomePage';
import useStore from '../stores';

function RouteSaver() {
  const location = useLocation();
  const open = useStore(s => s.isProjectOpen);

  useEffect(() => {
    if (!open) return;
    window.api.invoke('settings:set', 'lastRoute', location.pathname);
  }, [location.pathname, open]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <RouteSaver />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  );
}
