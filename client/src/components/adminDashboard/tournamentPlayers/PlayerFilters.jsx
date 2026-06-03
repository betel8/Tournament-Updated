import React from 'react';
import { Select, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const PlayerFilters = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg grid grid-cols-2 md:flex gap-2">
      <Select
        placeholder="Status"
        className="w-full"
        size="small"
        value={filters.status}
        onChange={(value) => onFilterChange({ ...filters, status: value })}
        options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ]}
      />
      <Select
        placeholder="Age Group"
        className="w-full"
        size="small"
        value={filters.ageGroup}
        onChange={(value) => onFilterChange({ ...filters, ageGroup: value })}
        options={[
          { value: 'under18', label: 'Under 18' },
          { value: '18-25', label: '18-25' },
          { value: '26-35', label: '26-35' },
          { value: 'over35', label: 'Over 35' }
        ]}
      />
      <Select
        placeholder="Strength"
        className="w-full hidden md:block"
        size="small"
        value={filters.strength}
        onChange={(value) => onFilterChange({ ...filters, strength: value })}
        options={[
          { value: 'beginner', label: 'Beginner (0-30%)' },
          { value: 'intermediate', label: 'Intermediate (31-70%)' },
          { value: 'advanced', label: 'Advanced (71-100%)' }
        ]}
      />
      <Button 
        type="text" 
        size="small"
        icon={<CloseOutlined />}
        onClick={onClearFilters}
        className="col-span-2 md:col-auto"
      >
        <span className="hidden sm:inline">Clear</span>
      </Button>
    </div>
  );
};

export default PlayerFilters;