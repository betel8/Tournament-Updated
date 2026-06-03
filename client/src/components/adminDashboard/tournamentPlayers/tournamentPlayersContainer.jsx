import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, message } from 'antd';
import TournamentPlayerService from '../../../api/services/tournamentPlayer.service';
import PlayerTable from './PlayerTable';

const { Text } = Typography;

const TournamentPlayerContainer = ({ selectedTournament, onPlayerCountChange }) => {
  const [players, setPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ 
    status: null, 
    ageGroup: null, 
    strength: null 
  });
  const [availablePlayersPage, setAvailablePlayersPage] = useState(1);
  const pageSize = 5;

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const [currentPlayers, count, available] = await Promise.all([
        TournamentPlayerService.getTournamentPlayers(selectedTournament),
        TournamentPlayerService.getTournamentPlayerCount(selectedTournament),
        TournamentPlayerService.getAvailablePlayersForTournament(selectedTournament)
      ]);
      setPlayers(currentPlayers);
      setAvailablePlayers(available);
      onPlayerCountChange(count);
      setAvailablePlayersPage(1);
    } catch (error) {
      message.error('Failed to fetch player data');
    } finally {
      setLoading(false);
    }
  }, [selectedTournament, onPlayerCountChange]);

  const handlePlayerAction = useCallback(async (action, successMessage) => {
    try {
      setLoading(true);
      await action();
      message.success(successMessage);
      const [playersRes, availableRes, countRes] = await Promise.all([
        TournamentPlayerService.getTournamentPlayers(selectedTournament),
        TournamentPlayerService.getAvailablePlayersForTournament(selectedTournament),
        TournamentPlayerService.getTournamentPlayerCount(selectedTournament)
      ]);
      setPlayers(playersRes);
      setAvailablePlayers(availableRes);
      onPlayerCountChange(countRes);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTournament, onPlayerCountChange]);

  // Filter players with pagination
  const filteredAvailablePlayers = useMemo(() => 
    availablePlayers.filter(player => {
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
    }), 
  [availablePlayers, searchText, filters]);

  const paginatedAvailablePlayers = useMemo(() => 
    filteredAvailablePlayers.slice(
      (availablePlayersPage - 1) * pageSize,
      availablePlayersPage * pageSize
    ), 
  [filteredAvailablePlayers, availablePlayersPage, pageSize]);

  useEffect(() => {
    if (selectedTournament) {
      fetchPlayers();
    }
  }, [selectedTournament, fetchPlayers]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Available Players Table */}
        <div className="flex-1">
          <PlayerTable
            title="Available Players"
            players={availablePlayers}
            isCurrentPlayersTable={false}
            selectedPlayers={selectedPlayers}
            onSelectPlayers={setSelectedPlayers}
            handlePlayerAction={handlePlayerAction}
            pageSize={5}
            showPagination={true}
            selectedTournament={selectedTournament}
          />
        </div>

        {/* Current Players Table */}
        <div className="flex-1">
          <PlayerTable
            title="Current Players"
            players={players}
            isCurrentPlayersTable={true}
            selectedPlayers={selectedPlayers}
            onSelectPlayers={setSelectedPlayers}
            handlePlayerAction={handlePlayerAction}
            showPagination={false}
            selectedTournament={selectedTournament}

          />
        </div>
      </div>

      <div className="flex justify-end">
        <Text type="secondary">Showing {filteredAvailablePlayers.length} available players</Text>
      </div>
    </div>
  );
};

export default TournamentPlayerContainer;