import { Button, Form, Input, Upload, Spin, InputNumber } from 'antd';
import { UserOutlined, PhoneOutlined, CameraOutlined } from '@ant-design/icons';

export default function MobileLayout({
  form,
  loading,
  imageUrl,
  imageLoading,
  handleUploadChange,
  beforeUpload
}) {
  const uploadProps = {
    name: 'avatar',
    listType: 'picture-circle',
    showUploadList: false,
    beforeUpload: (file) => {
      const isValid = beforeUpload(file);
      if (isValid !== false) {
        handleUploadChange({ file: { status: 'done', originFileObj: file } });
      }
      return false;
    },
    accept: 'image/jpeg,image/png',
    className: 'mb-4'
  };

  return (
    <div className="md:hidden flex flex-col gap-6">
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center">
        <Upload {...uploadProps}>
          {imageLoading ? (
            <Spin size="large" />
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="avatar" 
              className="w-full h-full rounded-full object-cover"
              style={{ transition: 'opacity 0.3s' }}
            />
          ) : (
            <div className="flex flex-col items-center">
              <CameraOutlined className="text-2xl mb-2 text-white" />
              <span className="text-white">Upload Photo</span>
            </div>
          )}
        </Upload>
        <p className="text-sm text-gray-300 text-center">
          JPG or PNG, max 2MB
        </p>
      </div>

      {/* Profile Form */}
      <div className="w-full space-y-4">
        <Form.Item
          name="firstName"
          label={<span className="text-white">First Name</span>}
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="First Name"
            className="bg-gray-700 text-white border-none"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={<span className="text-white">Last Name</span>}
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Last Name"
            className="bg-gray-700 text-white border-none"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label={<span className="text-white">Phone Number</span>}
          rules={[{ required: true, message: 'Please input your phone number!' }]}
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="Phone Number"
            className="bg-gray-700 text-white border-none"
          />
        </Form.Item>

        <Form.Item
          name="age"
          label={<span className="text-white">Age</span>}
          rules={[
            { required: true, message: 'Please input your age!' },
            { type: 'number', min: 18, max: 120, message: 'Age must be between 18-120' }
          ]}
        >
          <InputNumber 
            className="w-full bg-gray-700 text-white border-none"
            placeholder="Age"
          />
        </Form.Item>

        {/* Submit Button */}
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-lg font-medium transition-colors"
          size="large"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </div>
  );
}