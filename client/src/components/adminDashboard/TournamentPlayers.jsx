import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Spin, Typography, App } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import TournamentService from '../../api/services/tournament.service';
import TournamentSelector from './tournamentPlayers/TournamentSelector';
import TournamentPlayerService from '../../api/services/tournamentPlayer.service'
import TournamentPlayerContainer from './tournamentPlayers/tournamentPlayersContainer';

const { Text, Title } = Typography;

const TournamentPlayers = () => {
  const { message, modal } = App.useApp();
  
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tournamentLoading, setTournamentLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Fetch tournaments
  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TournamentService.getAllTournaments();
      const currentDate = new Date();
      const activeTournaments = data.filter(t => new Date(t.end_date) >= currentDate);
      setTournaments(activeTournaments);
    } catch (error) {
      message.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleClearAll = useCallback(async () => {
    modal.confirm({
      title: 'Remove all players from tournament?',
      content: 'This will remove ALL players from this tournament. Continue?',
      okText: 'Remove All',
      okType: 'danger',
      async onOk() {
        try {
          setLoading(true);
          await TournamentPlayerService.clearTournamentPlayers(selectedTournament);
          message.success('All players removed successfully');
          setPlayerCount(0);
        } catch (error) {
          message.error(`Failed to remove players: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
    });
  }, [selectedTournament, modal, message]);

  // Fetch tournaments on mount
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return (
    <div className="p-2 md:p-4">
      <Card 
        title={<Title level={4} className="!mb-0 !text-lg md:!text-xl">Tournament Players</Title>}
        extra={
          selectedTournament && (
            <div className="flex items-center gap-2">
              <Badge count={playerCount} showZero color="#1890ff" />
              <Button 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleClearAll}
              >
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            </div>
          )
        }
        loading={loading}
        className="w-full"
      >
        <TournamentSelector 
          tournaments={tournaments} 
          selectedTournament={selectedTournament}
          onSelectTournament={setSelectedTournament}
        />

        {tournamentLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
            <span className="ml-2">Loading players...</span>
          </div>
        ) : selectedTournament ? (
          <TournamentPlayerContainer 
            selectedTournament={selectedTournament}
            onPlayerCountChange={setPlayerCount}
          />
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">Please select a tournament to manage players</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TournamentPlayers;