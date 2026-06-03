import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">CyberHub GameZone</h3>
            <p className="text-gray-400 text-sm">FC 25 Tournament {currentYear}</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/register" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Register
            </Link>
            <Link 
              to="/login" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/rules" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Rules
            </Link>
            <Link 
              to="/matches" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Matches
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} CyberHub GameZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}