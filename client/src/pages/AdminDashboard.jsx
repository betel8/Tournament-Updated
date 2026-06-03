import { lazy, Suspense, useState } from 'react';
import useMobile from '../hooks/useMobile';
import AdminDashboardDesktop from '../components/adminDashboard/AdminDashboardDesktop';
import AdminDashboardMobile from '../components/adminDashboard/AdminDashboardMobile';
import { useTranslation } from 'react-i18next';

const lazyWithRetry = (componentImport) => lazy(async () => {
  try {
    return await componentImport();
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return componentImport();
  }
});

// Lazy-loaded admin components
const PlayersManagement = lazyWithRetry(() => import('../components/adminDashboard/PlayersTable'));
const TournamentPlayerManagement = lazyWithRetry(() => import('../components/adminDashboard/TournamentPlayers'));
const MatchManagement = lazyWithRetry(() => import('../components/adminDashboard/CreateMatches'));
const LeagueManagement = lazyWithRetry(() => import('../components/adminDashboard/TournamentLeagues'));
const ResultsManagement = lazyWithRetry(() => import('../components/adminDashboard/AddMatchResult'));
const AutomationTools = lazyWithRetry(() => import('../components/adminDashboard/AutoGenerate'));
const Communications = lazyWithRetry(() => import('../components/adminDashboard/SendScheduleSMS'));

export default function AdminDashboard() {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('1');
  
  const tabItems = [
    {
      key: '1',
      label: t('adminDashboard.tabs.players'),
      icon: 'TeamOutlined',
      component: <PlayersManagement />
    },
    {
      key: '2',
      label: t('adminDashboard.tabs.tournamentPlayers'),
      icon: 'UsergroupAddOutlined',
      component: <TournamentPlayerManagement />
    },
    {
      key: '3',
      label: t('adminDashboard.tabs.matches'),
      icon: 'CalendarOutlined',
      component: <MatchManagement />
    },
    {
      key: '4',
      label: t('adminDashboard.tabs.leagues'),
      icon: 'TrophyOutlined',
      component: <LeagueManagement />
    },
    {
      key: '5',
      label: t('adminDashboard.tabs.results'),
      icon: 'CheckCircleOutlined',
      component: <ResultsManagement />
    },
    {
      key: '6',
      label: t('adminDashboard.tabs.automation'),
      icon: 'RobotOutlined',
      component: <AutomationTools />
    },
    {
      key: '7',
      label: t('adminDashboard.tabs.communications'),
      icon: 'MessageOutlined',
      component: <Communications />
    }
  ];

  return (
    <div className="admin-dashboard bg-gray-900 text-white min-h-screen p-4 md:p-6">
      <Suspense fallback={<div className="text-center py-10">{t('common.loading')}</div>}>
        {isMobile ? (
          <AdminDashboardMobile 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabItems={tabItems}
          />
        ) : (
          <AdminDashboardDesktop 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabItems={tabItems}
          />
        )}
      </Suspense>
    </div>
  );
}