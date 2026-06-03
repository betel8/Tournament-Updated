import { Table, Tag, Avatar, Spin, Typography, Button, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LeaguePlayersTable = ({ players, loading, screens, leagueId, onRemovePlayer }) => {
  const isSmallScreen = screens?.xs || screens?.sm;

  const columns = [
    {
      title: 'Player',
      dataIndex: 'first_name',
      key: 'name',
      width: isSmallScreen ? '100%' : '30%',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.profile_photo} 
            icon={<UserOutlined />}
            size={isSmallScreen ? 'small' : 'default'}
            className="mr-2"
          />
          <div>
            <Text strong style={{ fontSize: isSmallScreen ? 13 : 14, display: 'block' }}>
              {record.first_name} {record.last_name}
            </Text>
            {isSmallScreen && (
              <div className="flex mt-1">
                <Tag color="geekblue" style={{ marginRight: 4, fontSize: 11 }}>
                  STR: {record.strength}
                </Tag>
                <Tag style={{ marginRight: 4, fontSize: 11 }}>
                  AGE: {record.age}
                </Tag>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      responsive: ['sm'],
      render: (_, record) => (
        <div className="flex">
          <Tag color="geekblue" className="mr-2">
            Strength: {record.strength}
          </Tag>
          <Tag className="mr-2">Age: {record.age}</Tag>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      responsive: ['sm'],
      render: (_, record) => (
        <Tag 
          color={record.status === 'confirmed' ? 'green' : 'orange'}
          className="flex items-center"
        >
          {record.status === 'confirmed' ? (
            <span>Confirmed</span>
          ) : (
            <span>Pending</span>
          )}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      responsive: ['sm'],
      render: (_, record) => (
        <Popconfirm
          title="Remove this player from league?"
          onConfirm={() => onRemovePlayer(leagueId, record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            className="text-red-500"
          />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div className={`p-2 ${isSmallScreen ? 'bg-gray-50' : 'bg-white'} rounded-lg`}>
      <div className="flex justify-between items-center mb-3">
        <Text strong style={{ fontSize: isSmallScreen ? 14 : 15 }}>
          League Players
        </Text>
        {!isSmallScreen && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {players.length} player{players.length !== 1 ? 's' : ''}
          </Text>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={players}
        rowKey="id"
        size={isSmallScreen ? 'small' : 'middle'}
        pagination={false}
        locale={{ 
          emptyText: (
            <div className="p-4 text-center">
              <Text type="secondary">No players assigned to this league</Text>
            </div>
          ) 
        }}
        className={`league-players-table ${isSmallScreen ? 'mobile-view' : ''}`}
        showHeader={!isSmallScreen}
      />
    </div>
  );
};

export default LeaguePlayersTable;