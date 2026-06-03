import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FinalCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          {t('finalCTA.title')}
        </h2>
        <p className="text-sm sm:text-base mb-6">
          {t('finalCTA.subtitle')}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-sm sm:text-base shadow-md"
        >
          <Link to="/register">{t('finalCTA.button')} →</Link>
        </motion.button>
      </motion.div>
    </section>
  );
}