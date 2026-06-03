import { motion } from 'framer-motion';
import { Button, Form, Input, Upload, Spin, InputNumber } from 'antd';
import { UserOutlined, PhoneOutlined, CameraOutlined } from '@ant-design/icons';

export default function DesktopLayout({
  form,
  onFinish,
  loading,
  imageUrl,
  imageLoading,
  handleUploadChange,
  beforeUpload
}) {
  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    showUploadList: false,
    beforeUpload: (file) => {
      const isValid = beforeUpload(file);
      if (isValid !== false) {
        handleUploadChange({ file: { status: 'done', originFileObj: file } });
      }
      return false;
    },
    accept: 'image/jpeg,image/png',
    className: 'bg-gray-700 rounded-lg w-full h-full border-none'
  };

  return (
    <div className="hidden md:flex flex-col gap-8">
      <motion.div 
        className="w-full flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-fit h-fit"> {/* Fixed size container */}
          <Upload {...uploadProps}>
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : imageUrl ? (
              <motion.img 
                src={imageUrl}
                alt="avatar"
                className="w-full h-full object-cover rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center w-full h-full p-4"
                whileHover={{ scale: 1.02 }}
              >
                <CameraOutlined className="text-3xl mb-3 text-gray-400" />
                <span className="text-gray-300">Upload Profile Photo</span>
                <span className="text-gray-400 text-xs mt-2">JPG or PNG, max 2MB</span>
              </motion.div>
            )}
          </Upload>
        </div>
      </motion.div>

      <motion.div 
        className="w-full space-y-6"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            name="firstName"
            label={<span className="text-gray-300 font-medium">First Name</span>}
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              className="h-12 rounded-lg bg-gray-700 text-white border-none"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span className="text-gray-300 font-medium">Last Name</span>}
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              className="h-12 rounded-lg bg-gray-700 text-white border-none"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="phone"
          label={<span className="text-gray-300 font-medium">Phone Number</span>}
          rules={[{ required: true, message: 'Please input your phone number!' }]}
        >
          <Input 
            prefix={<PhoneOutlined className="text-gray-400" />} 
            className="h-12 rounded-lg bg-gray-700 text-white border-none"
          />
        </Form.Item>

        <Form.Item
          name="age"
          label={<span className="text-gray-300 font-medium">Age</span>}
          rules={[
            { required: true, message: 'Please input your age!' },
            { type: 'number', min: 18, max: 120 }
          ]}
        >
          <InputNumber 
            className="w-full h-12 rounded-lg bg-gray-700 text-white border-none"
          />
        </Form.Item>

        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-center">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
            size="large"
          >
            Update Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}