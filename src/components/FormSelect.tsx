import React, { useState, useMemo } from 'react';
import { Box, Text, Select, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { DropdownOption } from '../types/firestore';

interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'เลือก...',
  required = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // กรองตัวเลือกตามคำค้นหา
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Convert Radix Select change to standard form change event
  const handleSelectChange = (newValue: string) => {
    const event = {
      target: {
        name,
        value: newValue
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  return (
    <Box mb="5">
      <Text as="label" size="3" weight="medium" mb="3" style={{ display: 'block', color: 'var(--slate-11)' }}>
        {label}
        {required && <span style={{ color: 'var(--red-9)', marginLeft: '3px' }}>*</span>}
      </Text>
      
      <Box>
        <Select.Root value={value} onValueChange={handleSelectChange}>
          <Select.Trigger 
            placeholder={placeholder}
            style={{ 
              width: '100%',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--slate-6)',
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          />
          <Select.Content
            style={{
              zIndex: 1000,
              minWidth: '200px',
              maxHeight: '350px',
              borderRadius: '12px',
              border: '1px solid var(--slate-6)',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'white',
              padding: '8px'
            }}
          >
            {/* ช่องค้นหา */}
            <Box style={{ padding: '8px 4px 12px 4px', borderBottom: '1px solid var(--slate-4)', marginBottom: '8px' }}>
              <TextField.Root
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '14px'
                }}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* รายการตัวเลือกที่กรองแล้ว */}
            {filteredOptions.length === 0 ? (
              <Select.Item value="no-data" disabled style={{ 
                padding: '0.75rem 1rem',
                color: 'var(--slate-9)',
                fontStyle: 'italic'
              }}>
                {searchTerm ? `ไม่พบข้อมูลที่ค้นหา "${searchTerm}"` : 'ไม่มีข้อมูลให้เลือก'}
              </Select.Item>
            ) : (
              filteredOptions.map((option) => (
                <Select.Item 
                  key={option.value} 
                  value={option.value}
                  disabled={option.isActive === false}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    margin: '2px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}
                >
                  {option.label}
                </Select.Item>
              ))
            )}
          </Select.Content>
        </Select.Root>
      </Box>
    </Box>
  );
};
