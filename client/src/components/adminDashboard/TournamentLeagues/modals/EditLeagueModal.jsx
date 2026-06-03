import { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Space, 
  InputNumber, Select, DatePicker, 
  Modal, App, Tag 
} from 'antd';
import dayjs from 'dayjs';
import LeagueService from '../../../../api/services/league.service';

const { Option } = Select;

const EditLeagueModal = ({ visible, onCancel, onSuccess, screens, league }) => {
   
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();

  // Set form values when league data changes
  useEffect(() => {
    if (league) {
      form.setFieldsValue({
        leaguename: league.leaguename,
        match_day: league.match_day ? dayjs(league.match_day) : null,
        start_time: league.start_time,
        max_players: league.max_players,
        min_strength: league.min_strength,
        max_strength: league.max_strength,
        is_completed: league.is_completed
      });
    }
  }, [league, form,[]]);
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await LeagueService.updateLeague(league.id, {
        leaguename: values.leaguename,
        match_day: values.match_day.format('YYYY-MM-DD'),
        start_time: values.start_time,
        max_players: values.max_players,
        min_strength: values.min_strength,
        max_strength: values.max_strength,
        is_completed: values.is_completed
      });
      
      message.success('League updated successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(`League update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStrengthRange = ({ getFieldValue }) => ({
    validator(_, value) {
      const min = getFieldValue('min_strength');
      const max = getFieldValue('max_strength');
      
      if (!min || !max || Number(min) <= Number(max)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Min strength must be less than max strength'));
    },
  });

  const disabledMatchDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title={
        <span>
          Edit League <Tag color={league?.is_completed ? 'green' : 'orange'}>
            {league?.is_completed ? 'COMPLETED' : 'ACTIVE'}
          </Tag>
        </span>
      }
      open={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      footer={null}
      width={screens.xs ? '90%' : '50%'}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="League Name"
          name="leaguename"
          rules={[{ required: true, message: 'Please input league name!' }]}
        >
          <Input size={screens.xs ? 'small' : 'middle'} />
        </Form.Item>

        <Space size={screens.xs ? 8 : 16} className="w-full">
          <Form.Item
            label="Match Day"
            name="match_day"
            rules={[{ required: true, message: 'Please select match date!' }]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <DatePicker
              style={{ width: '100%' }}
              size={screens.xs ? 'small' : 'middle'}
              disabledDate={disabledMatchDate}
            />
          </Form.Item>

          <Form.Item
            label="Start Time (HH:mm)"
            name="start_time"
            rules={[
              { required: true, message: 'Please input start time!' },
              {
                pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: 'Please enter valid time (e.g. 14:30)'
              }
            ]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <Input 
              placeholder="14:30" 
              size={screens.xs ? 'small' : 'middle'} 
            />
          </Form.Item>
        </Space>

        <Form.Item
          label="Max Players"
          name="max_players"
          rules={[
            { required: true, message: 'Please input max players!' },
            { type: 'number', min: 2, max: 32, message: 'Must be between 2-32' }
          ]}
        >
          <InputNumber 
            min={2}
            max={32}
            style={{ width: '100%' }}
            size={screens.xs ? 'small' : 'middle'}
          />
        </Form.Item>

        <Space size={screens.xs ? 8 : 16} className="w-full">
          <Form.Item
            label="Min Strength"
            name="min_strength"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, max: 100, message: 'Must be 0-100' },
              validateStrengthRange
            ]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <InputNumber 
              min={0}
              max={100}
              style={{ width: '100%' }}
              size={screens.xs ? 'small' : 'middle'}
            />
          </Form.Item>

          <Form.Item
            label="Max Strength"
            name="max_strength"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, max: 100, message: 'Must be 0-100' },
              validateStrengthRange
            ]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <InputNumber 
              min={0}
              max={100}
              style={{ width: '100%' }}
              size={screens.xs ? 'small' : 'middle'}
            />
          </Form.Item>
        </Space>

        <Form.Item
          label="Status"
          name="is_completed"
        >
          <Select size={screens.xs ? 'small' : 'middle'}>
            <Option value={false}>Active</Option>
            <Option value={true}>Completed</Option>
          </Select>
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isSubmitting}
          block
          size={screens.xs ? 'small' : 'middle'}
        >
          Update League
        </Button>
      </Form>
    </Modal>
  );
};

export default EditLeagueModal;