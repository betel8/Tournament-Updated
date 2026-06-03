import { useState } from 'react';
import { Form, Input, Button, App, Progress } from 'antd';
import { motion } from 'framer-motion';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { AuthService } from '../../api/services/auth.service';
import { changePasswordSchema } from '../../validations/authValidations';
import { useTranslation } from 'react-i18next';

export default function ChangePassword() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    number: false,
    uppercase: false,
    special: false
  });

  const validatePassword = async (_, value) => {
    try {
      await changePasswordSchema(t).validateAt('newPassword', { newPassword: value });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(err.message));
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await AuthService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success(t('changePassword.success'));
      form.resetFields();
      setPasswordStrength(0);
      setRequirements({
        length: false,
        number: false,
        uppercase: false,
        special: false
      });
    } catch (error) {
      message.error(error.message || t('changePassword.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const analyzePassword = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setRequirements({
        length: false,
        number: false,
        uppercase: false,
        special: false
      });
      return;
    }

    const newRequirements = {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };

    setRequirements(newRequirements);
    const strength = Object.values(newRequirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#ef4444';
      case 1: return '#f97316';
      case 2: return '#eab308';
      case 3: return '#22c55e';
      case 4: return '#16a34a';
      default: return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <motion.h2 
          className="text-2xl font-semibold text-gray-300 mb-2"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {t('changePassword.title')}
        </motion.h2>
        <motion.p 
          className="text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('changePassword.subtitle')}
        </motion.p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
        validateTrigger="onBlur"
      >
        {/* Current Password */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Form.Item
            name="currentPassword"
            label={<span className="text-gray-300 font-medium">{t('changePassword.currentPassword')}</span>}
            rules={[
              { required: true, message: t('errors.currentPasswordRequired') },
              { min: 6, message: t('errors.passwordMinLength', { min: 6 }) }
            ]}
          >
            <Input.Password
              placeholder={t('changePassword.currentPasswordPlaceholder')}
              prefix={<LockOutlined className="text-gray-300" />}
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="py-3 bg-white border-gray-400 text-gray-300 hover:border-blue-500 focus:border-blue-600 rounded-lg [&::placeholder]:text-gray-300"
              size="large"
            />
          </Form.Item>
        </motion.div>

        {/* New Password */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Form.Item
            name="newPassword"
            label={<span className="text-gray-300 font-medium">{t('changePassword.newPassword')}</span>}
            rules={[
              { required: true, message: t('errors.passwordRequired') },
              { validator: validatePassword }
            ]}
          >
            <Input.Password
              placeholder={t('changePassword.newPasswordPlaceholder')}
              prefix={<LockOutlined className="text-gray-300" />}
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              onChange={(e) => analyzePassword(e.target.value)}
              className="py-3 bg-white border-gray-400 text-gray-300 hover:border-blue-500 focus:border-blue-600 rounded-lg [&::placeholder]:text-gray-300"
              size="large"
            />
          </Form.Item>

          <div className="mt-2 space-y-2">
            <Progress
              percent={passwordStrength * 25}
              showInfo={false}
              strokeColor={getStrengthColor()}
              trailColor="#e5e7eb"
              size="small" // Fixed: Replaced strokeWidth with size prop
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center ${requirements.length ? 'text-green-600' : 'text-gray-300'}`}>
                <span className="mr-1">•</span>
                <span>{t('changePassword.passwordRequirements.length')}</span>
              </div>
              <div className={`flex items-center ${requirements.number ? 'text-green-600' : 'text-gray-300'}`}>
                <span className="mr-1">•</span>
                <span>{t('changePassword.passwordRequirements.number')}</span>
              </div>
              <div className={`flex items-center ${requirements.uppercase ? 'text-green-600' : 'text-gray-300'}`}>
                <span className="mr-1">•</span>
                <span>{t('changePassword.passwordRequirements.uppercase')}</span>
              </div>
              <div className={`flex items-center ${requirements.special ? 'text-green-600' : 'text-gray-300'}`}>
                <span className="mr-1">•</span>
                <span>{t('changePassword.passwordRequirements.special')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Form.Item
            name="confirmPassword"
            label={<span className="text-gray-300 font-medium">{t('changePassword.confirmPassword')}</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('errors.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('errors.passwordsDontMatch')));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={t('changePassword.confirmPasswordPlaceholder')}
              prefix={<LockOutlined className="text-gray-300" />}
              iconRender={(visible) => 
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="py-3 bg-white border-gray-400 text-gray-300 hover:border-blue-500 focus:border-blue-600 rounded-lg [&::placeholder]:text-gray-300"
              size="large"
            />
          </Form.Item>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            className={`h-12 rounded-xl font-medium transition-all ${
              passwordStrength >= 3 
                ? 'bg-blue-600 hover:bg-blue-500' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={passwordStrength < 3}
          >
            <motion.span
              whileHover={{ scale: passwordStrength >= 3 ? 1.02 : 1 }}
              whileTap={{ scale: passwordStrength >= 3 ? 0.98 : 1 }}
              className="text-white font-semibold"
            >
              {isSubmitting ? t('common.processing') : t('changePassword.submit')}
            </motion.span>
          </Button>
        </motion.div>
      </Form>
    </motion.div>
  );
}