import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaSignInAlt, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../api/services/auth.service';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validation schema
  const schema = yup.object().shape({
    phone: yup
      .string()
      .required(t('login.errors.phoneRequired'))
      .matches(/^(\+251|0)(9|7)\d{8}$/, t('login.errors.phoneInvalid')),
    password: yup
      .string()
      .required(t('login.errors.passwordRequired'))
      .min(8, t('login.errors.passwordMinLength'))
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+251')) {
      return cleaned.length > 13 ? `+251${cleaned.substring(4, 13)}` : cleaned;
    }
    
    const localCleaned = cleaned.replace(/\D/g, '');
    if (localCleaned.startsWith('0') && ['09', '07'].includes(localCleaned.substring(0, 2))) {
      return localCleaned.length > 10 ? `+251${localCleaned.substring(1, 10)}` : `+251${localCleaned.substring(1)}`;
    }
    
    if (!cleaned.startsWith('+') && ['9', '7'].includes(localCleaned.charAt(0))) {
      return localCleaned.length > 9 ? `+251${localCleaned.substring(0, 9)}` : `+251${localCleaned}`;
    }
    
    return cleaned;
  };
 // Helper functions
 const handleLoginSuccess = (user, token) => {
  login(user, token); // Store user session
};

const redirectUser = (role) => {
  const path = role === 'admin' 
    ? '/admin/dashboard' 
    : '/player/dashboard';
  navigate(path);
};

const handleAuthError = (error) => {
  const { error: errorKey, errorType, details } = error;
  const defaultMessage = t('login.errors.genericError');
  
  setError(t(errorKey, { 
    defaultValue: defaultMessage,
    ...(details && { details }) 
  }));

  if (errorType === 'RATE_LIMIT') {
    showRateLimitAlert();
  }
};

const showRateLimitAlert = () => {
  alert(t('login.errors.rateLimitAlert', { minutes: 15 }));
};
  const onSubmit = async (credentials) => {
    setIsSubmitting(true);
    setError('');
  
    try {
      const { user, token } = await AuthService.login({
        phoneNumber: formatPhoneNumber(credentials.phone),
        password: credentials.password
      });
      handleLoginSuccess(user, token);
      redirectUser(user.role);
      
    } catch (error) {
      console.log(error)
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
 
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
      >
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{t('login.title')}</h2>
            <p className="text-gray-400 mt-2">{t('login.subtitle')}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                {t('login.phoneLabel')}
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder={t('login.phonePlaceholder')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                {t('login.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  {t('login.rememberMe')}
                </label>
              </div>

              <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                {t('login.forgotPassword')}
              </a>
            </div>

            <div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    {t('login.signIn')}
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-400">
              {t('login.noAccount')}{' '}
              <a href="/register" className="font-medium text-blue-400 hover:text-blue-300">
                {t('login.signUp')}
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;