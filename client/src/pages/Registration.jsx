import { useState, useEffect, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaArrowRight, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserService from '../api/services/user.service';
import {
  registrationStep1Schema,
  registrationStep2Schema,
  registrationStep3Schema
} from '../validations/authValidations';

// Lazy-loaded components
const RegistrationStep1 = lazy(() => import('../components/registration/RegistrationStep1'));
const RegistrationStep2 = lazy(() => import('../components/registration/RegistrationStep2'));
const RegistrationStep3 = lazy(() => import('../components/registration/RegistrationStep3'));

export default function Registration() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
    reset
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(
      currentStep === 1 ? registrationStep1Schema(t) :
      currentStep === 2 ? registrationStep2Schema(t) :
      registrationStep3Schema(t)
    )
  });

  useEffect(() => {
    reset(getValues(), {
      keepErrors: true,
      keepDirty: true,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });
  }, [currentStep, reset, getValues]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+251')) {
      const numberPart = cleaned.substring(4).replace(/\D/g, '');
      return numberPart.length > 9 ? `+251${numberPart.substring(0, 9)}` : `+251${numberPart}`;
    }

    const localCleaned = cleaned.replace(/\D/g, '');
    if (localCleaned.startsWith('0') && (localCleaned.startsWith('09') || localCleaned.startsWith('07'))) {
      if (localCleaned.length > 10) return `+251${localCleaned.substring(1, 10)}`;
      return `+251${localCleaned.substring(1)}`;
    }

    if (!cleaned.startsWith('+') && (localCleaned.startsWith('9') || localCleaned.startsWith('7'))) {
      return localCleaned.length > 9 ? `+251${localCleaned.substring(0, 9)}` : `+251${localCleaned}`;
    }

    return cleaned.startsWith('+') ? cleaned : value;
  };

  const checkPhoneNumber = async (phoneNumber) => {
    setIsCheckingPhone(true);
    
    try {
      const response = await UserService.checkPhoneNumber(phoneNumber);
      return response.exists;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await registrationStep1Schema(t).validateAt('profile_photo', { profile_photo: file });
      setValue('profile_photo', file, { shouldValidate: true, shouldDirty: true });
      
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(URL.createObjectURL(file));
      setSubmitError('');
    } catch (err) {
      setSubmitError(err.message);
      e.target.value = '';
      setValue('profile_photo', null, { shouldValidate: true, shouldDirty: true });
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
        setProfilePhotoPreview(null);
      }
    }
  };

  const validatePhoneNumber = async () => {
    const phoneNumber = formatPhoneNumber(getValues('pnumber'));
    
    if (!phoneNumber) return false;
    try {
      const exists = await checkPhoneNumber(phoneNumber);
      
      if (exists) {
        setSubmitError(t('registration.errors.phoneNumberExists'));
        return false;
      }
      setSubmitError(null);
      return true;
    } catch (err) {
      setSubmitError(t('registration.errors.phoneNumberCheckFailed'));
      return false;
    }
  };

  const handleStepChange = async (direction) => {
    const fieldsToValidate = {
      1: ['fname', 'lname', 'profile_photo'],
      2: ['pnumber', 'age'],
      3: ['password', 'confirmPassword']
    }[currentStep];

    const isValidStep = await trigger(fieldsToValidate);
    if (!isValidStep) return;

    if (direction === 'next' && currentStep === 2) {
      const phoneValid = await validatePhoneNumber();
      if (!phoneValid) return;
    }

    setCurrentStep(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('firstName', data.fname);
      formData.append('lastName', data.lname);
      formData.append('phoneNumber', formatPhoneNumber(data.pnumber));
      if (data.age) formData.append('age', data.age);
      formData.append('password', data.password);
      if (data.profile_photo) {
        formData.append('avatar', data.profile_photo);
      }

      const response = await UserService.register(formData);
      if (response?.success) {
        setSuccessMessage(t('registration.messages.registrationSuccess'));
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              playerData: response.data || {
                firstName: data.fname,
                lastName: data.lname,
                phoneNumber: formatPhoneNumber(data.pnumber)
              }
            }
          });
        }, 1500);
      } else {
        throw new Error(response?.message || t('registration.errors.registrationFailed'));
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-4 h-full w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700 mx-2 sm:mx-0"
      >
        {/* Progress Steps */}
        <div className="flex bg-gray-700/50 relative">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 z-10">
              <div
                className={`py-2 sm:py-3 text-center text-sm sm:text-base font-medium transition-colors cursor-pointer ${
                  currentStep === step ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {t('registration.stepLabel', { step })}
              </div>
            </div>
          ))}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-blue-500 z-0"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${((currentStep - 1) / 2) * 100}%`,
              transition: { duration: 0.3 }
            }}
          />
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-blue-400">
            {t('registration.title')}
          </h2>

          <AnimatePresence mode="wait">
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-xs sm:text-sm"
              >
                {submitError}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-xs sm:text-sm flex items-center gap-2"
              >
                <FaCheckCircle className="text-sm" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: currentStep === 1 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: currentStep === 3 ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<div className="flex justify-center py-8"><FaSpinner className="animate-spin text-blue-400 text-xl sm:text-2xl" /></div>}>
                  {currentStep === 1 && (
                    <RegistrationStep1
                      register={register}
                      errors={errors}
                      handleFileChange={handleFileChange}
                      profilePhotoPreview={profilePhotoPreview}
                    />
                  )}
                  {currentStep === 2 && (
                    <RegistrationStep2
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      formatPhoneNumber={formatPhoneNumber}
                      checkPhoneNumber={checkPhoneNumber}
                      isCheckingPhone={isCheckingPhone}
                      getValues={getValues}
                    />
                  )}
                  {currentStep === 3 && (
                    <RegistrationStep3
                      register={register}
                      errors={errors}
                    />
                  )}
                </Suspense>
              </motion.div>
            </AnimatePresence>

            <div className={`mt-6 sm:mt-8 flex ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={() => handleStepChange('prev')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base"
                >
                  <FaArrowLeft className="text-sm" />
                  {t('registration.buttons.back')}
                </motion.button>
              )}

              <motion.button
                type={currentStep === 3 ? 'submit' : 'button'}
                onClick={currentStep < 3 ? () => handleStepChange('next') : undefined}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting || isCheckingPhone || (currentStep < 3 && !isValid)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
                  isSubmitting || isCheckingPhone ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  currentStep === 3
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : `bg-blue-600 hover:bg-blue-700 text-white ${
                        !isValid ? 'opacity-50 cursor-not-allowed' : ''
                      }`
                }`}
              >
                {isSubmitting || isCheckingPhone ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>{t('registration.messages.processing')}</span>
                  </>
                ) : currentStep === 3 ? (
                  t('registration.buttons.completeRegistration')
                ) : (
                  t('registration.buttons.nextStep')
                )}
                {!isSubmitting && !isCheckingPhone && currentStep < 3 && <FaArrowRight className="text-sm" />}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}