import { useState } from 'react';
import { Form, Input, Button, Space, DatePicker, Modal, App } from 'antd';
import dayjs from 'dayjs';
import TournamentService from '../../../../api/services/tournament.service';

const CreateTournamentModal = ({ visible, onCancel, onSuccess, screens }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await TournamentService.createTournament({
        tournamentName: values.tournamentName,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD')
      });
      
      message.success('Tournament created successfully');
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(`Tournament creation failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledStartDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledEndDate = (current) => {
    const startDate = form.getFieldValue('startDate');
    if (!startDate) return current && current < dayjs().startOf('day');
    return current && current < startDate;
  };

  return (
    <Modal
      title="Create Tournament"
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
          label="Tournament Name"
          name="tournamentName"
          rules={[{ required: true, message: 'Please input tournament name!' }]}
        >
          <Input size={screens.xs ? 'small' : 'middle'} />
        </Form.Item>

        <Space size={screens.xs ? 8 : 16} className="w-full">
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date!' }]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <DatePicker 
              style={{ width: '100%' }}
              size={screens.xs ? 'small' : 'middle'}
              disabledDate={disabledStartDate}
            />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            rules={[
              { required: true, message: 'Please select end date!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('End date must be after start date!'));
                },
              }),
            ]}
            className={screens.xs ? 'w-full' : 'w-1/2'}
          >
            <DatePicker 
              style={{ width: '100%' }}
              size={screens.xs ? 'small' : 'middle'}
              disabledDate={disabledEndDate}
            />
          </Form.Item>
        </Space>

        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isSubmitting}
          block
          size={screens.xs ? 'small' : 'middle'}
        >
          Create Tournament
        </Button>
      </Form>
    </Modal>
  );
};

export default CreateTournamentModal;