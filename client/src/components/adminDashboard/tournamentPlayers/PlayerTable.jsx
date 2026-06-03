import { useState, useMemo } from 'react';
import { Table, Typography, Button, Avatar, Tag } from 'antd';
import { LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import PlayerRowActions from './PlayerRowActions';

const { Text } = Typography;

const PlayerTable = ({
  title,
  players,
  isCurrentPlayersTable,
  selectedPlayers,
  onSelectPlayers,
  handlePlayerAction,
  showPagination = true,
  pageSize = 5,
  selectedTournament

}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText] = useState('');
  const [filters] = useState({
    status: null,
    ageGroup: null,
    strength: null
  });

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = `${player.first_name} ${player.last_name} ${player.phone_number}`
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesStatus = !filters.status || player.status === filters.status;
      const matchesAge = !filters.ageGroup || (
        filters.ageGroup === 'under18' ? player.age < 18 :
        filters.ageGroup === '18-25' ? player.age >= 18 && player.age <= 25 :
        filters.ageGroup === '26-35' ? player.age >= 26 && player.age <= 35 :
        player.age > 35
      );
      const matchesStrength = !filters.strength || (
        filters.strength === 'beginner' ? player.strength < 30 :
        filters.strength === 'intermediate' ? player.strength >= 30 && player.strength < 70 :
        player.strength >= 70
      );

      return matchesSearch && matchesStatus && matchesAge && matchesStrength;
    });
  }, [players, searchText, filters]);

  // Paginate filtered players
  const paginatedPlayers = useMemo(() => {
    return filteredPlayers.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredPlayers, currentPage, pageSize]);

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
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <PlayerRowActions 
          record={record}
          isCurrentPlayersTable={isCurrentPlayersTable}
          handlePlayerAction={handlePlayerAction}
          selectedTournament={selectedTournament}

        />
      )
    }
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <Text strong className="text-base">
          {title} ({filteredPlayers.length})
        </Text>
        
        { filteredPlayers.length > pageSize && (
          <div className="flex items-center gap-2">
            <Button 
              size="small" 
              icon={<LeftOutlined />} 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            />
            <span className="text-xs">Page {currentPage} of {Math.ceil(filteredPlayers.length / pageSize)}</span>
            <Button 
              size="small" 
              icon={<RightOutlined />} 
              disabled={currentPage >= Math.ceil(filteredPlayers.length / pageSize)}
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPlayers.length / pageSize), p + 1))}
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={ paginatedPlayers}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default PlayerTable;