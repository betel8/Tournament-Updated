import React from 'react';
import { Table, Space, Tag, Popconfirm, Button, Avatar, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PlayerTable = ({ 
  data, 
  loading, 
  pagination, 
  onPaginationChange,
  onEditPlayer,
  onDeletePlayer 
}) => {
  // Table columns configuration
  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size={{ xs: 32, sm: 40 }}
            className="bg-gray-600"
          />
          <div className="overflow-hidden">
            <Text strong className="block text-white text-sm sm:text-base truncate">
              {text}
            </Text>
            <Text type="secondary" className="text-gray-400 text-xs sm:text-sm">
              {record.age ? `${record.age} years` : 'Age not specified'}
            </Text>
          </div>
        </div>
      ),
      responsive: ['xs', 'sm', 'md']
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <Text className="text-gray-300 text-xs sm:text-sm">
              {record.phone || 'N/A'}
            </Text>
          </div>
        </div>
      ),
      responsive: ['sm', 'md']
    },
    {
      title: 'Strength',
      dataIndex: 'strength',
      key: 'strength',
      render: (strength) => (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${strength}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm text-gray-300 w-8 text-right">
            {strength}%
          </span>
        </div>
      ),
      sorter: (a, b) => a.strength - b.strength,
      responsive: ['sm', 'md']
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'ACTIVE' ? 'green' : 'red'} 
          className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
        >
          {status === 'ACTIVE' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Active
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Inactive
            </>
          )}
        </Tag>
      ),
      responsive: ['xs', 'sm', 'md']
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small"
            icon={<EditOutlined className="text-blue-400" />} 
            onClick={() => onEditPlayer(record)}
            className="hover:bg-gray-700 p-1 sm:p-2"
          />
          <Popconfirm
            title="Delete this player?"
            description="This action cannot be undone. Are you sure?"
            onConfirm={() => onDeletePlayer(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              size="small"
              icon={<DeleteOutlined />} 
              className="hover:bg-gray-700 p-1 sm:p-2"
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md']
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{
        ...pagination,
        pageSize: 5,
        showSizeChanger: false,
        showTotal: (total) => (
          <Text className="text-gray-400 text-xs sm:text-sm">
            Showing {(pagination.current - 1) * 5 + 1}-{Math.min(pagination.current * 5, total)} of {total}
          </Text>
        ),
        onChange: onPaginationChange
      }}
      scroll={{ x: true }}
      className="bg-gray-800 rounded-lg overflow-hidden"
      size="small"
      loading={loading}
    />
  );
};

export default PlayerTable;