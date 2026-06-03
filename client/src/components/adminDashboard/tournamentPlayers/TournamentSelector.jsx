import React, { useEffect } from 'react';
import { Select, Space, Tag } from 'antd';

const { Option } = Select;

const TournamentSelector = ({ tournaments, selectedTournament, onSelectTournament }) => {
  // Automatically select the tournament if there's only one
  useEffect(() => {
    if (tournaments.length === 1 && !selectedTournament) {
      onSelectTournament(tournaments[0].tournament_id);
    }
  }, [tournaments, selectedTournament, onSelectTournament]);

  return (
    <div className="mb-4">
      <Select
        placeholder="Select active tournament"
        className="w-full"
        value={selectedTournament}
        onChange={onSelectTournament}
        size="middle"
        optionLabelProp="label"
        showSearch
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
      >
        {tournaments.map(tournament => (
          <Option 
            key={tournament.tournament_id} 
            value={tournament.tournament_id}
            label={tournament.tournament_name}
          >
            <div className="flex justify-between items-center">
              <span>{tournament.tournament_name}</span>
              <Space>
                <Tag color={new Date(tournament.end_date) >= new Date() ? 'green' : 'red'}>
                  {new Date(tournament.start_date).toLocaleDateString()}
                </Tag>
                <span className="hidden md:inline">
                  to {new Date(tournament.end_date).toLocaleDateString()}
                </span>
              </Space>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default TournamentSelector;