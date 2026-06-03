import { motion } from 'framer-motion';
import { FaPlaystation, FaTrophy, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function FeaturesGrid() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FaPlaystation className="text-blue-500" size={20} />,
      titleKey: "features.ps5.title",
      textKey: "features.ps5.text"
    },
    {
      icon: <FaTrophy className="text-blue-500" size={20} />,
      titleKey: "features.prizes.title",
      textKey: "features.prizes.text"
    },
    {
      icon: <FaMapMarkerAlt className="text-blue-500" size={20} />,
      titleKey: "features.location.title",
      textKey: "features.location.text"
    },
    {
      icon: <FaCalendarAlt className="text-blue-500" size={20} />,
      titleKey: "features.schedule.title",
      textKey: "features.schedule.text"
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {t('features.title')}
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-gray-800 p-4 sm:p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-blue-400 mb-2 sm:mb-3">{feature.icon}</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                {t(feature.textKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}