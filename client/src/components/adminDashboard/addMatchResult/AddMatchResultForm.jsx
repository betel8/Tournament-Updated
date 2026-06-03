import React, { useEffect } from 'react';
import { Card, Select, Input, Button, Form, DatePicker, Divider, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ResultService from '../../../api/services/result.service';

const { Option } = Select;

const AddMatchResultForm = ({
  selectedMatch,
  setSelectedMatch,
  scheduledMatches,
  selectedTournament,
  selectedLeague,
  isSubmitting,
  setIsSubmitting,
  loadInitialData
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedMatch && scheduledMatches.length > 0) {
      const match = scheduledMatches.find(m => m.id === selectedMatch);
      if (match) {
        form.setFieldsValue({
          homeTeam: match.player_one_id,
          awayTeam: match.player_two_id,
          scheduledDate: dayjs(match.scheduled_time),
          homeScore: '',
          awayScore: ''
        });
      }
    }
  }, [selectedMatch, scheduledMatches, form]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const match = scheduledMatches.find(m => m.id === selectedMatch);

      if (!match || !match.result) {
        throw new Error('No result record found for this match');
      }

      const resultId = parseInt(match.result);
      const homeScore = values.homeScore === '' ? 0 : parseInt(values.homeScore);
      const awayScore = values.awayScore === '' ? 0 : parseInt(values.awayScore);

      await ResultService.updateResult(resultId, {
        pOneGoal: homeScore,
        pTwoGoal: awayScore
      });

      message.success('Match result added successfully');
      form.resetFields();
      setSelectedMatch(null);
      loadInitialData();
    } catch (error) {
      console.error('Failed to add match result:', error);
      message.error(`Failed to add match result: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title="Add Match Result"
      className="shadow-md [&_.ant-card-head]:bg-blue-50 [&_.ant-card-head]:border-b [&_.ant-card-head]:border-gray-200"
    >
      {/* Match selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Scheduled Match (Without Results)
        </label>
        <Select
          placeholder="Choose a match"
          className="w-full"
          value={selectedMatch}
          onChange={setSelectedMatch}
          optionFilterProp="children"
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {scheduledMatches.map((match, index) => (
            <Option
              key={match.id ?? `fallback-${index}`}
              value={match.id}
            >
              {match.player_one_name} {match.player_one_last_name} vs {match.player_two_name} {match.player_two_last_name} — {dayjs(match.scheduled_time).format('MMM D, YYYY')}
            </Option>
          ))}
        </Select>
      </div>

      {selectedMatch && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ homeScore: '', awayScore: '' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Player 1"
              name="homeTeam"
              rules={[{ required: true, message: 'Player 1 is required' }]}
            >
              <Select disabled className="h-10">
                {scheduledMatches.map((match, index) => (
                  <Option
                    key={match.player_one_id ?? `player1-${index}`}
                    value={match.player_one_id}
                  >
                    {match.player_one_name} {match.player_one_last_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Player 2"
              name="awayTeam"
              rules={[{ required: true, message: 'Player 2 is required' }]}
            >
              <Select disabled className="h-10">
                {scheduledMatches.map((match, index) => (
                  <Option
                    key={match.player_two_id ?? `player2-${index}`}
                    value={match.player_two_id}
                  >
                    {match.player_two_name} {match.player_two_last_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Player 1 Goals"
              name="homeScore"
              rules={[
                { required: true, message: 'Goals are required' },
                { pattern: /^[0-9]*$/, message: 'Must be a number' },
                {
                  validator: (_, value) =>
                    value === '' || parseInt(value) >= 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Cannot be negative'))
                }
              ]}
            >
              <Input type="number" min="0" placeholder="Enter goals" className="h-10" />
            </Form.Item>

            <Form.Item
              label="Player 2 Goals"
              name="awayScore"
              rules={[
                { required: true, message: 'Goals are required' },
                { pattern: /^[0-9]*$/, message: 'Must be a number' },
                {
                  validator: (_, value) =>
                    value === '' || parseInt(value) >= 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Cannot be negative'))
                }
              ]}
            >
              <Input type="number" min="0" placeholder="Enter goals" className="h-10" />
            </Form.Item>

            <Form.Item
              label="Match Date"
              name="scheduledDate"
              rules={[{ required: true, message: 'Date is required' }]}
              className="sm:col-span-2"
            >
              <DatePicker disabled className="w-full h-10" />
            </Form.Item>
          </div>

          <Divider />

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full sm:w-auto h-10 px-6"
              icon={<SaveOutlined />}
            >
              Submit Match Result
            </Button>
          </div>
        </Form>
      )}
    </Card>
  );
};

export default AddMatchResultForm;