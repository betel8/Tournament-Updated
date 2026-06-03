import React, { useState, useEffect } from 'react';
import { Spin, App } from 'antd';
import TournamentService from '../../api/services/tournament.service';
import LeagueService from '../../api/services/league.service';
import MatchService from '../../api/services/match.service';
import ResultService from '../../api/services/result.service';

import TournamentLeagueSelector from './addMatchResult/TournamentLeagueSelector';
import AddMatchResultForm from './addMatchResult/AddMatchResultForm';
import RecentMatchResults from './addMatchResult/RecentMatchResults';
import EditMatchModal from './addMatchResult/EditMatchModal';

const AddMatchResult = () => {
  const { message, modal } = App.useApp();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const tournamentResponse = await TournamentService.getAllTournaments();
      const tournamentData = tournamentResponse || [];
      setTournaments(tournamentData);

      const defaultTournament = tournamentData.length > 0 ? tournamentData[0].tournament_id : null;
      setSelectedTournament(defaultTournament);

      const leagueResponse = await LeagueService.getAllLeagues(
        defaultTournament ? { tournamentId: defaultTournament } : {}
      );
      setLeagues(leagueResponse || []);
      setScheduledMatches([]);
      setCompletedMatches([]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      if (selectedLeague) {
        const matchesResponse = await MatchService.getMatchesByLeague(selectedLeague);
        const matches = matchesResponse || [];

        const scheduled = matches.filter(match =>
          match.p_one_goal === null && match.p_two_goal === null
        );
        setScheduledMatches(scheduled);

        const completed = matches.filter(match =>
          match.p_one_goal !== null || match.p_two_goal !== null
        );
        setCompletedMatches(completed);
      } else {
        setScheduledMatches([]);
        setCompletedMatches([]);
      }
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      message.error('Failed to fetch matches');
    }
  };

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leagueResponse = await LeagueService.getAllLeagues(
          selectedTournament ? { tournamentId: selectedTournament } : {}
        );
        setLeagues(leagueResponse || []);
        setSelectedLeague(null);
        setSelectedMatch(null);
        setScheduledMatches([]);
        setCompletedMatches([]);
      } catch (error) {
        console.error('Failed to fetch leagues:', error);
        message.error('Failed to fetch leagues');
      }
    };

    if (selectedTournament !== null) {
      fetchLeagues();
    }
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedLeague) {
      fetchMatches();
    }
  }, [selectedLeague]);

  const handleEdit = async (match) => {
    try {
      setEditingMatch({
        ...match,
        resultId: match.result,
        homeScore: match.p_one_goal,
        awayScore: match.p_two_goal,
        notes: match.notes || ''
      });
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch result:', error);
      message.error('Failed to load result data');
    }
  };

  const handleResetResult = async (matchId) => {
    modal.confirm({
      title: 'Delete Match Result',
      content: 'Are you sure you want to delete this match result? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await ResultService.resetResult(matchId);
          message.success('Match result deleted successfully');
          fetchMatches();
        } catch (error) {
          console.error('Failed to delete result:', error);
          message.error('Failed to delete match result');
        }
      }
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      await ResultService.updateResult(editingMatch.resultId, {
        pOneGoal: parseInt(values.homeScore),
        pTwoGoal: parseInt(values.awayScore),
        notes: values.notes || null
      });
      message.success('Match result updated successfully');
      setIsEditModalVisible(false);
      setEditingMatch(null);
      fetchMatches();
    } catch (error) {
      console.error('Failed to update match result:', error);
      message.error(`Failed to update match result: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Page subtitle */}
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Add and update match results for tournaments
        </h2>

        {/* Tournament and League Selector */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <TournamentLeagueSelector
            tournaments={tournaments}
            leagues={leagues}
            selectedTournament={selectedTournament}
            selectedLeague={selectedLeague}
            onTournamentChange={setSelectedTournament}
            onLeagueChange={setSelectedLeague}
          />
        </div>

        {/* Two column layout — stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AddMatchResultForm
            selectedMatch={selectedMatch}
            setSelectedMatch={setSelectedMatch}
            scheduledMatches={scheduledMatches}
            selectedTournament={selectedTournament}
            selectedLeague={selectedLeague}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            loadInitialData={fetchMatches}
          />

          <RecentMatchResults
            completedMatches={completedMatches}
            loading={loading}
            loadInitialData={fetchMatches}
            onEditMatch={handleEdit}
            onResetResult={handleResetResult}
          />
        </div>
      </div>

      <EditMatchModal
        isVisible={isEditModalVisible}
        editingMatch={editingMatch}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingMatch(null);
        }}
        onSubmit={handleEditSubmit}
        loadInitialData={fetchMatches}
      />
    </div>
  );
};

export default AddMatchResult;