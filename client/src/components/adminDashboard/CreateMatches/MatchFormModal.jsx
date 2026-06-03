import { useState, useEffect } from 'react';
import { 
  Modal, Form, Select, InputNumber, Row, Col, DatePicker, Button, 
  Typography, Avatar 
} from 'antd';
import { WarningFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

export default function MatchFormModal({ 
  open, 
  onCancel, 
  onSubmit, 
  players, 
  leagueName,
  currentRound,
  onRoundChange
}) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlayerOne, setSelectedPlayerOne] = useState(null);
  const [selectedPlayerTwo, setSelectedPlayerTwo] = useState(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedPlayerOne(null);
      setSelectedPlayerTwo(null);
      form.setFieldsValue({ round_level: currentRound });
    }
  }, [open, form, currentRound]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (values.player_one_id && values.player_two_id && 
          values.player_one_id === values.player_two_id) {
        throw new Error('Player 1 and Player 2 cannot be the same');
      }
      const success = await onSubmit(values);
      if (success) {
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayerOneChange = (value) => {
    setSelectedPlayerOne(value);
    if (value && value === form.getFieldValue('player_two_id')) {
      form.setFieldsValue({ player_two_id: null });
      setSelectedPlayerTwo(null);
    }
  };

  const handlePlayerTwoChange = (value) => {
    setSelectedPlayerTwo(value);
    if (value && value === form.getFieldValue('player_one_id')) {
      form.setFieldsValue({ player_one_id: null });
      setSelectedPlayerOne(null);
    }
  };

  const handleRoundLevelChange = (value) => {
    onRoundChange(value);
    form.setFieldsValue({ 
      bracket_position: 1,
      player_one_id: null,
      player_two_id: null 
    });
    setSelectedPlayerOne(null);
    setSelectedPlayerTwo(null);
  };

  const renderPlayerOption = (player) => (
    <Option 
      key={`player-${player.id}`} 
      value={player.id}
      label={`${player.first_name} ${player.last_name}`}
    >
      <div className="flex items-center gap-3">
        <Avatar 
          src={player.profile_photo ? `/api/${player.profile_photo}` : null}
          className="shrink-0"
        >
          {player.first_name.charAt(0)}{player.last_name?.charAt(0)}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {player.first_name} {player.last_name}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Strength: {player.strength || 'N/A'}</span>
            <span>{player.phone_number}</span>
          </div>
        </div>
      </div>
    </Option>
  );

  return (
    <Modal
      title={`Create New Match — ${leagueName || 'League'}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={isSubmitting}
          onClick={() => form.submit()}
        >
          Create Match
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      {/* ✅ Custom alert with explicit colors so it's always visible regardless of theme */}
      {players.length === 0 && (
        <div className="flex items-center gap-3 bg-yellow-400 text-gray-900 font-medium rounded-lg px-4 py-3 mb-5">
          <WarningFilled className="text-yellow-700 text-lg shrink-0" />
          <span>No available players for this round. Please add players to the tournament before creating a match.</span>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          round_level: currentRound,
          bracket_position: 1
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Round Level"
              name="round_level"
              rules={[{ required: true, message: 'Please select round level' }]}
            >
              <Select 
                placeholder="Select round level"
                onChange={handleRoundLevelChange}
              >
                <Option value={1}>Round of 16</Option>
                <Option value={2}>Quarterfinals</Option>
                <Option value={3}>Semifinals</Option>
                <Option value={4}>Final</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Bracket Position"
              name="bracket_position"
              rules={[{ 
                required: true, 
                message: 'Please enter bracket position (1-16)',
                type: 'number',
                min: 1,
                max: 16
              }]}
            >
              <InputNumber 
                min={1} 
                max={16} 
                className="w-full" 
                placeholder="1-16"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Player One"
              name="player_one_id"
            >
              <Select 
                placeholder={players.length ? "Select player one" : "No available players"}
                disabled={players.length === 0}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handlePlayerOneChange}
                allowClear
                optionLabelProp="label"
              >
                {players.map(renderPlayerOption)}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Player Two"
              name="player_two_id"
            >
              <Select 
                placeholder={players.length ? "Select player two" : "No available players"}
                disabled={players.length === 0}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handlePlayerTwoChange}
                allowClear
                optionLabelProp="label"
              >
                {players.map(renderPlayerOption)}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Scheduled Time"
              name="scheduled_time"
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full"
                placeholder="Select date and time (optional)"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}