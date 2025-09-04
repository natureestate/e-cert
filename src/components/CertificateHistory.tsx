import React, { useState, useEffect } from 'react';
import { Box, Card, Heading, Flex, Text, Button, TextField, Select, Badge, Grid } from '@radix-ui/themes';
import { EyeOpenIcon, DownloadIcon, MagnifyingGlassIcon, ArchiveIcon } from '@radix-ui/react-icons';
import { FirestoreService } from '../services/firestoreService';
import { Certificate } from '../types/firestore';

interface CertificateHistoryProps {
  onViewCertificate: (certificate: Certificate) => void;
}

export const CertificateHistory: React.FC<CertificateHistoryProps> = ({ onViewCertificate }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await FirestoreService.getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.buyer && cert.buyer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cert.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): "gray" | "green" | "red" | "orange" => {
    switch (status) {
      case 'issued': return 'green';
      case 'expired': return 'red';
      case 'claimed': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'ออกแล้ว';
      case 'expired': return 'หมดอายุ';
      case 'claimed': return 'เคลมแล้ว';
      default: return 'ฉบับร่าง';
    }
  };

  if (loading) {
    return (
      <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Text color="gray" size="3" style={{ textAlign: 'center', fontStyle: 'italic' }}>
          กำลังโหลดประวัติใบรับประกัน...
        </Text>
      </Box>
    );
  }

  return (
    <Box p="6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Box mb="6">
        <Flex align="center" gap="3" mb="3">
          <Box
            style={{
              background: 'linear-gradient(135deg, var(--blue-9), var(--indigo-9))',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArchiveIcon width="24" height="24" color="white" />
          </Box>
          <Heading as="h2" size="7" style={{ color: 'var(--blue-11)' }}>
            ประวัติใบรับประกัน
          </Heading>
        </Flex>
        <Text color="gray" size="3">รายการใบรับประกันที่ออกไปแล้วทั้งหมด</Text>
      </Box>

      {/* Search and Filter */}
      <Flex gap="4" mb="6" direction={{ initial: 'column', sm: 'row' }} align="end">
        <Box style={{ flex: 1 }}>
          <TextField.Root
            placeholder="ค้นหาด้วยเลขที่ใบรับประกัน, ชื่อลูกค้า, ผู้ซื้อสินค้า, บริษัท, หรือโครงการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="3"
            style={{
              borderRadius: '10px',
              border: '1px solid var(--slate-6)',
              backgroundColor: 'white',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width="16" height="16" color="var(--slate-9)" />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        
        <Box style={{ minWidth: '200px' }}>
          <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger placeholder="สถานะทั้งหมด" />
            <Select.Content>
              <Select.Item value="all">สถานะทั้งหมด</Select.Item>
              <Select.Item value="draft">ฉบับร่าง</Select.Item>
              <Select.Item value="issued">ออกแล้ว</Select.Item>
              <Select.Item value="expired">หมดอายุ</Select.Item>
              <Select.Item value="claimed">เคลมแล้ว</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>

      {/* Results Summary */}
      <Box mb="4">
        <Text color="gray" size="2" style={{ fontStyle: 'italic' }}>
          แสดง {filteredCertificates.length} รายการ จากทั้งหมด {certificates.length} รายการ
        </Text>
      </Box>

      {/* Certificates List */}
      <Grid columns={{ initial: '1', sm: '1', md: '2', lg: '3' }} gap="4">
        {filteredCertificates.length === 0 ? (
          <Box 
            gridColumn="1 / -1" 
            style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: 'var(--gray-11)', 
              fontStyle: 'italic' 
            }}
          >
            <Text size="3">ไม่พบใบรับประกันที่ตรงกับการค้นหา</Text>
          </Box>
        ) : (
          filteredCertificates.map((certificate) => (
            <Card key={certificate.id} variant="surface" style={{ padding: '1.5rem' }}>
              <Flex justify="between" align="center" mb="3">
                <Text weight="bold" size="4" color="blue">
                  {certificate.certificateNumber}
                </Text>
                <Badge color={getStatusColor(certificate.status)} size="2">
                  {getStatusText(certificate.status)}
                </Badge>
              </Flex>
              
              <Box mb="3">
                <Box mb="3">
                  <Text size="2" color="gray" mb="1"><strong>บริษัท:</strong> {certificate.companyName}</Text>
                  <Text size="2" color="gray" mb="1"><strong>ลูกค้า:</strong> {certificate.customerName}</Text>
                  {certificate.buyer && (
                    <Text size="2" color="gray" mb="1"><strong>ผู้ซื้อสินค้า:</strong> {certificate.buyer}</Text>
                  )}
                  <Text size="2" color="gray" mb="1"><strong>โครงการ:</strong> {certificate.projectName}</Text>
                  <Text size="2" color="gray" mb="1"><strong>สินค้า:</strong> {certificate.productItems}</Text>
                </Box>
                
                <Box>
                  <Text size="2" color="gray" mb="1">
                    <strong>วันที่ส่งมอบ:</strong> {new Date(certificate.deliveryDate).toLocaleDateString('th-TH')}
                  </Text>
                  <Text size="2" color="gray" mb="1">
                    <strong>วันที่ออกเอกสาร:</strong> {new Date(certificate.issueDate).toLocaleDateString('th-TH')}
                  </Text>
                  <Text size="2" color="gray" mb="1">
                    <strong>วันหมดอายุ:</strong> {new Date(certificate.warrantyExpiration).toLocaleDateString('th-TH')}
                  </Text>
                </Box>
              </Box>
              
              <Flex gap="2">
                <Button
                  size="2"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, var(--blue-9), var(--indigo-9))',
                    border: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onViewCertificate(certificate)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Flex align="center" gap="1">
                    <EyeOpenIcon width="14" height="14" />
                    <Text size="2">ดูรายละเอียด</Text>
                  </Flex>
                </Button>
                <Button
                  size="2"
                  variant="soft"
                  style={{
                    backgroundColor: 'var(--slate-3)',
                    color: 'var(--slate-11)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {/* TODO: Download PDF */}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--slate-4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--slate-3)';
                  }}
                >
                  <DownloadIcon width="14" height="14" />
                </Button>
              </Flex>
            </Card>
          ))
        )}
      </Grid>
    </Box>
  );
};
