import { useState } from 'react';
import { Card, Row, Col, Progress, Table, Tag } from 'antd';
import { 
  BarChartOutlined, 
  TrophyOutlined, 
  FireOutlined, 
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const StatsOverview = () => {
  // Mock stats data
  const playerStats = {
    matchesPlayed: 24,
    wins: 18,
    losses: 6,
    winRate: 75,
    goalsScored: 42,
    assists: 15,
    yellowCards: 3,
    redCards: 0,
    recentPerformance: [8.2, 7.5, 9.1, 8.7, 7.9],
    upcomingMatches: [
      { opponent: 'Team Alpha', date: '2023-06-15', location: 'Home' },
      { opponent: 'Team Beta', date: '2023-06-22', location: 'Away' },
    ],
  };

  // Columns for the matches table
  const columns = [
    {
      title: 'Opponent',
      dataIndex: 'opponent',
      key: 'opponent',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => (
        <Tag color={location === 'Home' ? 'green' : 'orange'}>
          {location}
        </Tag>
      ),
    },
  ];

  const statCards = [
    {
      title: 'Matches',
      value: playerStats.matchesPlayed,
      icon: <DashboardOutlined className="text-blue-500" />,
      suffix: 'played',
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: playerStats.winRate,
      icon: <TrophyOutlined className="text-green-500" />,
      suffix: `${playerStats.wins}W/${playerStats.losses}L`,
      color: 'green',
      progress: true
    },
    {
      title: 'Goals',
      value: playerStats.goalsScored,
      icon: <FireOutlined className="text-red-500" />,
      suffix: `+${playerStats.assists}A`,
      color: 'red'
    },
    {
      title: 'Discipline',
      value: `${playerStats.yellowCards}Y / ${playerStats.redCards}R`,
      icon: <TeamOutlined className="text-purple-500" />,
      color: 'purple',
      isSpecial: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="stats-overview p-4 md:p-6"
    >
      {/* Stats Cards Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={6}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
                bodyStyle={{ padding: '16px' }}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-50 mr-3">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-600 mb-0 text-sm">{card.title}</h3>
                    <p className="text-xl font-semibold mb-0 text-gray-800">
                      {card.value}
                      {!card.isSpecial && (
                        <span className="text-sm text-gray-500 ml-1">{card.suffix}</span>
                      )}
                    </p>
                  </div>
                </div>
                {card.progress && (
                  <Progress 
                    percent={card.value} 
                    showInfo={false} 
                    strokeColor="#52c41a"
                    className="mt-3"
                  />
                )}
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Charts and Matches Row */}
      <Row gutter={[16, 16]}>
        {/* Performance Chart */}
        <Col xs={24} md={12}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              title={
                <span className="text-gray-800">
                  <BarChartOutlined className="mr-2 text-blue-500" />
                  Recent Performance
                </span>
              }
              className="shadow-md h-full"
            >
              <div className="flex justify-between items-end h-40 mt-4">
                {playerStats.recentPerformance.map((rating, index) => (
                  <motion.div 
                    key={index}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ 
                      type: 'spring',
                      damping: 10,
                      stiffness: 100,
                      delay: 0.5 + index * 0.1
                    }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="bg-blue-400 w-6 md:w-8 rounded-t-md"
                      style={{ height: `${rating * 10}%` }}
                    />
                    <span className="text-gray-800 text-xs mt-2">{rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs">Match {index + 1}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Upcoming Matches */}
        <Col xs={24} md={12}>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              title={
                <span className="text-gray-800">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  Upcoming Matches
                </span>
              }
              className="shadow-md h-full"
            >
              <Table
                columns={columns}
                dataSource={playerStats.upcomingMatches}
                pagination={false}
                size="middle"
                rowKey="opponent"
                className="custom-table"
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default StatsOverview;