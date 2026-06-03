import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BlobBackground from './BlobBackground';

export default function HeroSection() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
          className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/30 hover:bg-white/30 transition-all"
        >
          <span className="text-sm font-medium">
            {i18n.language === 'en' ? 'English' : 'አማርኛ'}
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.webp"
          srcSet="/hero-bg-mobile.webp 640w, /hero-bg.webp 1920w"
          alt="FC 25 Tournament at CyberHub GameZone"
          className="w-full h-full object-cover lg:object-fill"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <BlobBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6">
            <span className="text-white">{t('hero.title')}</span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 text-gray-100"
          >
            {t('hero.subtitle')}
            <br />
            <span className="text-yellow-300 font-medium">{t('hero.freeRegistration')}</span> - {t('hero.fee')}
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/register" className="no-underline">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 sm:px-8 sm:py-3 rounded-lg shadow-lg transition-all text-white font-medium text-sm sm:text-base"
              >
                {t('hero.register')}
              </motion.button>
            </Link>
            
            <Link to="/login" className="no-underline">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 sm:px-8 sm:py-3 rounded-lg transition-all text-white font-medium text-sm sm:text-base"
              >
                {t('hero.login')}
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}