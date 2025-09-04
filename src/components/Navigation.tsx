import React, { useState } from 'react';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { 
  FileTextIcon, 
  ArchiveIcon, 
  HomeIcon, 
  PersonIcon, 
  RocketIcon, 
  CubeIcon,
  DashboardIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardIcon,
  BarChartIcon
} from '@radix-ui/react-icons';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

// นิยามประเภทเมนู
interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  group?: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
  items: MenuItem[];
  isExpanded: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    certificates: true,
    workDelivery: false,
    dataManagement: false,
  });

  // เมนูแบบเดี่ยว (ไม่ได้อยู่ในกลุ่ม)
  const singleMenuItems: MenuItem[] = [
    { id: 'create', label: 'สร้างใบรับประกัน', icon: FileTextIcon, color: 'emerald' },
    { id: 'history', label: 'ประวัติใบรับประกัน', icon: ArchiveIcon, color: 'blue' },
  ];

  // กลุ่มเมนูใบส่งมอบงวดงาน
  const workDeliveryGroup: MenuGroup = {
    id: 'workDelivery',
    label: 'ใบส่งมอบงวดงาน',
    icon: ClipboardIcon,
    color: 'green',
    isExpanded: expandedGroups.workDelivery,
    items: [
      { id: 'work-delivery-house', label: 'ส่งมอบงานรับสร้างบ้าน', icon: HomeIcon, color: 'green' },
      { id: 'work-delivery-precast', label: 'ส่งมอบงาน Precast Concrete', icon: CubeIcon, color: 'green' },
      { id: 'work-delivery-history', label: 'ประวัติใบส่งมอบงาน', icon: ArchiveIcon, color: 'green' },
    ]
  };

  // กลุ่มเมนูการจัดการข้อมูล
  const dataManagementGroup: MenuGroup = {
    id: 'dataManagement',
    label: 'จัดการข้อมูล',
    icon: BarChartIcon,
    color: 'purple',
    isExpanded: expandedGroups.dataManagement,
    items: [
      { id: 'companies', label: 'จัดการบริษัท', icon: HomeIcon, color: 'purple' },
      { id: 'customers', label: 'จัดการลูกค้า', icon: PersonIcon, color: 'purple' },
      { id: 'projects', label: 'จัดการโครงการ', icon: RocketIcon, color: 'purple' },
      { id: 'products', label: 'จัดการสินค้า', icon: CubeIcon, color: 'purple' },
    ]
  };

  const menuGroups = [workDeliveryGroup, dataManagementGroup];

  // ฟังก์ชันสำหรับ toggle กลุ่มเมนู
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <Box 
      role="navigation"
      aria-label="เมนูหลัก"
      style={{ 
        width: isCollapsed ? '80px' : '320px',
        background: 'linear-gradient(135deg, var(--slate-12) 0%, var(--slate-11) 100%)',
        color: 'white', 
        minHeight: '100vh',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        transition: 'width 0.3s ease'
      }}
    >
      {/* Background Pattern */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }}
      />
      
      {/* Header */}
      <Box 
        p={isCollapsed ? "3" : "6"}
        style={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '1rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Toggle Button - Always visible at top */}
        <Flex justify="end" mb="3">
          <Button
            variant="ghost"
            size="1"
            aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
            style={{
              color: 'white',
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '28px',
              minHeight: '28px'
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {isCollapsed ? (
              <HamburgerMenuIcon width="14" height="14" />
            ) : (
              <Cross1Icon width="14" height="14" />
            )}
          </Button>
        </Flex>

        {/* Logo and Title Section */}
        <Flex align="center" justify={isCollapsed ? "center" : "flex-start"} gap="3" mb={isCollapsed ? "0" : "3"}>
          <Box 
            style={{
              background: 'linear-gradient(135deg, var(--blue-9), var(--violet-9))',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DashboardIcon width="24" height="24" color="white" />
          </Box>
          {!isCollapsed && (
            <Text 
              as="h1" 
              size="5" 
              weight="bold"
              style={{ 
                color: 'white',
                background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              E-Certificate
            </Text>
          )}
        </Flex>
        
        {!isCollapsed && (
          <Text 
            size="2" 
            style={{ 
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.4'
            }}
          >
            ระบบจัดการใบรับประกันงานติดตั้ง
          </Text>
        )}
      </Box>
      
      {/* Menu Items */}
      <Box px={isCollapsed ? "2" : "3"} py="2" style={{ position: 'relative', zIndex: 1 }}>
        {/* เมนูแบบเดี่ยว */}
        {singleMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Box key={item.id} mb="1">
              <Button
                variant="ghost"
                size="3"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{
                  width: '100%',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '0.875rem 0.5rem' : '0.875rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: isActive 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'transparent',
                  color: 'white',
                  fontWeight: isActive ? '600' : '400',
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => onPageChange(item.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    if (!isCollapsed) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && !isCollapsed && (
                  <Box
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: `linear-gradient(135deg, var(--${item.color}-9), var(--${item.color}-7))`,
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                
                {isCollapsed ? (
                  <Box
                    style={{
                      padding: '6px',
                      borderRadius: '8px',
                      backgroundColor: isActive 
                        ? `var(--${item.color}-9)` 
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent width="18" height="18" color="white" />
                  </Box>
                ) : (
                  <Flex align="center" gap="2" style={{ width: '100%' }}>
                    <Box
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: isActive 
                          ? `var(--${item.color}-9)` 
                          : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent width="18" height="18" color="white" />
                    </Box>
                    <Text size="3" style={{ flex: 1, textAlign: 'left' }}>
                      {item.label}
                    </Text>
                    {isActive && (
                      <Box
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: `var(--${item.color}-9)`,
                          flexShrink: 0
                        }}
                      />
                    )}
                  </Flex>
                )}
              </Button>
            </Box>
          );
        })}

        {/* กลุ่มเมนู */}
        {menuGroups.map((group) => {
          const GroupIconComponent = group.icon;
          const isGroupActive = group.items.some(item => currentPage === item.id);
          
          return (
            <Box key={group.id} mb="2">
              {/* ปุ่มหัวข้อกลุ่ม */}
              <Button
                variant="ghost"
                size="3"
                aria-label={group.label}
                style={{
                  width: '100%',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '0.875rem 0.5rem' : '0.875rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: isGroupActive 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'transparent',
                  color: 'white',
                  fontWeight: '500',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => {
                  if (!isCollapsed) {
                    toggleGroup(group.id);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isGroupActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  } else {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                title={isCollapsed ? group.label : undefined}
              >
                {isCollapsed ? (
                  <Box
                    style={{
                      padding: '6px',
                      borderRadius: '8px',
                      backgroundColor: isGroupActive 
                        ? `var(--${group.color}-9)` 
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <GroupIconComponent width="18" height="18" color="white" />
                  </Box>
                ) : (
                  <Flex align="center" gap="2" style={{ width: '100%' }}>
                    <Box
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: isGroupActive 
                          ? `var(--${group.color}-9)` 
                          : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <GroupIconComponent width="18" height="18" color="white" />
                    </Box>
                    <Text size="3" style={{ flex: 1, textAlign: 'left' }}>
                      {group.label}
                    </Text>
                    <Box style={{ flexShrink: 0 }}>
                      {group.isExpanded ? (
                        <ChevronDownIcon width="16" height="16" color="white" />
                      ) : (
                        <ChevronRightIcon width="16" height="16" color="white" />
                      )}
                    </Box>
                  </Flex>
                )}
              </Button>

              {/* รายการย่อยในกลุ่ม (แสดงเฉพาะเมื่อขยาย) */}
              {!isCollapsed && group.isExpanded && (
                <Box ml="3" mt="1">
                  {group.items.map((item) => {
                    const ItemIconComponent = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Box key={item.id} mb="1">
                        <Button
                          variant="ghost"
                          size="2"
                          aria-label={item.label}
                          aria-current={isActive ? "page" : undefined}
                          style={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: isActive 
                              ? 'rgba(255,255,255,0.15)' 
                              : 'transparent',
                            color: 'white',
                            fontWeight: isActive ? '600' : '400',
                            border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onClick={() => onPageChange(item.id)}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          {isActive && (
                            <Box
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '3px',
                                background: `linear-gradient(135deg, var(--${item.color}-9), var(--${item.color}-7))`,
                                borderRadius: '0 2px 2px 0'
                              }}
                            />
                          )}
                          
                          <Flex align="center" gap="2" style={{ width: '100%' }}>
                            <Box
                              style={{
                                padding: '4px',
                                borderRadius: '6px',
                                backgroundColor: isActive 
                                  ? `var(--${item.color}-9)` 
                                  : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                              }}
                            >
                              <ItemIconComponent width="14" height="14" color="white" />
                            </Box>
                            <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
                              {item.label}
                            </Text>
                            {isActive && (
                              <Box
                                style={{
                                  width: '4px',
                                  height: '4px',
                                  borderRadius: '50%',
                                  backgroundColor: `var(--${item.color}-9)`,
                                  flexShrink: 0
                                }}
                              />
                            )}
                          </Flex>
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
