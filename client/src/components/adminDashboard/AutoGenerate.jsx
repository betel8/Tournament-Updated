import { useState } from 'react';
import { Button, Card, Form, InputNumber, Select, Divider, message, Spin, Switch, Row, Col, DatePicker } from 'antd';
import { useQuery, useMutation } from '@apollo/client';
import dayjs from 'dayjs';

const { Option } = Select;

export default function AutoGenerate() {
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('roundRobin'); // 'roundRobin', 'brackets', 'custom'
  const [advancedOptions, setAdvancedOptions] = useState(false);

  // Fetch data needed for generation
  const { loading: leaguesLoading, data: leaguesData } = useQuery(GET_LEAGUES);
  const { loading: teamsLoading, data: teamsData } = useQuery(GET_TEAMS);
  const [generateMatches] = useMutation(GENERATE_MATCHES);

  const handleGenerate = async (values) => {
    setIsGenerating(true);
    try {
      const input = {
        leagueId: values.league,
        teamIds: values.teams,
        type: generationType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        options: {
          matchesPerWeek: values.matchesPerWeek,
          homeAndAway: values.homeAndAway,
          ...(generationType === 'brackets' && { bracketSize: values.bracketSize }),
          ...(generationType === 'custom' && { customPattern: values.customPattern })
        }
      };

      await generateMatches({
        variables: { input },
        refetchQueries: [{ query: GET_LEAGUES }]
      });

      message.success(`Successfully generated ${generationType === 'roundRobin' ? 'round robin' : generationType} matches`);
      form.resetFields();
    } catch (error) {
      message.error(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (leaguesLoading || teamsLoading) {
    return <Spin size="large" className="flex justify-center mt-8" />;
  }

  return (
    <div className="p-4">
      <Card title="Auto-Generate Matches" className="max-w-4xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{
            homeAndAway: true,
            matchesPerWeek: 2,
            bracketSize: 8
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Generation Type"
                name="type"
                initialValue={generationType}
              >
                <Select onChange={setGenerationType}>
                  <Option value="roundRobin">Round Robin</Option>
                  <Option value="brackets">Tournament Brackets</Option>
                  <Option value="custom">Custom Pattern</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="League"
                name="league"
                rules={[{ required: true, message: 'Please select a league' }]}
              >
                <Select placeholder="Select league" showSearch>
                  {leaguesData?.leagues.map(league => (
                    <Option key={league.id} value={league.id}>
                      {league.name} ({league.season})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Teams"
                name="teams"
                rules={[{ required: true, message: 'Please select at least 2 teams', type: 'array', min: 2 }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select teams"
                  showSearch
                  optionFilterProp="children"
                >
                  {teamsData?.teams.map(team => (
                    <Option key={team.id} value={team.id}>
                      {team.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Date Range"
                name="dateRange"
                rules={[{ required: true, message: 'Please select a date range' }]}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>

            <Divider orientation="left" className="mt-0">
              <Switch
                checked={advancedOptions}
                onChange={setAdvancedOptions}
                checkedChildren="Advanced"
                unCheckedChildren="Basic"
              />
            </Divider>

            {advancedOptions && (
              <>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Matches Per Week"
                    name="matchesPerWeek"
                  >
                    <InputNumber min={1} max={7} className="w-full" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Home & Away"
                    name="homeAndAway"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {generationType === 'brackets' && (
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Bracket Size"
                      name="bracketSize"
                    >
                      <Select>
                        <Option value={4}>4 Teams</Option>
                        <Option value={8}>8 Teams</Option>
                        <Option value={16}>16 Teams</Option>
                        <Option value={32}>32 Teams</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                {generationType === 'custom' && (
                  <Col span={24}>
                    <Form.Item
                      label="Custom Pattern"
                      name="customPattern"
                    >
                      <Select placeholder="Select pattern">
                        <Option value="weekendOnly">Weekend Only</Option>
                        <Option value="midweek">Midweek Only</Option>
                        <Option value="alternateDays">Alternate Days</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </>
            )}
          </Row>

          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isGenerating}
              size="large"
              className="w-full md:w-auto"
            >
              Generate Matches
            </Button>
          </div>
        </Form>
      </Card>

      <div className="mt-8 max-w-4xl mx-auto">
        <Card title="Generation Preview">
          <div className="min-h-40 flex items-center justify-center text-gray-400">
            Match schedule preview would appear here based on parameters
          </div>
        </Card>
      </div>
    </div>
  );
}