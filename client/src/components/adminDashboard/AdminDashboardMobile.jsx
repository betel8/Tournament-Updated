import { useState, useRef, useEffect } from 'react';
import { UserOutlined, LockOutlined, DashboardOutlined, TeamOutlined, SettingOutlined, AuditOutlined } from '@ant-design/icons';
import { Suspense } from 'react';

export default function AdminDashboardMobile({ activeTab, setActiveTab, tabItems }) {
  const tabsContainerRef = useRef(null);
  const tabButtonsRef = useRef([]);
  const [swipeStart, setSwipeStart] = useState({ x: 0, y: 0 });
  
  // Admin-specific icons
  const iconComponents = {
    UserOutlined: <UserOutlined />,
    LockOutlined: <LockOutlined />,
    DashboardOutlined: <DashboardOutlined />,
    TeamOutlined: <TeamOutlined />,
    SettingOutlined: <SettingOutlined />,
    AuditOutlined: <AuditOutlined />
  };

  // Scroll to active tab functionality
  const scrollTabIntoView = (index) => {
    if (tabButtonsRef.current[index] && tabsContainerRef.current) {
      const tab = tabButtonsRef.current[index];
      const container = tabsContainerRef.current;
      const containerWidth = container.offsetWidth;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      
      const scrollTo = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Swipe handlers for tab navigation
  const handleTouchStart = (e) => {
    setSwipeStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    if (!swipeStart.x) return;
    const xDiff = Math.abs(e.touches[0].clientX - swipeStart.x);
    const yDiff = Math.abs(e.touches[0].clientY - swipeStart.y);
    if (xDiff > yDiff && xDiff > 10) e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!swipeStart.x) return;
    const xDiff = swipeStart.x - e.changedTouches[0].clientX;
    const yDiff = swipeStart.y - e.changedTouches[0].clientY;

    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
      const currentIndex = tabItems.findIndex(tab => tab.key === activeTab);
      let newIndex = currentIndex;
      
      if (xDiff > 0 && currentIndex < tabItems.length - 1) {
        newIndex = currentIndex + 1;
      } else if (xDiff < 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        setActiveTab(tabItems[newIndex].key);
        scrollTabIntoView(newIndex);
      }
    }
    setSwipeStart({ x: 0, y: 0 });
  };

  useEffect(() => {
    const currentIndex = tabItems.findIndex(tab => tab.key === activeTab);
    scrollTabIntoView(currentIndex);
  }, [activeTab]);

  return (
    <div className="md:hidden">
      <div 
        ref={tabsContainerRef}
        className="flex mb-4 overflow-x-auto no-scrollbar py-2"
      >
        {tabItems.map((tab, index) => (
          <button
            key={tab.key}
            ref={el => tabButtonsRef.current[index] = el}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center px-4 py-2 mx-1 rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {iconComponents[tab.icon]}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      <div 
        className="overflow-y-auto h-[calc(100vh-120px)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          {tabItems.find(tab => tab.key === activeTab)?.component}
        </Suspense>
      </div>
    </div>
  );
}