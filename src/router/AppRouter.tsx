import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import MainWorkspace from '../pages/MainWorkspace';
import AssetManager from '../pages/AssetManager';
import SettingsPage from '../pages/SettingsPage';
import HelpPage from '../pages/HelpPage';
import AboutPage from '../pages/AboutPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<MainWorkspace />} />
        <Route path="assets" element={<AssetManager />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
