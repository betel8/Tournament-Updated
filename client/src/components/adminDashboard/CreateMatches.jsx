import { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Spin, Typography, Select, Button, App, message 
} from 'antd';
import TournamentService from '../../api/services/tournament.service';
import LeagueService from '../../api/services/league.service';
import MatchService from '../../api/services/match.service';
import MatchesTable from './CreateMatches/MatchesTable';
import MatchFormModal from './CreateMatches/MatchFormModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CreateMatches() {
  const { message } = App.useApp();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingLeagues, setFetchingLeagues] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tournaments on mount
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const tournamentsRes = await TournamentService.getAllTournaments();
        
        const tournamentData = Array.isArray(tournamentsRes) ? tournamentsRes : [];
        const validTournaments = tournamentData
          .filter(t => t?.tournament_id && t.tournament_name)
          .map(t => ({
            id: String(t.tournament_id),
            name: t.tournament_name,
            start_date: t.start_date,
            end_date: t.end_date
          }));

        setTournaments(validTournaments);

        if (validTournaments.length === 0) {
          message.info('No active tournaments found');
        }
      } catch (error) {
        console.error('Fetch tournaments error:', error);
        message.error('Failed to fetch tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [message]);

  // Fetch available players for current round
  const fetchAvailablePlayers = async (leagueId, roundLevel) => {
    try {
      setLoading(true);
      const players = await LeagueService.getAvailablePlayersForRound(leagueId, roundLevel);
      setAvailablePlayers(players);
    } catch (error) {
      console.error('Error fetching available players:', error);
      message.error('Failed to fetch available players');
      setAvailablePlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tournament selection
  const handleTournamentSelect = async (tournamentId) => {
    try {
      setFetchingLeagues(true);
      setSelectedLeague(null);
      setMatches([]);
      setAvailablePlayers([]);
      setIsModalOpen(false);
      
      const tournament = tournaments.find(t => t.id === tournamentId);
      setSelectedTournament(tournament);

      const leaguesRes = await LeagueService.getAllLeagues({ tournamentId });
      const leagueData = Array.isArray(leaguesRes) ? leaguesRes : [];
      
      const validLeagues = leagueData
        .filter(l => l?.id && l.leaguename)
        .map(l => ({
          id: String(l.id),
          name: l.leaguename,
          min_strength: l.min_strength,
          max_strength: l.max_strength
        }));

      setLeagues(validLeagues);

      if (validLeagues.length === 0) {
        message.info('No leagues found for this tournament');
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      message.error('Failed to fetch leagues');
    } finally {
      setFetchingLeagues(false);
    }
  };

  // Handle league selection
  const handleLeagueSelect = async (leagueId) => {
    try {
      setSelectedLeague(leagueId);
      setLoading(true);
      
      const [matchesRes] = await Promise.all([
        MatchService.getMatchesByLeague(leagueId),
      ]);

      setMatches(Array.isArray(matchesRes) ? matchesRes : []);
      await fetchAvailablePlayers(leagueId, currentRound);
    } catch (error) {
      console.error('Error fetching league data:', error);
      message.error('Failed to fetch league matches');
    } finally {
      setLoading(false);
    }
  };

  // Handle round change
  const handleRoundChange = async (roundLevel) => {
    setCurrentRound(roundLevel);
    if (selectedLeague) {
      await fetchAvailablePlayers(selectedLeague, roundLevel);
    }
  };

  // Handle match creation
  const handleCreateMatch = async (values) => {
    setIsSubmitting(true);
    try {
      // Final validation - ensure players are still available
      const playersInRound = matches
        .filter(m => m.round_level === values.round_level)
        .flatMap(m => [m.player_one_id, m.player_two_id]);

      if (playersInRound.includes(values.player_one_id) || 
          playersInRound.includes(values.player_two_id)) {
        message.error('One or more selected players are no longer available');
        return false;
      }

      const matchData = {
        ...values,
        league_id: selectedLeague,
        player_one_id: values.player_one_id || null,
        player_two_id: values.player_two_id || null,
        scheduled_time: values.scheduled_time 
          ? dayjs(values.scheduled_time).format('YYYY-MM-DD HH:mm:ss')
          : null
      };

      await MatchService.createMatch(matchData);
      message.success('Match created successfully');
      
      // Refresh data
      await handleLeagueSelect(selectedLeague);
      return true;
    } catch (error) {
      console.error('Create match error:', error);
      message.error(`Match creation failed: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !selectedTournament) {
    return <Spin size="large" className="flex justify-center mt-8" />;
  }

  return (
    <div className="p-4">
      <Card title={<Title level={4}>Manage Tournament Matches</Title>} className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <div className="mb-4">
                <Text strong>Select Tournament</Text>
                <Select
                  className="w-full mt-2"
                  placeholder={tournaments.length ? "Select tournament" : "No tournaments available"}
                  onChange={handleTournamentSelect}
                  value={selectedTournament?.id}
                  disabled={!tournaments.length}
                  loading={loading}
                >
                  {tournaments.map(tournament => (
                    <Option key={`tournament-${tournament.id}`} value={tournament.id}>
                      {tournament.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-4">
                <Text strong>Select League</Text>
                <Select
                  className="w-full mt-2"
                  placeholder={selectedTournament ? "Select league" : "Please select tournament first"}
                  onChange={handleLeagueSelect}
                  value={selectedLeague}
                  disabled={!selectedTournament || fetchingLeagues}
                  loading={fetchingLeagues}
                >
                  {leagues.map(league => (
                    <Option key={`league-${league.id}`} value={league.id}>
                      {league.name} (Strength: {league.min_strength}-{league.max_strength})
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>
        </div>

        {selectedLeague && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <Title level={5}>
                Matches for {selectedTournament.name} - {
                  leagues.find(l => l.id === selectedLeague)?.name || 'Selected League'
                }
              </Title>
              <Button 
                type="primary" 
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedLeague}
              >
                Add New Match
              </Button>
            </div>

            <MatchesTable 
              matches={matches} 
              loading={loading} 
              players={availablePlayers}
              onRefresh={() => handleLeagueSelect(selectedLeague)}
            />
          </>
        )}
      </Card>

      <MatchFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleCreateMatch}
        players={availablePlayers}
        leagueName={leagues.find(l => l.id === selectedLeague)?.name}
        currentRound={currentRound}
        onRoundChange={handleRoundChange}
      />
    </div>
  );
}