import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Avatar, Button, Space, Typography, Row, Col } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';

const { Item } = Form;
const { Option } = Select;
const { Text } = Typography;

const PlayerModal = ({ 
  isOpen, 
  player, 
  onSave, 
  onCancel, 
  loading, 
  form 
}) => {
  /**
   * Handles profile picture deletion
   */
  const handleDeletePicture = () => {
    // You can implement the delete functionality here
    // For now, we'll just show a message
    console.log('Delete profile picture for player:', player?.id);
    // You can call an API to delete the picture here
    // Then update the player data to remove the profile photo
  };

  return (
    <Modal
      title="Edit Player"
      open={isOpen}
      onOk={onSave}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Update"
      width={500}
    >
      {/* Profile Picture Section - At the top with transparent background */}
      <div className="flex flex-col items-center mb-6 p-4 rounded-lg">
        <Avatar 
          src={player?.avatar} 
          icon={<UserOutlined />}
          size={80}
          className="mb-3 border-2 border-gray-300"
        />
        <Text strong className="text-lg mb-2">
          {player?.name || 'Player Name'}
        </Text>
        <Space>
          <Button 
            type="primary" 
            danger 
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDeletePicture}
            disabled={!player?.avatar}
          >
            Remove Picture
          </Button>
        </Space>
        {!player?.avatar && (
          <Text type="secondary" className="text-xs mt-2">
            No profile picture set
          </Text>
        )}
      </div>

      {/* Form Fields */}
      <Form form={form} layout="vertical">
        {/* First Name & Last Name in flex row for large screens */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input />
            </Item>
          </Col>
          <Col xs={24} sm={12}>
            <Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Item>
          </Col>
        </Row>

        <Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
          <Input />
        </Item>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Item name="age" label="Age">
              <InputNumber min={0} max={150} className="w-full" />
            </Item>
          </Col>
          <Col xs={24} sm={12}>
            <Item name="strength" label="Strength (0-100)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Item>
          </Col>
        </Row>

        <Item name="status" label="Status">
          <Select>
            <Option value="ACTIVE">Active</Option>
            <Option value="INACTIVE">Inactive</Option>
          </Select>
        </Item>
      </Form>
    </Modal>
  );
};

export default PlayerModal;