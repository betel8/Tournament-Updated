import { 
    Table, 
    Space, 
    Button, 
    Typography, 
    Tag, 
    Popconfirm, 
    Form, 
    Select, 
    InputNumber, 
    Avatar, 
    DatePicker,
    App 
  } from 'antd';
  import dayjs from 'dayjs';
  import MatchService from '../../../api/services/match.service';
  import { useState } from 'react';
  
  const { Text } = Typography;
  const { Option } = Select;
  
  export default function MatchesTable({ matches, loading, players, onRefresh }) {
    const { message } = App.useApp();
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
  
    const handleEdit = (record) => {
      form.setFieldsValue({
        ...record,
        scheduled_time: record.scheduled_time ? dayjs(record.scheduled_time) : null
      });
      setEditingId(record.id);
    };
  
    const handleDelete = async (matchId) => {
      try {
        await MatchService.deleteMatch(matchId);
        message.success('Match deleted successfully');
        onRefresh();
      } catch (error) {
        console.error('Delete error:', error);
        message.error('Failed to delete match');
      }
    };
  
    const handleSave = async (matchId) => {
      try {
        const values = await form.validateFields();
        await MatchService.updateMatch(matchId, {
          ...values,
          scheduled_time: values.scheduled_time 
            ? values.scheduled_time.format('YYYY-MM-DD HH:mm:ss')
            : null
        });
        message.success('Match updated successfully');
        setEditingId(null);
        onRefresh();
      } catch (error) {
        console.error('Save error:', error);
        message.error('Failed to update match');
      }
    };
  
    const handleCancel = () => {
      setEditingId(null);
    };
  
    const columns = [
      {
        title: 'Round',
        dataIndex: 'round_level',
        key: 'round_level',
        render: (level) => {
          const roundNames = {
            1: 'Round of 16',
            2: 'Quarterfinals',
            3: 'Semifinals',
            4: 'Final'
          };
          return <Tag color={getRoundColor(level)}>{roundNames[level] || `Round ${level}`}</Tag>;
        },
        editable: true,
      },
      {
        title: 'Position',
        dataIndex: 'bracket_position',
        key: 'bracket_position',
        editable: true,
      },
      {
        title: 'Player 1',
        key: 'player_one',
        render: (_, record) => (
          <div>
            {record.player_one_name ? (
              <div className="flex items-center gap-2">
                <Avatar 
                  src={record.player_one_photo ? `/api/${record.player_one_photo}` : null}
                  size="small"
                >
                  {record.player_one_name?.charAt(0)}{record.player_one_last_name?.charAt(0)}
                </Avatar>
                <span>
                  {record.player_one_name} {record.player_one_last_name}
                  {record.player_one_strength && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({record.player_one_strength})
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <Text type="secondary">TBD</Text>
            )}
          </div>
        ),
      },
      {
        title: 'Player 2',
        key: 'player_two',
        render: (_, record) => (
          <div>
            {record.player_two_name ? (
              <div className="flex items-center gap-2">
                <Avatar 
                  src={record.player_two_photo ? `/api/${record.player_two_photo}` : null}
                  size="small"
                >
                  {record.player_two_name?.charAt(0)}{record.player_two_last_name?.charAt(0)}
                </Avatar>
                <span>
                  {record.player_two_name} {record.player_two_last_name}
                  {record.player_two_strength && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({record.player_two_strength})
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <Text type="secondary">TBD</Text>
            )}
          </div>
        ),
      },
      {
        title: 'Scheduled Time',
        dataIndex: 'scheduled_time',
        key: 'scheduled_time',
        render: (time) => time ? (
          <Text>{dayjs(time).format('YYYY-MM-DD HH:mm')}</Text>
        ) : (
          <Text type="secondary">Not scheduled</Text>
        ),
        editable: true,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => {
          const isEditing = record.id === editingId;
          return isEditing ? (
            <Space size="middle">
              <Button 
                type="link" 
                onClick={() => handleSave(record.id)}
              >
                Save
              </Button>
              <Button 
                type="link" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Space>
          ) : (
            <Space size="middle">
              <Button 
                type="link" 
                onClick={() => handleEdit(record)}
                disabled={editingId !== null}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this match?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="link" 
                  danger 
                  disabled={editingId !== null}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];
  
    const mergedColumns = columns.map(col => {
      if (!col.editable) {
        return col;
      }
      
      return {
        ...col,
        onCell: (record) => ({
          record,
          inputType: col.dataIndex === 'scheduled_time' ? 'date' : 
                     col.dataIndex === 'bracket_position' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: record.id === editingId,
        }),
      };
    });
  
    const getRoundColor = (level) => {
      const colors = {
        1: 'blue',
        2: 'purple',
        3: 'red',
        4: 'gold'
      };
      return colors[level] || 'default';
    };
  
    return (
      <>
        <div className="mb-2 flex justify-end">
          <Button onClick={onRefresh}>Refresh</Button>
        </div>
        <Form form={form} component={false}>
          <Table 
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={mergedColumns} 
            dataSource={matches} 
            rowKey="id"
            className="mb-6"
            pagination={false}
            loading={loading}
            locale={{
              emptyText: <Text type="secondary">No matches found</Text>
            }}
          />
        </Form>
      </>
    );
  }
  
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'date' ? (
      <DatePicker showTime format="YYYY-MM-DD HH:mm" />
    ) : inputType === 'number' ? (
      <InputNumber min={1} max={16} />
    ) : (
      <Select>
        <Option value={1}>Round of 16</Option>
        <Option value={2}>Quarterfinals</Option>
        <Option value={3}>Semifinals</Option>
        <Option value={4}>Final</Option>
      </Select>
    );
  
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };