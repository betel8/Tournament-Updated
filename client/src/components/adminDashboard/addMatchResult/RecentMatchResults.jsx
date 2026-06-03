import React from 'react';
import { Card, Tag, Button, Empty, Pagination } from 'antd';
import { ReloadOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const RecentMatchResults = ({
  completedMatches,
  loading,
  loadInitialData,
  onEditMatch,
  onResetResult
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  const paginatedMatches = completedMatches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format('MMM D, YYYY') : 'N/A';
  };

  const hasResult = (record) =>
    record.p_one_goal !== null || record.p_two_goal !== null;

  return (
    <Card
      title="Recent Match Results"
      className="shadow-md [&_.ant-card-head]:border-b [&_.ant-card-head]:border-gray-200"
      extra={
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={loadInitialData}
          size="small"
        >
          Refresh
        </Button>
      }
      loading={loading}
    >
      {paginatedMatches.length === 0 ? (
        <Empty description="No completed matches yet" className="py-8" />
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedMatches.map((record) => {
            const completed = hasResult(record);
            const homeGoal = record.p_one_goal;
            const awayGoal = record.p_two_goal;

            return (
              <div
                key={record.id ?? record.match_id}
                className="border border-gray-600 rounded-lg p-3 hover:border-green-500 transition-colors group"
              >
                {/* Players + Score row */}
                <div className="flex items-center justify-between gap-3">
                  {/* Player names */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">
                      {record.player_one_name} {record.player_one_last_name}
                    </div>
                    <div className="text-xs text-gray-400 my-0.5 pl-1 group-hover:text-white">vs</div>
                    <div className="font-semibold text-sm text-white truncate">
                      {record.player_two_name} {record.player_two_last_name}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 bg-gray-900 text-white font-bold text-base rounded-lg px-3 py-2 min-w-[64px] text-center group-hover:bg-green-800">
                    {completed ? `${homeGoal} - ${awayGoal}` : '- -'}
                  </div>
                </div>

                {/* Meta + Actions row */}
                <div className="flex items-center justify-between flex-wrap gap-2 mt-2 pt-2 border-t border-gray-600">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 group-hover:text-white">
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      {formatDate(record.scheduled_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrophyOutlined />
                      Round {record.round_level}
                    </span>
                    <Tag color={completed ? 'green' : 'blue'} className="!text-xs !m-0">
                      {completed ? 'COMPLETED' : 'SCHEDULED'}
                    </Tag>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => onEditMatch(record)}
                      size="small"
                      disabled={!completed}
                      className="!px-2 group-hover:!text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onResetResult(record.id)}
                      size="small"
                      disabled={!completed}
                      className="!px-2"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {completedMatches.length > pageSize && (
            <div className="flex justify-end mt-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={completedMatches.length}
                onChange={setCurrentPage}
                size="small"
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RecentMatchResults;