import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, message } from 'antd';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Rules from './pages/Rules';
import Registration from './pages/Registration';
import Matches from './pages/Matches';
import Login from './pages/Login';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    message.config({
      maxCount: 3,
      duration: 2.5,
      top: 80,
    });
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
          colorBgContainer: '#1f2937',
          colorText: '#f3f4f6',
          colorTextDescription: '#9ca3af',
          colorTextPlaceholder: '#6b7280', // New: placeholder text color
          colorBorder: '#4b5563',
          colorBgLayout: '#111827',
          colorBgElevated: '#1f2937',
          colorFillAlter: '#1f2937',
          colorFillContent: '#1f2937',
        },
        components: {
          Layout: {
            headerBg: '#1f2937',
            bodyBg: '#111827',
          },
          Button: {
            defaultBg: '#374151',
          },
          Input: {
            colorTextPlaceholder: '#6b7280', // Specific component override
          },
          Select: {
            optionSelectedBg: '#1f2937',
            optionSelectedColor: '#ffffff',
            colorBgElevated: '#1f2937',
            colorText: '#f3f4f6',
            colorTextPlaceholder: '#6b7280', // Select placeholder color
            colorBorder: '#4b5563',
            colorPrimary: '#00b96b',
          },
          Popover: {
            colorBgElevated: '#1f2937',
          },
          Popconfirm: {
            colorBgElevated: '#1f2937',
            colorText: '#f3f4f6',
          },
          Table: {
            headerBg: '#1f2937',
            headerColor: '#f3f4f6',
            colorBgContainer: '#1f2937',
            borderColor: '#4b5563',
          },
          Card: {
            colorBgContainer: '#1f2937',
            colorBorder: '#4b5563',
          },
          Modal: {
            colorBgElevated: '#1f2937',
          },
          Dropdown: {
            colorBgElevated: '#1f2937',
          },
        },
      }}
    >
      <AntdApp>
        <div className="bg-gray-900 min-h-screen">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public routes */}
                <Route index element={<Landing />} />
                <Route path="rules" element={<Rules />} />
                <Route path="register" element={<Registration />} />
                <Route path="matches" element={<Matches />} />
                <Route path="login" element={<Login />} />

                {/* Protected routes */}
                <Route
                  path="player/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['player']}>
                      <PlayerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;