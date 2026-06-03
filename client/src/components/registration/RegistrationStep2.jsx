import { FaPhone, FaIdCard, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function RegistrationStep2({ 
  register, 
  errors, 
  setValue, 
  formatPhoneNumber,
  isCheckingPhone
}) {
  const { t } = useTranslation();

  const handlePhoneChange = async (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
    setValue('pnumber', formatted, { shouldValidate: true });
  };

  const handleAgeChange = (e) => {
    const value = e.target.value === '' ? undefined : e.target.value;
    setValue('age', value, { shouldValidate: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step2.phoneNumberLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaPhone className="text-gray-400" />
          </div>
          <input
            {...register('pnumber')}
            onChange={handlePhoneChange}
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.pnumber 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step2.phoneNumberPlaceholder')}
            type="tel"
          />
          {isCheckingPhone && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <FaSpinner className="animate-spin text-blue-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {t('registration.step2.phoneNumberFormat')}
        </p>
        {errors.pnumber && (
          <p className="text-red-400 text-sm mt-1">
            {t(errors.pnumber.message)}
          </p>
        )}
      </div>

      {/* Age Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step2.ageLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaIdCard className="text-gray-400" />
          </div>
          <input
            {...register('age')}
            type="number"
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.age 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step2.agePlaceholder')}
            min="13"
            max="100"
            onChange={handleAgeChange}
          />
        </div>
        {errors.age && (
          <p className="text-red-400 text-sm mt-1">{t(errors.age.message)}</p>
        )}
      </div>
    </motion.div>
  );
}

RegistrationStep2.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    pnumber: PropTypes.shape({
      message: PropTypes.string
    }),
    age: PropTypes.shape({
      message: PropTypes.string
    })
  }),
  setValue: PropTypes.func.isRequired,
  formatPhoneNumber: PropTypes.func.isRequired,
  isCheckingPhone: PropTypes.bool.isRequired
};

RegistrationStep2.defaultProps = {
  errors: {}
};