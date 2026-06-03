import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, App, Grid, Typography, Form, Space, Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import TournamentService from '../../api/services/tournament.service';
import TournamentPlayerService from '../../api/services/tournamentPlayer.service';
import LeagueService from '../../api/services/league.service';
import TournamentSelect from './TournamentLeagues/TournamentSelect';
import LeagueTable from './TournamentLeagues/LeagueTable';
import CreateTournamentModal from './TournamentLeagues/modals/CreateTournamentModal';
import CreateLeagueModal from './TournamentLeagues/modals/CreateLeagueModal';
import EditLeagueModal from './TournamentLeagues/modals/EditLeagueModal';

const { useBreakpoint } = Grid;
const { Text } = Typography;

export default function TournamentLeagues() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  
  // State management
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [createTournamentModal, setCreateTournamentModal] = useState(false);
  const [createLeagueModal, setCreateLeagueModal] = useState(false);
  const [editLeagueModal, setEditLeagueModal] = useState(false);
  const [deleteTournamentModal, setDeleteTournamentModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [currentLeague, setCurrentLeague] = useState(null);
  
  // League players state
  const [expandedLeagues, setExpandedLeagues] = useState([]);
  const [leaguePlayers, setLeaguePlayers] = useState({});
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loadingAvailablePlayers, setLoadingAvailablePlayers] = useState(false);

  // Form instances
  const [tournamentForm] = Form.useForm();
  const [leagueForm] = Form.useForm();
  const [editLeagueForm] = Form.useForm();

  // Fetch tournaments data
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const tournamentsRes = await TournamentService.getAllTournaments();
        setTournaments(tournamentsRes || []);
      } catch (error) {
        message.error('Failed to fetch tournaments');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Fetch leagues when tournament is selected
  useEffect(() => {
    const fetchLeagues = async () => {
      if (!selectedTournament) return;
      
      try {
        setLoading(true);
        const leaguesRes = await LeagueService.getAllLeagues({ tournamentId: selectedTournament });
        setLeagues(leaguesRes || []);
        setLeaguePlayers({});
        setExpandedLeagues([]);
      } catch (error) {
        message.error('Failed to fetch leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [selectedTournament]);

  // Fetch available players when leagues or selected tournament changes
  useEffect(() => {
    const fetchAvailablePlayers = async () => {
      if (!selectedTournament) {
        setAvailablePlayers([]);
        return;
      }

      try {
        setLoadingAvailablePlayers(true);

        // First get all players in the tournament
        const tournamentPlayers = await TournamentPlayerService.getTournamentPlayers(selectedTournament);
        // Then get all players already in leagues
        const playersInLeagues = [];
        for (const league of leagues) {
          const players = await LeagueService.getLeaguePlayers(league.id);
          playersInLeagues.push(...players.map(p => p.id));
        }
        
        // Filter to get players not in any league
        const available = tournamentPlayers.filter(player => 
          !playersInLeagues.includes(player.id)
        );
        
        setAvailablePlayers(available);
      } catch (error) {
        message.error('Failed to fetch available players');
      } finally {
        setLoadingAvailablePlayers(false);
      }
    };

    fetchAvailablePlayers();
  }, [selectedTournament, leagues]);

  // Fetch players for a specific league
  const fetchLeaguePlayers = async (leagueId) => {
    if (leaguePlayers[leagueId]) return;
    
    try {
      setLoadingPlayers(true);
      const players = await LeagueService.getLeaguePlayers(leagueId);
      setLeaguePlayers(prev => ({
        ...prev,
        [leagueId]: players
      }));
    } catch (error) {
      message.error(`Failed to fetch players for league: ${error.message}`);
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Handle adding players to a league
  const handleAddPlayers = async (leagueId, playerIds) => {
    try {
      setIsSubmitting(true);
      
      const tournamentId = selectedTournament;
      
      if (!tournamentId) {
        message.error('No tournament selected');
        return;
      }
        
      if (!Array.isArray(playerIds) || playerIds.length === 0) {
        message.error('No players selected or invalid player data');
        return;
      }
      
      const numericPlayerIds = playerIds.map(id => Number(id));
      
      await TournamentPlayerService.assignPlayersToLeague(tournamentId, numericPlayerIds, leagueId);
      
      message.success(`Added ${playerIds.length} player(s) to league successfully`);
      
      // Refresh league players
      const players = await LeagueService.getLeaguePlayers(leagueId);
      setLeaguePlayers(prev => ({
        ...prev,
        [leagueId]: players
      }));
      
      // Refresh the leagues list
      const leaguesRes = await LeagueService.getAllLeagues({ tournamentId: selectedTournament });
      setLeagues(leaguesRes || []);
      
      // Refresh available players
      const tournamentPlayers = await TournamentPlayerService.getTournamentPlayers(selectedTournament);
      const playersInLeagues = [];
      for (const league of leagues) {
        const leaguePlayers = await LeagueService.getLeaguePlayers(league.id);
        playersInLeagues.push(...leaguePlayers.map(p => p.id));
      }
      setAvailablePlayers(tournamentPlayers.filter(player => 
        !playersInLeagues.includes(player.id)
      ));
    } catch (error) {
      console.error('Error adding players:', error);
      message.error(`Failed to add players: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

 // Handle removing player from league
  const handleRemovePlayer = async (leagueId, playerId) => {
    try {
      setIsSubmitting(true);
      
      // Use the new TournamentPlayerService instead of LeagueService
      await TournamentPlayerService.removePlayerFromLeague(selectedTournament, playerId);
      
      message.success('Player removed from league');
      
      // Refresh league players
      const players = await LeagueService.getLeaguePlayers(leagueId);
      setLeaguePlayers(prev => ({
        ...prev,
        [leagueId]: players
      }));
      
      // Refresh leagues list
      const leaguesRes = await LeagueService.getAllLeagues({ tournamentId: selectedTournament });
      setLeagues(leaguesRes || []);
      
      // Refresh available players
      const tournamentPlayers = await TournamentPlayerService.getTournamentPlayers(selectedTournament);
      const playersInLeagues = [];
      for (const league of leaguesRes) {
        const leaguePlayers = await LeagueService.getLeaguePlayers(league.id);
        playersInLeagues.push(...leaguePlayers.map(p => p.id));
      }
      setAvailablePlayers(tournamentPlayers.filter(player => 
        !playersInLeagues.includes(player.id)
      ));
    } catch (error) {
      console.log(error);
      message.error(`Failed to remove player: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle league expansion
  const handleToggleExpand = (leagueId, expanded) => {
    setExpandedLeagues(prev => 
      expanded 
        ? [...prev, leagueId] 
        : prev.filter(id => id !== leagueId)
    );
  };

  // Open edit modal for a league
  const openEditModal = (league) => {
    setCurrentLeague(league);
    const matchDay = league.match_day ? new Date(league.match_day).toISOString().split('T')[0] : '';
    editLeagueForm.setFieldsValue({
      leaguename: league.leaguename,
      match_day: matchDay,
      start_time: league.start_time,
      max_players: league.max_players,
      min_strength: league.min_strength,
      max_strength: league.max_strength,
      is_completed: league.is_completed
    });
    setEditLeagueModal(true);
  };

  // Handle league creation
  const handleCreateLeague = async (values) => {
      const leaguesRes = await LeagueService.getAllLeagues({ tournamentId: selectedTournament });
      setLeagues(leaguesRes || []);
  };

  // Handle league deletion
  const handleDeleteLeague = async (leagueId) => {
    try {
      await LeagueService.deleteLeague(leagueId);
      message.success('League deleted successfully');
      
      const leaguesRes = await LeagueService.getAllLeagues({"tournamentId":selectedTournament});
      setLeagues(leaguesRes || []);
    } catch (error) {
      message.error(`League deletion failed: ${error.message}`);
    }
  };

  // Handle tournament deletion
  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    
    try {
      setIsSubmitting(true);
      await TournamentService.deleteTournament(tournamentToDelete);
      message.success('Tournament deleted successfully');
      
      if (selectedTournament === tournamentToDelete) {
        setSelectedTournament(null);
        setLeagues([]);
      }
      
      const tournamentsRes = await TournamentService.getAllTournaments();
      setTournaments(tournamentsRes || []);
      setDeleteTournamentModal(false);
    } catch (error) {
      message.error(`Tournament deletion failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center mt-8" />;
  }

  return (
    <div className="p-2 md:p-4">
      <Card 
        title={<span className="text-lg md:text-xl">Tournament Leagues Management</span>}
        className="w-full max-w-5xl mx-auto"
        extra={
          <Space size={screens.xs ? 8 : 16} wrap>
            <Button 
              type="dashed"
              icon={<PlusOutlined />}
              size={screens.xs ? 'small' : 'middle'}
              onClick={() => setCreateTournamentModal(true)}
            >
              {screens.sm && 'New Tournament'}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size={screens.xs ? 'small' : 'middle'}
              onClick={() => setCreateLeagueModal(true)}
              disabled={!selectedTournament}
            >
              {screens.sm && 'New League'}
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TournamentSelect 
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              setSelectedTournament={setSelectedTournament}
              screens={screens}
              onDeleteClick={(id) => {
                setTournamentToDelete(id);
                setDeleteTournamentModal(true);
              }}
              loading={loading}
            />
          </Col>

          <Col span={24}>
            <LeagueTable 
              leagues={leagues}
              selectedTournament={selectedTournament}
              screens={screens}
              onEdit={openEditModal}
              onDelete={handleDeleteLeague}
              leaguePlayers={leaguePlayers}
              loadingPlayers={loadingPlayers}
              expandedLeagues={expandedLeagues}
              onToggleExpand={handleToggleExpand}
              onFetchPlayers={fetchLeaguePlayers}
              onAddPlayers={handleAddPlayers}
              onRemovePlayer={handleRemovePlayer}
              availablePlayers={availablePlayers}
            />
          </Col>
        </Row>
      </Card>

      {/* Modals */}
      <CreateTournamentModal
        visible={createTournamentModal}
        onCancel={() => {
          setCreateTournamentModal(false);
          tournamentForm.resetFields();
        }}
        onSuccess={() => {
          setCreateTournamentModal(false);
          tournamentForm.resetFields();
          TournamentService.getAllTournaments().then(setTournaments);
        }}
        screens={screens}
      />

      <CreateLeagueModal
        visible={createLeagueModal}
        onCancel={() => {
          setCreateLeagueModal(false);
          leagueForm.resetFields();
        }}
        onSuccess={handleCreateLeague}
        screens={screens}
        selectedTournament={selectedTournament}
      />

      <EditLeagueModal
        visible={editLeagueModal}
        onCancel={() => {
          setEditLeagueModal(false);
          editLeagueForm.resetFields();
        }}
        onSuccess={async (values) => {
          try {
            setIsSubmitting(true);
            setEditLeagueModal(false);
            editLeagueForm.resetFields();
            const leaguesRes = await LeagueService.getAllLeagues({"tournamentId":selectedTournament});
            setLeagues(leaguesRes || []);
          } catch (error) {
            message.error(`League update failed: ${error.message}`);
          } finally {
            setIsSubmitting(false);
          }
        }}
        screens={screens}
        league={currentLeague}
      />

      <DeleteTournamentModal
        visible={deleteTournamentModal}
        onCancel={() => setDeleteTournamentModal(false)}
        onConfirm={handleDeleteTournament}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function DeleteTournamentModal({ visible, onCancel, onConfirm, isSubmitting }) {
  return (
    <Modal
      title="Delete Tournament"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          danger
          loading={isSubmitting}
          onClick={onConfirm}
        >
          Delete
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete this tournament? This action cannot be undone.</p>
      <p className="font-semibold">All associated leagues will also be deleted.</p>
    </Modal>
  );
}