import React from 'react';
import { Button, Modal, App } from 'antd';
import { PlusOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import TournamentPlayerService from '../../../api/services/tournamentPlayer.service';

const PlayerRowActions = ({ 
  record, 
  isCurrentPlayersTable, 
  handlePlayerAction, 
  selectedTournament,  // Changed from state to specific prop
  tournaments = []     // Pass tournaments directly
}) => {
  const { modal } = App.useApp();

  const handleAdd = () => {
    modal.confirm({
      title: `Add ${record.first_name} ${record.last_name} to tournament?`,
      icon: <ExclamationCircleFilled />,
      content: 'This player will be added to the current tournament.',
      onOk: async () => {
        const tournamentName = tournaments.find(t => t.tournament_id === selectedTournament)?.tournament_name || 'this tournament';
        console.log("data log of selected tournament",selectedTournament)
        await handlePlayerAction(
          () => TournamentPlayerService.addPlayerToTournament(selectedTournament, record.id),
          `${record.first_name} ${record.last_name} added to ${tournamentName} successfully`
        );
      }
    });
  };

  const handleRemove = () => {
    modal.confirm({
      title: `Remove ${record.first_name} ${record.last_name} from tournament?`,
      icon: <ExclamationCircleFilled />,
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        await handlePlayerAction(
          () => TournamentPlayerService.removePlayerFromTournament(selectedTournament, record.id),
          `${record.first_name} ${record.last_name} removed from tournament successfully`
        );
      }
    });
  };

  return isCurrentPlayersTable ? (
    <Button 
      danger
      size="small"
      icon={<DeleteOutlined />}
      className="text-xs sm:text-sm"
      onClick={handleRemove}
    >
      <span className="hidden sm:inline">Remove</span>
    </Button>
  ) : (
    <Button 
      type="primary" 
      size="small"
      icon={<PlusOutlined />}
      className="text-xs sm:text-sm"
      onClick={handleAdd}
    >
      <span className="hidden sm:inline">Add</span>
    </Button>
  );
};

export default PlayerRowActions;