import { useState } from 'react';
import { Table, Tag, Button, Popconfirm, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import LeaguePlayersTable from './LeaguePlayersTable';
import AddPlayersModal from './modals/AddPlayersModal';

const { Text } = Typography;

const LeagueTable = ({ 
  leagues, 
  selectedTournament, 
  screens, 
  onEdit, 
  onDelete,
  leaguePlayers,
  loadingPlayers,
  expandedLeagues,
  onToggleExpand,
  onFetchPlayers,
  onAddPlayers,
  onRemovePlayer,
  availablePlayers
}) => {
  const [isAddPlayersModalVisible, setIsAddPlayersModalVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const isSmallScreen = screens.xs || screens.sm;

  const columns = [
    {
      title: 'League',
      dataIndex: 'leaguename',
      key: 'leaguename',
      responsive: ['xs'],
      render: (text, record) => (
        <div className="p-1">
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12 }}>
            {new Date(record.match_day).toLocaleDateString()} • {record.start_time}
          </div>
          <div style={{ fontSize: 12 }}>
            Players: <Button 
              type="link" 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(record.id);
              }}
            >
              {record.current_players || 0}/{record.max_players}
            </Button>
          </div>
          <div style={{ fontSize: 12 }}>
            Strength: {record.min_strength}-{record.max_strength}
          </div>
          <Tag 
            color={record.is_completed ? 'green' : 'orange'} 
            style={{ margin: '4px 0' }}
          >
            {record.is_completed ? 'COMPLETED' : 'ACTIVE'}
          </Tag>
          <div className="mt-1">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => onEdit(record)}
              className="mr-2"
            />
            <Button 
              icon={<UserAddOutlined />} 
              size="small" 
              onClick={() => {
                setSelectedLeague(record.id);
                setIsAddPlayersModalVisible(true);
              }}
              className="mr-2"
            />
            <Popconfirm
              title="Delete this league?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </div>
        </div>
      )
    },
    {
      title: 'League Name',
      dataIndex: 'leaguename',
      key: 'leaguename',
      responsive: ['sm'],
    },
    {
      title: 'Match Day',
      dataIndex: 'match_day',
      key: 'match_day',
      responsive: ['sm'],
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      responsive: ['sm'],
      render: (text) => <Text style={{ fontSize: isSmallScreen ? 12 : 14 }}>{text}</Text>,
    },
    {
      title: 'Players',
      key: 'players',
      responsive: ['sm'],
      render: (_, record) => (
        <Button 
          type="link" 
          size={isSmallScreen ? 'small' : 'middle'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(record.id);
          }}
        >
          {record.current_players || 0}/{record.max_players}
        </Button>
      ),
    },
    {
      title: 'Strength',
      key: 'strength_range',
      responsive: ['sm'],
      render: (_, record) => (
        <Text style={{ fontSize: isSmallScreen ? 12 : 14 }}>
          {record.min_strength}-{record.max_strength}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'is_completed',
      responsive: ['sm'],
      render: (_, record) => (
        <Tag color={record.is_completed ? 'green' : 'orange'}>
          {record.is_completed ? 'COMPLETED' : 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      responsive: ['sm'],
      render: (_, record) => (
        <Space size={isSmallScreen ? 'small' : 'middle'}>
          <Button 
            icon={<EditOutlined />} 
            size={isSmallScreen ? 'small' : 'middle'} 
            onClick={() => onEdit(record)}
          />
          <Button 
            icon={<UserAddOutlined />} 
            size={isSmallScreen ? 'small' : 'middle'} 
            onClick={() => {
              setSelectedLeague(record.id);
              setIsAddPlayersModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete this league?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size={isSmallScreen ? 'small' : 'middle'} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const players = leaguePlayers[record.id] || [];
    return (
      <LeaguePlayersTable 
        players={players} 
        loading={loadingPlayers && expandedLeagues.includes(record.id)}
        screens={screens}
        leagueId={record.id}
        onRemovePlayer={onRemovePlayer}
      />
    );
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={leagues}
        rowKey="id"
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedLeagues,
          onExpand: (expanded, record) => {
            if (expanded) {
              onFetchPlayers(record.id);
            }
            onToggleExpand(record.id, expanded);
          },
          rowExpandable: () => true,
        }}
        pagination={false}
        size={isSmallScreen ? 'small' : 'middle'}
        scroll={isSmallScreen ? { x: true } : undefined}
        locale={{
          emptyText: selectedTournament 
            ? 'No leagues found' 
            : 'Select a tournament to view leagues'
        }}
        className="league-table"
      />
      
      <AddPlayersModal
        visible={isAddPlayersModalVisible}
        onCancel={() => setIsAddPlayersModalVisible(false)}
        players={availablePlayers}
        onAddPlayers={(selectedPlayerIds) => {
          onAddPlayers(selectedLeague, selectedPlayerIds);
          setIsAddPlayersModalVisible(false);
        }}
        league={leagues.find(l => l.id === selectedLeague)}
      />
    </>
  );
};

export default LeagueTable;