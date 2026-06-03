import { lazy, Suspense, useState } from 'react';
import useMobile from '../hooks/useMobile';
import PlayerDashboardDesktop from '../components/playerDashboard/PlayerDashboardDesktop';
import PlayerDashboardMobile from '../components/playerDashboard/PlayerDashboardMobile';
import { useTranslation } from 'react-i18next';

const lazyWithRetry = (componentImport) => lazy(async () => {
  try {
    return await componentImport();
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return componentImport();
  }
});

// Lazy-loaded components
const ChangePassword = lazyWithRetry(() => import('../components/playerDashboard/ChangePassword'));
const ProfileSettings = lazyWithRetry(() => import('../components/playerDashboard/ProfileSettings'));
const StatsOverview = lazyWithRetry(() => import('../components/playerDashboard/StatsOverview'));
const RecentActivity = lazyWithRetry(() => import('../components/playerDashboard/RecentActivity'));

export default function PlayerDashboard() {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('1');
  
  const tabItems = [
    {
      key: '1',
      label: t('playerDashboard.tabs.profile'),
      icon: 'UserOutlined',
      component: <ProfileSettings />
    },
    {
      key: '2',
      label: t('playerDashboard.tabs.security'),
      icon: 'LockOutlined',
      component: <ChangePassword />
    },
    {
      key: '3',
      label: t('playerDashboard.tabs.stats'),
      icon: 'BarChartOutlined',
      component: <StatsOverview />
    },
    {
      key: '4',
      label: t('playerDashboard.tabs.activity'),
      icon: 'ClockCircleOutlined',
      component: <RecentActivity />
    },
  ];

  return (
    <div className="player-dashboard bg-gray-900 text-white min-h-screen p-4 md:p-6">
      {isMobile ? (
        <PlayerDashboardMobile 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabItems={tabItems}
        />
      ) : (
        <PlayerDashboardDesktop 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabItems={tabItems}
        />
      )}
    </div>
  );
}