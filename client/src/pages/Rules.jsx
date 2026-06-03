import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // For animations
import { Button } from 'antd';// For consistent UI components
import { useNavigate } from 'react-router-dom'; // For navigation


export default function Rules() {
    const { t } = useTranslation();
  const navigate = useNavigate(); // Hook for navigation

  // Animation variants for rule items
  const ruleItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Function to handle navigation to the home page and scroll to top
  const handleBackToHome = () => {
    navigate('/'); // Navigate to the home route
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6"
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-6 sm:mb-8"
      >
        {t('rules.title')}
      </motion.h1>

      {/* Rules Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl w-full"
      >
        <div className="space-y-6">
          {/* Introduction */}
          <motion.p
            variants={ruleItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-lg text-gray-700 dark:text-gray-300"
          >
            {t('rules.introduction')}
          </motion.p>

          {/* Rule Items */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((ruleNumber, index) => (
            <motion.div
              key={ruleNumber}
              variants={ruleItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="flex items-start"
            >
              {/* Rule Number */}
              <div className="flex-shrink-0">
                <span className="text-teal-600 dark:text-teal-400 text-2xl font-bold">
                  {ruleNumber}
                </span>
              </div>

              {/* Rule Description */}
              <div className="ml-4">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t(`rules.description${ruleNumber}`)}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Important Notes */}
          <motion.div
            variants={ruleItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 1.4 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">
              {t('rules.importantNotesTitle')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {t('rules.importantNotes')}
            </p>
          </motion.div>

          {/* Closing Message */}
          <motion.div
            variants={ruleItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 1.6 }}
            className="mt-8 text-center"
          >
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {t('rules.closingMessage')}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.8 }}
        className="mt-8"
      >
        <Button
          color="teal"
          className="w-full sm:w-auto"
          onClick={handleBackToHome} // Add onClick handler
        >
          {t('rules.backToHome')}
        </Button>
      </motion.div>
    </motion.div>
  );
  }