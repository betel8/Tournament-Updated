// src/components/playerDashboard/PlayerDashboardDesktop.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  BarChartOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { Suspense } from 'react';

const tabIcons = {
  '1': <UserOutlined className="text-lg" />,
  '2': <LockOutlined className="text-lg" />,
  '3': <BarChartOutlined className="text-lg" />,
  '4': <ClockCircleOutlined className="text-lg" />
};

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { opacity: 0, x: 20 }
};

const sidebarVariants = {
  open: { width: 240 },
  collapsed: { width: 80 }
};

export default function PlayerDashboardDesktop({ activeTab, setActiveTab, tabItems }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh-2rem)]">
      {/* Animated Sidebar */}
      <motion.div
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "open"}
        variants={sidebarVariants}
        className="bg-gray-800 rounded-xl flex flex-col overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {!isSidebarCollapsed && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-semibold text-lg"
            >
              Dashboard
            </motion.h2>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isSidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          className="flex-1"
          items={tabItems.map(item => ({
            key: item.key,
            label: (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center py-3 px-4"
              >
                {tabIcons[item.key]}
                {!isSidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            )
          }))}
          tabBarStyle={{
            height: '100%',
            background: 'transparent',
            borderRight: 'none'
          }}
          indicator={{
            size: (origin) => origin - 10,
            style: {
              backgroundColor: '#3B82F6',
              left: 0,
              right: 'auto',
              borderRadius: '4px 0 0 4px',
              width: '4px'
            }
          }}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 ml-6 overflow-hidden">
        <div className="bg-gray-800 rounded-xl h-full p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }>
                {tabItems.find(tab => tab.key === activeTab)?.component}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}