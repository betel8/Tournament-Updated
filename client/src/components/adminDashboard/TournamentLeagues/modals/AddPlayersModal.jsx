import { useState } from 'react';
import { Modal, Table, Button, Tag, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AddPlayersModal = ({ visible, onCancel, players, onAddPlayers, league }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: 'Player',
      dataIndex: 'first_name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.profile_photo} 
            icon={<UserOutlined />}
            className="mr-3"
          />
          <div>
            <Text strong>{record.first_name} {record.last_name}</Text>
            <div className="flex mt-1">
              <Tag color="geekblue" className="mr-2">
                STR: {record.strength}
              </Tag>
              <Tag>AGE: {record.age}</Tag>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <Modal
      title={`Add Players to ${league?.leaguename || 'League'}`}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="add" 
          type="primary" 
          onClick={() => onAddPlayers(selectedRowKeys)}
          disabled={selectedRowKeys.length === 0}
        >
          Add Selected Players
        </Button>,
      ]}
      width={700}
      destroyOnClose
    >
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={players}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: 'No available players found'
        }}
      />
    </Modal>
  );
};

export default AddPlayersModal;