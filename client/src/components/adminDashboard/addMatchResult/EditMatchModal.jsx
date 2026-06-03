import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ResultService from '../../../api/services/result.service';

const EditMatchModal = ({
  isVisible,
  editingMatch,
  onCancel,
  onSubmit,
  loadInitialData
}) => {
  const [form] = Form.useForm();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    if (editingMatch) {
      setHomeScore(editingMatch.homeScore?.toString() || '');
      setAwayScore(editingMatch.awayScore?.toString() || '');
    }
  }, [editingMatch]);

  const handleEditSubmit = async () => {
    try {
      await ResultService.updateResult(editingMatch.resultId, {
        pOneGoal: homeScore === '' ? 0 : parseInt(homeScore),
        pTwoGoal: awayScore === '' ? 0 : parseInt(awayScore)
      });
      message.success('Match result updated successfully');
      onCancel();
      loadInitialData();
    } catch (error) {
      console.error('Failed to update match result:', error);
      message.error(`Failed to update match result: ${error.message}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format('MMM D, YYYY') : 'N/A';
  };

  return (
    <Modal
      title="Edit Match Result"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={520}
    >
      {editingMatch && (
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>

          {/* Match info header */}
          <div className="my-4 p-4 bg-gray-900 rounded-lg text-center">
            <div className="text-base font-semibold text-white">
              {editingMatch.player_one_name} {editingMatch.player_one_last_name}
              <span className="text-gray-400 mx-2">vs</span>
              {editingMatch.player_two_name} {editingMatch.player_two_last_name}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {formatDate(editingMatch.scheduled_time)}
            </div>
          </div>

          {/* Score inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Player 1 Goals"
              rules={[
                { required: true, message: 'Goals are required' },
                { pattern: /^[0-9]*$/, message: 'Must be a number' },
                {
                  validator: () =>
                    homeScore === '' || parseInt(homeScore) >= 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Cannot be negative'))
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                className="h-10"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="Enter goals"
              />
            </Form.Item>

            <Form.Item
              label="Player 2 Goals"
              rules={[
                { required: true, message: 'Goals are required' },
                { pattern: /^[0-9]*$/, message: 'Must be a number' },
                {
                  validator: () =>
                    awayScore === '' || parseInt(awayScore) >= 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Cannot be negative'))
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                className="h-10"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="Enter goals"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              Update Result
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default EditMatchModal;