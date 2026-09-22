import React, { useState, useEffect } from 'react';
import { FinTrackProvider } from './context/FinTrackContext';
import Background3D from './components/Background3D';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import CreateAccountModal from './components/modals/CreateAccountModal';
import ProfileModal from './components/modals/ProfileModal';
import BudgetModal from './components/modals/BudgetModal';
import DashboardPage from './pages/DashboardPage';
import AddTransactionPage from './pages/AddTransactionPage';
import AccountDetailsPage from './pages/AccountDetailsPage';

const AppContent = () => {
  const [currentRoute, setCurrentRoute] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route) => {
    window.location.hash = route;
  };

  // Render matching page
  const renderCurrentPage = () => {
    if (currentRoute === '#/add-transaction') {
      return <AddTransactionPage navigateTo={navigateTo} />;
    }

    if (currentRoute.startsWith('#/account/')) {
      const accountId = currentRoute.replace('#/account/', '').trim();
      return <AccountDetailsPage accountId={accountId} navigateTo={navigateTo} />;
    }

    return <DashboardPage navigateTo={navigateTo} />;
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-slate-100 selection:bg-primary selection:text-white">
      {/* Three.js 3D Background Canvas */}
      <Background3D />

      {/* Top Navbar */}
      <Navbar navigateTo={navigateTo} />

      {/* Main Routed Content */}
      <div className="flex-1 flex flex-col">
        {renderCurrentPage()}
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav currentRoute={currentRoute} navigateTo={navigateTo} />

      {/* Global Modals & Toast */}
      <CreateAccountModal />
      <ProfileModal />
      <BudgetModal />
      <Toast />
    </div>
  );
};

const App = () => {
  return (
    <FinTrackProvider>
      <AppContent />
    </FinTrackProvider>
  );
};

export default App;
