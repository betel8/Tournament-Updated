import { useState } from 'react';
import { List, Avatar, Tag, Card, Select } from 'antd';
import { 
  ClockCircleOutlined, 
  TrophyOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  FireOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Option } = Select;

export default function RecentActivity() {
  const [filter, setFilter] = useState('all');
  
  // Mock activity data
  const activities = [
    {
      id: 1,
      type: 'match',
      title: 'Won match against Team Alpha',
      description: '3-2 victory in the quarterfinals',
      date: dayjs().subtract(1, 'hour'),
      icon: <TrophyOutlined className="text-green-500" />,
      avatar: '/images/soccer-ball.png',
      color: 'green'
    },
    {
      id: 2,
      type: 'training',
      title: 'Completed advanced training',
      description: 'Focused on defensive strategies',
      date: dayjs().subtract(3, 'hour'),
      icon: <TeamOutlined className="text-blue-500" />,
      avatar: '/images/training.png',
      color: 'blue'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Reached 500 career points',
      description: 'Milestone achievement unlocked',
      date: dayjs().subtract(1, 'day'),
      icon: <FireOutlined className="text-yellow-500" />,
      avatar: '/images/trophy.png',
      color: 'gold'
    },
    {
      id: 4,
      type: 'match',
      title: 'Upcoming match scheduled',
      description: 'Vs. Team Beta on Saturday',
      date: dayjs().add(2, 'day'),
      icon: <CalendarOutlined className="text-purple-500" />,
      avatar: '/images/calendar.png',
      color: 'purple'
    },
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getTimeText = (date) => {
    if (date.isBefore(dayjs())) {
      const hours = dayjs().diff(date, 'hour');
      return hours < 24 
        ? `${hours} ${hours === 1 ? 'hour' : 'hours'} ago` 
        : `${dayjs().diff(date, 'day')} ${dayjs().diff(date, 'day') === 1 ? 'day' : 'days'} ago`;
    } else {
      const days = dayjs(date).diff(dayjs(), 'day');
      return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Recent Activity</span>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={setFilter}
              className="activity-filter"
            >
              <Option value="all">All Activities</Option>
              <Option value="match">Matches</Option>
              <Option value="training">Trainings</Option>
              <Option value="achievement">Achievements</Option>
            </Select>
          </div>
        }
        bordered={false}
        className="shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredActivities}
          renderItem={(item, index) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <List.Item className="hover:bg-gray-50 transition-colors duration-200 p-3 rounded-lg">
                <List.Item.Meta
                  avatar={
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Avatar 
                        src={item.avatar} 
                        icon={item.icon} 
                        size="large"
                        className="shadow-sm"
                      />
                    </motion.div>
                  }
                  title={
                    <div className="flex flex-wrap items-center">
                      <span className="text-base font-medium mr-2">{item.title}</span>
                      <Tag 
                        color={item.color}
                        className="mt-1 sm:mt-0"
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="mt-1">
                      <p className="text-gray-600 mb-1">{item.description}</p>
                      <div className="flex items-center text-gray-500">
                        <ClockCircleOutlined className="mr-1" />
                        <span className="text-sm">{getTimeText(item.date)}</span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      </Card>
    </motion.div>
  );
}