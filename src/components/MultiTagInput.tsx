import React, { useState, useRef, KeyboardEvent } from 'react';
import { Box, Text, TextField, Badge, Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';

interface MultiTagInputProps {
  id: string;
  name: string;
  label: string;
  value: string[]; // Array of strings
  onChange: (name: string, value: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export const MultiTagInput: React.FC<MultiTagInputProps> = ({
  id,
  name,
  label,
  value = [],
  onChange,
  placeholder = 'พิมพ์และกด Enter เพื่อเพิ่ม...',
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // เพิ่ม tag ใหม่
  const addTag = (tagText: string) => {
    const trimmedText = tagText.trim();
    if (trimmedText && !value.includes(trimmedText)) {
      const newTags = [...value, trimmedText];
      onChange(name, newTags);
    }
    setInputValue('');
  };

  // ลบ tag
  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(name, newTags);
  };

  // จัดการ key press
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // ลบ tag สุดท้ายเมื่อกด backspace ในช่องว่าง
      removeTag(value[value.length - 1]);
    }
  };

  // จัดการการ blur (เมื่อออกจากช่อง input)
  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <Box mb="5">
      <Text as="label" size="3" weight="medium" mb="3" style={{ display: 'block', color: 'var(--slate-11)' }}>
        {label}
        {required && <span style={{ color: 'var(--red-9)', marginLeft: '3px' }}>*</span>}
      </Text>
      
      <Box
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: '2.75rem',
          padding: '0.5rem',
          borderRadius: '10px',
          border: '1px solid var(--slate-6)',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          cursor: 'text'
        }}
      >
        <Flex wrap="wrap" gap="2" align="center">
          {/* แสดง tags ที่มีอยู่ */}
          {value.map((tag, index) => (
            <Badge
              key={index}
              size="2"
              variant="soft"
              color="blue"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--blue-3)',
                color: 'var(--blue-11)',
                fontSize: '13px'
              }}
            >
              <span>{tag}</span>
              <Cross2Icon
                width="12"
                height="12"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
              />
            </Badge>
          ))}
          
          {/* ช่อง input สำหรับเพิ่ม tag ใหม่ */}
          <TextField.Root
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              flex: 1,
              minWidth: '120px',
              fontSize: '14px'
            }}
          />
        </Flex>
      </Box>
      
      {/* คำแนะนำการใช้งาน */}
      <Text size="1" color="gray" style={{ marginTop: '4px', fontStyle: 'italic' }}>
        พิมพ์ข้อความแล้วกด Enter เพื่อเพิ่ม หรือกด Backspace เพื่อลบ
      </Text>
    </Box>
  );
};
