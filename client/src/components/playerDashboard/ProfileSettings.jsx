import { useState, useEffect, useCallback } from 'react';
import { Form, Spin, App } from 'antd';
import UserService from '../../api/services/user.service';
import { API_CONFIG } from '../../api/config';
import DesktopLayout from './profileSetting/DesktopLayout';
import MobileLayout from './profileSetting/MobileLayout';

const { useApp } = App;

export default function ProfileSettings() {
  const { message } = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const getBase64 = useCallback((img, callback) => {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.onerror = () => {
      message.error('Failed to read image file');
      callback(null);
    };
    reader.readAsDataURL(img);
  }, [message]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await UserService.getProfile();
        if (isMounted) {
          setInitialValues({
            firstName: response.first_name,
            lastName: response.last_name,
            phone: response.phone_number,
            age: response.age || null
          });
          if (response.profile_photo) {
            const photoUrl = response.profile_photo.startsWith('http') 
              ? response.profile_photo 
              : `${API_CONFIG.BASE_URL}${response.profile_photo}`;
            setImageUrl(photoUrl);
            setPreviewImage(photoUrl);
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (isMounted) {
          message.error(error.message || 'Failed to load profile');
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [message]);

  useEffect(() => {
    if (!fetching && form) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, fetching, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phone,
        age: values.age
      };

      if (hasImageChanged && file) {
        updateData.profilePhoto = file;
      }

      const response = await UserService.updateProfile(updateData);
      message.success(response.message || 'Profile updated successfully!');
      
      if (hasImageChanged && file && response.data?.profile_photo) {
        const photoUrl = response.data.profile_photo.startsWith('http')
          ? response.data.profile_photo
          : `${API_CONFIG.BASE_URL}${response.data.profile_photo}`;
        setImageUrl(photoUrl);
        setPreviewImage(photoUrl);
        setHasImageChanged(false);
      }
      setFile(null);
    } catch (error) {
      const errorMessage = error.message.includes(':') 
        ? error.message.split(':')[1] 
        : error.message;
      message.error(errorMessage || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return true;
  };

  const handleUploadChange = (info) => {
    if (info.file.status === 'removed') {
      setImageUrl(null);
      setPreviewImage(null);
      setFile(null);
      setHasImageChanged(true);
      return;
    }

    if (info.file.originFileObj) {
      setImageLoading(true);
      // Create object URL for instant preview
      const objectUrl = URL.createObjectURL(info.file.originFileObj);
      
      setPreviewImage(objectUrl);
      
      // Also convert to base64 for form submission
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
        setFile(info.file.originFileObj);
        setHasImageChanged(true);
        setImageLoading(false);
        
        // Clean up object URL when done
       // 
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 md:p-8 h-full overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-white">
        {fetching ? 'Loading Profile...' : 'Profile Settings'}
      </h2>
      
      {fetching ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <MobileLayout
            form={form}
            loading={loading}
            imageUrl={previewImage || imageUrl}
            imageLoading={imageLoading}
            handleUploadChange={handleUploadChange}
            beforeUpload={beforeUpload}
          />
          
          <DesktopLayout
            form={form}
            onFinish={onFinish}
            loading={loading}
            imageUrl={previewImage || imageUrl}
            imageLoading={imageLoading}
            handleUploadChange={handleUploadChange}
            beforeUpload={beforeUpload}
          />
        </Form>
      )}
    </div>
  );
}