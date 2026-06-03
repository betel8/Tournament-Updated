import * as yup from 'yup';
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from './constants';

// Common reusable validators
export const firstNameValidator = (t) => yup.string()
  .required(t('errors.firstNameRequired'))
  .min(2, t('errors.firstNameMinLength'))
  .max(50, t('errors.firstNameMaxLength'));

export const lastNameValidator = (t) => yup.string()
  .required(t('errors.lastNameRequired'))
  .min(2, t('errors.lastNameMinLength'))
  .max(50, t('errors.lastNameMaxLength'));

export const phoneNumberValidator = (t) => yup.string()
  .required(t('errors.phoneNumberRequired'))
  .matches(/^(\+251|0)(9|7)\d{8}$/, t('errors.phoneNumberInvalid'));

export const ageValidator = (t) => yup.number()
  .required(t('errors.age'))
  .transform(value => (isNaN(value) || value === null || value === undefined || value === '' ? null : Number(value)))
  .nullable()
  .min(13, t('errors.ageMin'))
  .max(100, t('errors.ageMax'));

export const passwordValidator = (t) => yup.string()
  .required(t('errors.passwordRequired'))
  .min(8, t('errors.passwordMinLength'))
  .max(50, t('errors.passwordMaxLength'))
  .matches(/[a-z]/, t('errors.passwordLowercase'))
  .matches(/[A-Z]/, t('errors.passwordUppercase'))
  .matches(/\d/, t('errors.passwordNumber'));

export const confirmPasswordValidator = (t, refField = 'password') => yup.string()
  .required(t('errors.confirmPasswordRequired'))
  .oneOf([yup.ref(refField)], t('errors.passwordsDontMatch'));

export const fileValidator = (t) => yup.mixed()
  .required(t('errors.profilePhotoRequired'))
  .test('fileSize', t('errors.fileTooLarge'), (value) => 
    !value || value.size <= MAX_FILE_SIZE)
  .test('fileType', t('errors.invalidFileType'), (value) => 
    !value || SUPPORTED_FORMATS.includes(value.type));

// Composite schemas
export const registrationStep1Schema = (t) => yup.object().shape({
  fname: firstNameValidator(t),
  lname: lastNameValidator(t),
  profile_photo: fileValidator(t)
});

export const registrationStep2Schema = (t) => yup.object().shape({
  pnumber: phoneNumberValidator(t),
  age: ageValidator(t)
});

export const registrationStep3Schema = (t) => yup.object().shape({
  password: passwordValidator(t),
  confirmPassword: confirmPasswordValidator(t)
});

export const changePasswordSchema = (t) => yup.object().shape({
  currentPassword: yup.string().required(t('errors.currentPasswordRequired')),
  newPassword: passwordValidator(t),
  confirmPassword: confirmPasswordValidator(t, 'newPassword')
});