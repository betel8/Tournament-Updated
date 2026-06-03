import { Select, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Option } = Select;

const TournamentSelect = ({ 
  tournaments, 
  selectedTournament, 
  setSelectedTournament, 
  screens, 
  onDeleteClick,
  loading 
}) => {
  const isSmallScreen = screens.xs || screens.sm;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Tournament
      </label>
      <Select
        placeholder={loading ? "Loading..." : "Choose tournament"}
        className="w-full"
        value={selectedTournament}
        onChange={setSelectedTournament}
        optionFilterProp="children"
        showSearch
        size={isSmallScreen ? 'small' : 'middle'}
        loading={loading}
        disabled={loading}
        filterOption={(input, option) =>
          option.children[0].props.children[0].props.children
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        popupMatchSelectWidth={isSmallScreen ? false : true}
      >
        {tournaments.map(tournament => (
          <Option key={tournament.tournament_id} value={tournament.tournament_id}>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm">
                {isSmallScreen ? (
                  <>
                    {tournament.tournament_name}
                    <br />
                    {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                    {new Date(tournament.end_date).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    {tournament.tournament_name} (
                    {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                    {new Date(tournament.end_date).toLocaleDateString()})
                  </>
                )}
              </span>
              <Button
                icon={<DeleteOutlined />}
                size={isSmallScreen ? 'small' : 'middle'}
                type="text"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(tournament.tournament_id);
                }}
              />
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

TournamentSelect.propTypes = {
  tournaments: PropTypes.arrayOf(
    PropTypes.shape({
      tournament_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      tournament_name: PropTypes.string.isRequired,
      start_date: PropTypes.string.isRequired,
      end_date: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedTournament: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSelectedTournament: PropTypes.func.isRequired,
  screens: PropTypes.object.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

TournamentSelect.defaultProps = {
  selectedTournament: null,
  loading: false
};

export default TournamentSelect;