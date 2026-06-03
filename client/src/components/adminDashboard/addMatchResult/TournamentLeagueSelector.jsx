import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const TournamentLeagueSelector = ({
  tournaments,
  leagues,
  selectedTournament,
  selectedLeague,
  onTournamentChange,
  onLeagueChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Tournament
        </label>
        <Select
          placeholder="Choose a tournament"
          className="w-full"
          value={selectedTournament}
          onChange={onTournamentChange}
          optionFilterProp="children"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {tournaments.map(tournament => (
            <Option key={tournament.tournament_id} value={tournament.tournament_id}>
              {tournament.tournament_name}
            </Option>
          ))}
        </Select>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          League
        </label>
        <Select
          placeholder="Choose a league"
          className="w-full"
          value={selectedLeague}
          onChange={onLeagueChange}
          optionFilterProp="children"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {leagues.map(league => (
            <Option key={league.id} value={league.id}>
              {league.leaguename}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default TournamentLeagueSelector;