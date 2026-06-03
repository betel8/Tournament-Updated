import { FaUser, FaCamera } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export default function RegistrationStep1({ register, errors, handleFileChange, profilePhotoPreview }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Profile Photo Input */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full bg-gray-700 mb-4 overflow-hidden border-2 border-blue-500">
          <input
            {...register('profile_photo')}
            type="file"
            id="profile_photo"
            accept="image/jpeg, image/jpg, image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          {profilePhotoPreview ? (
            <img
              src={profilePhotoPreview}
              alt={t('registration.step1.profilePhotoAlt')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FaCamera size={24} />
            </div>
          )}
          <label
            htmlFor="profile_photo"
            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <FaCamera className="text-white text-sm" />
          </label>
        </div>
        {errors.profile_photo && (
          <p className="text-red-400 text-sm text-center">
            {t(errors.profile_photo.message)}
          </p>
        )}
      </div>

      {/* First Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step1.firstNameLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            {...register('fname')}
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.fname ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step1.firstNamePlaceholder')}
          />
        </div>
        {errors.fname && (
          <p className="text-red-400 text-sm mt-1">{t(errors.fname.message)}</p>
        )}
      </div>

      {/* Last Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.step1.lastNameLabel')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            {...register('lname')}
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-700 border rounded-lg focus:ring-2 focus:outline-none ${
              errors.lname ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500'
            }`}
            placeholder={t('registration.step1.lastNamePlaceholder')}
          />
        </div>
        {errors.lname && (
          <p className="text-red-400 text-sm mt-1">{t(errors.lname.message)}</p>
        )}
      </div>
    </motion.div>
  );
}

RegistrationStep1.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    profile_photo: PropTypes.shape({
      message: PropTypes.string
    }),
    fname: PropTypes.shape({
      message: PropTypes.string
    }),
    lname: PropTypes.shape({
      message: PropTypes.string
    })
  }),
  handleFileChange: PropTypes.func.isRequired,
  profilePhotoPreview: PropTypes.string
};

RegistrationStep1.defaultProps = {
  errors: {},
  profilePhotoPreview: null
};