import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/';
  const noScrollRoutes = ['/register', '/registration']; // Add other no-scroll routes here

  const shouldDisableScroll = noScrollRoutes.includes(location.pathname);

  return (
    <div className={shouldDisableScroll ? 'h-screen flex flex-col overflow-hidden' : ''}>
      {!hideNav && <Navbar />}
      <main className={shouldDisableScroll ? 'flex-1 overflow-auto' : ''}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;