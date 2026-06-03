import React from 'react';
import { Input, Button, Card, Select, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * PlayerFilters Component - Handles search and filter functionality
 * Features:
 * - Search players by name or phone
 * - Filter by status and age
 * - Toggle filter visibility
 */
const PlayerFilters = ({ 
  onSearch,
  onFilterChange,
  isFilterVisible,
  onToggleFilters,
  searchText,
  filters
}) => {
  /**
   * Handles search input changes
   * @param {string} value - Search text
   */
  const handleSearch = (value) => {
    onSearch(value);
  };

  /**
   * Handles filter changes
   * @param {string} key - Filter key
   * @param {string} value - Filter value
   */
  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white">Players</h2>
        <span className="text-gray-400 text-xs sm:text-sm">
          {/* Player count will be handled by parent */}
        </span>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
        <Search
          placeholder="Search players..."
          allowClear
          enterButton={<SearchOutlined />}
          size="small"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-48"
          classNames={{
            input: "bg-gray-800 text-white border-gray-700 text-xs sm:text-sm",
            button: "bg-gray-700 border-gray-700"
          }}
        />
        <Button 
          type="default" 
          icon={<FilterOutlined />} 
          onClick={onToggleFilters}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 text-xs sm:text-sm"
          size="small"
        >
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {isFilterVisible && (
        <Card className="mb-3 bg-gray-800 border-gray-700 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
              <Select
                placeholder="Filter by status"
                allowClear
                className="w-full text-xs sm:text-sm"
                size="small"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Age</label>
              <Select
                placeholder="Filter by age"
                allowClear
                className="w-full text-xs sm:text-sm"
                size="small"
                value={filters.age}
                onChange={(value) => handleFilterChange('age', value)}
              >
                <Option value="under18">Under 18</Option>
                <Option value="18-25">18-25</Option>
                <Option value="26-35">26-35</Option>
                <Option value="over35">Over 35</Option>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlayerFilters;