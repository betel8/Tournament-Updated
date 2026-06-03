import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function EventDetails() {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-gray-800 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            {t('eventDetails.title')}
          </h2>
          <ul className="space-y-3 sm:space-y-4">
            <li className="flex items-start">
              <FaCalendarAlt className="mt-0.5 mr-3 text-blue-400" size={18} />
              <div>
                <h4 className="text-sm sm:text-base font-semibold">
                  {t('eventDetails.date')}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300">
                  {t('eventDetails.time')}
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <FaMapMarkerAlt className="mt-0.5 mr-3 text-blue-400" size={18} />
              <div>
                <h4 className="text-sm sm:text-base font-semibold">
                  {t('eventDetails.venue')}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300">
                  {t('eventDetails.location')}
                </p>
              </div>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-first md:order-last"
        >
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt={t('eventDetails.imageAlt')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}