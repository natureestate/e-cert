import React, { useState } from 'react';
import { Box, Card, Heading, Flex, Text, Button, Section } from '@radix-ui/themes';
import { FileIcon, DownloadIcon, Pencil1Icon, CheckIcon, Cross2Icon, ReloadIcon } from '@radix-ui/react-icons';
import { CertificateDetails, WarrantyTerms, defaultWarrantyTerms } from '../types/certificate';

interface CertificatePreviewProps {
  certificateDetails: CertificateDetails | null;
  logoSrc: string | null;
  onExportPDF: () => void;
  isExporting: boolean;
  warrantyTerms?: WarrantyTerms;
  onWarrantyTermsChange?: (terms: WarrantyTerms) => void;
  editable?: boolean;
  onRefreshPreview?: () => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificateDetails,
  logoSrc,
  onExportPDF,
  isExporting,
  warrantyTerms = defaultWarrantyTerms,
  onWarrantyTermsChange,
  editable = false,
  onRefreshPreview
}) => {
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [editTerms, setEditTerms] = useState<WarrantyTerms>(warrantyTerms);

  const handleSaveTerms = () => {
    if (onWarrantyTermsChange) {
      onWarrantyTermsChange(editTerms);
    }
    setIsEditingTerms(false);
  };

  const handleCancelEdit = () => {
    setEditTerms(warrantyTerms);
    setIsEditingTerms(false);
  };

  return (
    <Section className="preview-panel">
      <Flex align="center" justify="center" gap="3" mb="6">
        <Box
          style={{
            background: 'linear-gradient(135deg, var(--green-9), var(--emerald-9))',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FileIcon width="24" height="24" color="white" />
        </Box>
        <Heading as="h2" size="6" style={{ color: 'var(--green-11)' }}>
          ตัวอย่างใบรับประกัน
        </Heading>
        {onRefreshPreview && (
          <Button
            variant="soft"
            size="2"
            onClick={onRefreshPreview}
            style={{
              backgroundColor: 'var(--green-3)',
              color: 'var(--green-11)',
              border: '1px solid var(--green-6)',
              borderRadius: '8px'
            }}
          >
            <Flex align="center" gap="1">
              <ReloadIcon width="14" height="14" />
              <Text size="2">รีเฟรช</Text>
            </Flex>
          </Button>
        )}
      </Flex>
      
      {certificateDetails ? (
        <>
          {/* Edit Controls */}
          {editable && (
            <Box mb="6" style={{ textAlign: 'center' }}>
              {!isEditingTerms ? (
                <Button 
                  variant="soft"
                  size="3"
                  style={{
                    backgroundColor: 'var(--amber-3)',
                    color: 'var(--amber-11)',
                    border: '1px solid var(--amber-6)',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setIsEditingTerms(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--amber-4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--amber-3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Flex align="center" gap="2">
                    <Pencil1Icon width="16" height="16" />
                    <Text size="3">แก้ไขเงื่อนไขการรับประกัน</Text>
                  </Flex>
                </Button>
              ) : (
                <Flex gap="3" justify="center">
                  <Button 
                    variant="solid"
                    size="3"
                    style={{
                      background: 'linear-gradient(135deg, var(--green-9), var(--emerald-9))',
                      border: 'none',
                      borderRadius: '10px'
                    }}
                    onClick={handleSaveTerms}
                  >
                    <Flex align="center" gap="2">
                      <CheckIcon width="16" height="16" />
                      <Text size="3">บันทึก</Text>
                    </Flex>
                  </Button>
                  <Button 
                    variant="soft"
                    size="3"
                    style={{
                      backgroundColor: 'var(--gray-3)',
                      color: 'var(--gray-11)',
                      borderRadius: '10px'
                    }}
                    onClick={handleCancelEdit}
                  >
                    <Flex align="center" gap="2">
                      <Cross2Icon width="16" height="16" />
                      <Text size="3">ยกเลิก</Text>
                    </Flex>
                  </Button>
                </Flex>
              )}
            </Box>
          )}

          <div id="certificate" className="certificate-wrapper">
            <header className="cert-header">
              <div className="cert-header-content">
                <div className="cert-logo-section">
                  {logoSrc && <img src={logoSrc} alt="Company Logo" className="cert-logo" />}
                </div>
                <div className="cert-title-section">
                  <h4>ใบรับประกันสินค้า</h4>
                  <div className="cert-number">เลขที่: {certificateDetails.certificateNumber}</div>
                </div>
              </div>
              <div className="cert-company-info">
                <h5>{certificateDetails.companyName}</h5>
                <p><strong>ที่อยู่:</strong> {certificateDetails.companyAddress}</p>
                <p><strong>โทรศัพท์:</strong> {certificateDetails.companyPhone} | <strong>เว็บไซต์/อีเมล:</strong> {certificateDetails.companyWebsite}</p>
              </div>
            </header>
            
            <div className="cert-body">
              {/* แถวที่ 1: ข้อมูลโครงการ และ รายละเอียดสินค้า */}
              <div className="cert-row">
                <div className="cert-col">
                  <div className="cert-section">
                    <h5 className="cert-section-title">ข้อมูลโครงการ</h5>
                    <p><strong>ชื่อโครงการ:</strong> {certificateDetails.projectNameAndLocation}</p>
                    <p><strong>ชื่อลูกค้า:</strong> {certificateDetails.customerName}</p>
                    <p><strong>วันที่ส่งมอบ:</strong> {certificateDetails.deliveryDate}</p>
                  </div>
                </div>
                <div className="cert-col">
                  <div className="cert-section">
                    <h5 className="cert-section-title">รายละเอียดสินค้า</h5>
                    <p><strong>ประเภทสินค้า:</strong> {isEditingTerms ? (
                      <input
                        type="text"
                        value={editTerms.productType}
                        onChange={(e) => setEditTerms({...editTerms, productType: e.target.value})}
                        className="inline-edit"
                      />
                    ) : warrantyTerms.productType}</p>
                    <p><strong>รายการสินค้า:</strong> {certificateDetails.productItems}</p>
                    <p><strong>Lot การผลิต:</strong> {
                      Array.isArray(certificateDetails.batchNumber) 
                        ? certificateDetails.batchNumber.join(', ')
                        : certificateDetails.batchNumber
                    }</p>
                  </div>
                </div>
              </div>

              {/* รายละเอียดการรับประกัน */}
              <div className="cert-section">
                <h5 className="cert-section-title">รายละเอียดการรับประกัน</h5>
                <p className="warranty-intro">
                  บริษัท {certificateDetails.companyName} ขอรับประกัน{warrantyTerms.productType} ที่ได้ส่งมอบให้กับโครงการนี้เป็นระยะเวลา <strong>{isEditingTerms ? (
                    <input
                      type="number"
                      value={editTerms.warrantyPeriodYears}
                      onChange={(e) => setEditTerms({...editTerms, warrantyPeriodYears: parseInt(e.target.value)})}
                      className="inline-edit-small"
                      min="1"
                      max="10"
                    />
                  ) : warrantyTerms.warrantyPeriodYears} ปี</strong> นับจากวันที่ส่งมอบ
                </p>
                
                <div className="cert-row">
                  <div className="cert-col">
                    <div className="warranty-scope">
                      <h6><strong>ขอบเขตการรับประกัน:</strong></h6>
                      {isEditingTerms ? (
                        <textarea
                          value={editTerms.scope}
                          onChange={(e) => setEditTerms({...editTerms, scope: e.target.value})}
                          className="edit-textarea"
                          rows={3}
                        />
                      ) : (
                        <p>{warrantyTerms.scope}</p>
                      )}
                    </div>
                  </div>
                  <div className="cert-col">
                    <div className="warranty-limitations">
                      <h6><strong>ข้อจำกัดการรับประกัน:</strong></h6>
                      {isEditingTerms ? (
                        <div>
                          {editTerms.limitations.map((limitation, index) => (
                            <div key={index} className="edit-list-item">
                              <input
                                type="text"
                                value={limitation}
                                onChange={(e) => {
                                  const newLimitations = [...editTerms.limitations];
                                  newLimitations[index] = e.target.value;
                                  setEditTerms({...editTerms, limitations: newLimitations});
                                }}
                                className="edit-input-small"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>ไม่ครอบคลุม: {warrantyTerms.limitations.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อกำหนดสำคัญ */}
              <div className="cert-section">
                <h5 className="cert-section-title">ข้อกำหนดสำคัญ</h5>
                <div className="cert-row">
                  {warrantyTerms.importantTerms.map((term, index) => (
                    <div key={index} className="cert-col">
                      {isEditingTerms ? (
                        <input
                          type="text"
                          value={editTerms.importantTerms[index]}
                          onChange={(e) => {
                            const newTerms = [...editTerms.importantTerms];
                            newTerms[index] = e.target.value;
                            setEditTerms({...editTerms, importantTerms: newTerms});
                          }}
                          className="edit-input"
                        />
                      ) : (
                        <p><strong>•</strong> {term}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="cert-footer">
              <div className="cert-footer-content">
                <div className="footer-left">
                  <p><strong>หมายเหตุ:</strong> {isEditingTerms ? (
                    <input
                      type="text"
                      value={editTerms.footerNote}
                      onChange={(e) => setEditTerms({...editTerms, footerNote: e.target.value})}
                      className="edit-input"
                    />
                  ) : warrantyTerms.footerNote}</p>
                  {certificateDetails.additionalNotes && (
                    <p><strong>หมายเหตุเพิ่มเติม:</strong> {certificateDetails.additionalNotes}</p>
                  )}
                  <p><strong>{isEditingTerms ? (
                    <input
                      type="text"
                      value={editTerms.digitalSignatureNote}
                      onChange={(e) => setEditTerms({...editTerms, digitalSignatureNote: e.target.value})}
                      className="edit-input"
                    />
                  ) : warrantyTerms.digitalSignatureNote}</strong></p>
                </div>
                <div className="footer-right">
                  <p><strong>วันที่ออกเอกสาร:</strong></p>
                  <p>{certificateDetails.issueDate}</p>
                </div>
              </div>
            </footer>
          </div>
          
          <Button 
            size="4"
            style={{ 
              width: '100%', 
              marginTop: '2rem',
              background: isExporting 
                ? 'var(--gray-6)' 
                : 'linear-gradient(135deg, var(--violet-9), var(--purple-9))',
              border: 'none',
              borderRadius: '12px',
              boxShadow: !isExporting ? 'var(--shadow-md)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={onExportPDF} 
            disabled={isExporting}
            onMouseEnter={(e) => {
              if (!isExporting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isExporting) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
          >
            <Flex align="center" gap="2" justify="center">
              <DownloadIcon width="20" height="20" />
              <Text size="4" weight="bold">
                {isExporting ? 'กำลังส่งออก...' : 'ส่งออกเป็น PDF'}
              </Text>
            </Flex>
          </Button>
        </>
      ) : (
        <Card 
          variant="surface" 
          style={{ 
            padding: '2rem', 
            textAlign: 'center',
            border: '2px dashed var(--gray-6)',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text color="gray" size="3">
            กรุณากรอกข้อมูลในแบบฟอร์มด้านซ้ายเพื่อสร้างใบรับประกัน
          </Text>
        </Card>
      )}
    </Section>
  );
};
