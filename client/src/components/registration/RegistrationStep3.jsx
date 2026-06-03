import { FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function RegistrationStep3({ register, errors }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step3.passwordLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            {...register('password')}
            type="password"
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.password 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step3.passwordPlaceholder')}
          />
        </div>
        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{t(errors.password.message)}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {t('registration.step3.passwordRequirements')}
        </p>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step3.confirmPasswordLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            {...register('confirmPassword')}
            type="password"
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.confirmPassword 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step3.passwordPlaceholder')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm mt-1">{t(errors.confirmPassword.message)}</p>
        )}
      </div>
    </motion.div>
  );
}

RegistrationStep3.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    password: PropTypes.shape({
      message: PropTypes.string
    }),
    confirmPassword: PropTypes.shape({
      message: PropTypes.string
    })
  })
};

RegistrationStep3.defaultProps = {
  errors: {}
};