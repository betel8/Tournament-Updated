import React, { useState, useEffect } from 'react';
import { 
  Spin, Typography, message, 
  Form 
} from 'antd';
import UserService from '../../api/services/user.service';
import { API_CONFIG } from '../../api/config';
import PlayerFilters from './PlayersTable/PlayerFilters';
import PlayerModal from './PlayersTable/PlayerModal';
import PlayerTable from './PlayersTable/PlayerTable';

const { Text } = Typography;
const { Item } = Form;

/**
 * PlayersTable Component - Main container for managing player data
 * Features:
 * - Player data display with sorting and filtering
 * - Edit player functionality
 * - Delete player functionality
 * - Responsive design for different screen sizes
 */
export default function PlayersTable() {
  // State management
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  /**
   * Fetch players data from API on component mount
   */
  useEffect(() => {
    fetchPlayers();
  }, []);

  /**
   * Fetches player data from the API and formats it for display
   */
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllPlayers();
      const formattedPlayers = response.map(player => ({
        ...player,
        id: player.id,
        name: `${player.first_name} ${player.last_name}`,
        phone: player.phone_number,
        status: player.status || 'ACTIVE',
        strength: player.strength || 0,
        avatar: player.profile_photo?.startsWith('http') 
          ? player.profile_photo 
          : `${API_CONFIG.BASE_URL}${'/'}${player.profile_photo}`,
      }));
      setPlayers(formattedPlayers);
      setFilteredPlayers(formattedPlayers);
    } catch (error) {
      message.error('Failed to fetch players: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles opening the edit modal and populating form with player data
   * @param {Object} player - The player object to edit
   */
  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    form.setFieldsValue({
      firstName: player.first_name,
      lastName: player.last_name,
      phoneNumber: player.phone_number,
      age: player.age,
      status: player.status,
      strength: player.strength
    });
    setIsModalOpen(true);
  };

  /**
   * Handles updating player data via API
   */
  const handleUpdatePlayer = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Convert number fields explicitly to ensure they are numbers
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        age: values.age ? Number(values.age) : values.age,
        status: values.status,
        strength: values.strength ? Number(values.strength) : values.strength
      };
      
      await UserService.updatePlayerProfile(selectedPlayer.id, updateData);

      message.success('Player updated successfully');
      setIsModalOpen(false);
      await fetchPlayers();
    } catch (error) {
      message.error('Failed to update player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles player deletion with confirmation
   * @param {number} playerId - ID of the player to delete
   */
  const handleDeletePlayer = async (playerId) => {
    try {
      setLoading(true);
      await UserService.deletePlayer(playerId);
      message.success('Player deleted successfully');
      await fetchPlayers();
    } catch (error) {
      message.error('Failed to delete player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters players based on search text and filters
   * @param {string} search - Search text
   * @param {Object} filters - Current filter values
   */
  const filterPlayers = (search, filters) => {
    let result = [...players];
    
    // Apply search filter
    if (search) {
      result = result.filter(player => 
        player.name.toLowerCase().includes(search.toLowerCase()) ||
        player.phone?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(player => player.status === filters.status);
    }

    // Apply age filter
    if (filters.age) {
      switch(filters.age) {
        case 'under18':
          result = result.filter(player => player.age && player.age < 18);
          break;
        case '18-25':
          result = result.filter(player => player.age && player.age >= 18 && player.age <= 25);
          break;
        case '26-35':
          result = result.filter(player => player.age && player.age >= 26 && player.age <= 35);
          break;
        case 'over35':
          result = result.filter(player => player.age && player.age > 35);
          break;
        default:
          break;
      }
    }

    setFilteredPlayers(result);
    setPagination({ ...pagination, current: 1 });
  };

  /**
   * Handles search input changes
   * @param {string} value - Search text
   */
  const handleSearch = (value) => {
    setSearchText(value);
    filterPlayers(value, filters);
  };

  /**
   * Handles filter changes
   * @param {string} key - Filter key
   * @param {string} value - Filter value
   */
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    filterPlayers(searchText, newFilters);
  };

  /**
   * Toggles filter visibility
   */
  const handleToggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  /**
   * Handles modal close
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles pagination changes
   * @param {number} page - The new page number
   */
  const handlePaginationChange = (page) => {
    setPagination({ ...pagination, current: page });
  };

  return (
    <div className="p-2 sm:p-4 bg-gray-900 rounded-lg">
      {/* Header Section with Filters */}
      <PlayerFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onToggleFilters={handleToggleFilters}
        isFilterVisible={isFilterVisible}
        searchText={searchText}
        filters={filters}
      />

      {/* Player count display */}
      <Text type="secondary" className="text-gray-400 text-xs sm:text-sm block mb-4">
        {filteredPlayers.length} players found
      </Text>

      {/* Edit Player Modal */}
      <PlayerModal
        isOpen={isModalOpen}
        player={selectedPlayer}
        onSave={handleUpdatePlayer}
        onCancel={handleModalClose}
        loading={loading}
        form={form}
      />

      {/* Players Table */}
      <Spin spinning={loading}>
        <PlayerTable
          data={filteredPlayers}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onEditPlayer={handleEditPlayer}
          onDeletePlayer={handleDeletePlayer}
        />
      </Spin>
    </div>
  );
}