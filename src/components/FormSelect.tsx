import React from 'react';
import { Box, Text, Select, Button, Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
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
  allowAddNew?: boolean;
  onAddNew?: () => void;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'เลือก...',
  required = false,
  allowAddNew = false,
  onAddNew
}) => {
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
      
      <Flex gap="3" align="center">
        <Box style={{ flex: 1 }}>
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
                borderRadius: '12px',
                border: '1px solid var(--slate-6)',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: 'white'
              }}
            >
              {options.map((option) => (
                <Select.Item 
                  key={option.value} 
                  value={option.value}
                  disabled={option.isActive === false}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    margin: '2px',
                    cursor: 'pointer'
                  }}
                >
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
        
        {allowAddNew && onAddNew && (
          <Button
            type="button"
            size="3"
            variant="outline"
            style={{
              borderRadius: '10px',
              borderColor: 'var(--blue-6)',
              color: 'var(--blue-9)',
              backgroundColor: 'var(--blue-2)',
              transition: 'all 0.2s ease',
              padding: '0.875rem'
            }}
            onClick={onAddNew}
            title={`เพิ่ม${label}ใหม่`}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-3)';
              e.currentTarget.style.borderColor = 'var(--blue-8)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-2)';
              e.currentTarget.style.borderColor = 'var(--blue-6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <PlusIcon width="16" height="16" />
          </Button>
        )}
      </Flex>
    </Box>
  );
};
