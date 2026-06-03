import React from 'react';
import { Modal, Table, Avatar, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const BulkAddModal = ({ 
  visible, 
  selectedPlayers, 
  availablePlayers, 
  onOk, 
  onCancel, 
  loading 
}) => {
  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-2 lg:gap-3">
          <Avatar 
            src={record.profile_photo} 
            icon={<UserOutlined />} 
            size="small" 
            className="hidden sm:block" 
          />
          <div>
            <Text strong className="block">{`${record.first_name} ${record.last_name}`}</Text>
            <div className="flex items-center gap-1">
              {record.age && <Text type="secondary" className="text-xs sm:text-sm">{record.age} yrs</Text>}
              {record.strength && (
                <Tag color={
                  record.strength > 70 ? 'green' : 
                  record.strength > 30 ? 'blue' : 'orange'
                } className="text-xs sm:text-sm">
                  {record.strength}%
                </Tag>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      className: 'hidden sm:table-cell',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'} className="text-xs sm:text-sm">
          {status}
        </Tag>
      )
    }
  ];

  return (
    <Modal
      title={`Add ${selectedPlayers.length} Players`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={`Add ${selectedPlayers.length} Players`}
      cancelText="Cancel"
      width="90%"
      className="md:w-3/4 lg:w-1/2"
    >
      <Table
        columns={columns}
        dataSource={availablePlayers.filter(p => selectedPlayers.includes(p.id))}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Modal>
  );
};

export default BulkAddModal;