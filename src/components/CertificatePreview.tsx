import React from 'react';

interface CertificateDetails {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  projectNameAndLocation: string;
  customerName: string;
  deliveryDate: string;
  productItems: string;
  batchNumber: string;
  certificateNumber: string;
  issueDate: string;
}

interface CertificatePreviewProps {
  certificateDetails: CertificateDetails | null;
  logoSrc: string | null;
  onExportPDF: () => void;
  isExporting: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificateDetails,
  logoSrc,
  onExportPDF,
  isExporting
}) => {
  return (
    <section className="preview-panel" aria-labelledby="preview-heading">
      <h2 id="preview-heading">ตัวอย่างใบรับประกัน</h2>
      
      {certificateDetails ? (
        <>
          <div id="certificate" className="certificate-wrapper">
            <header className="cert-header">
              {logoSrc && <img src={logoSrc} alt="Company Logo" className="cert-logo" />}
              <h4>ใบรับประกันสินค้า</h4>
              <div className="cert-company-info">
                <h5>{certificateDetails.companyName}</h5>
                <p><strong>ที่อยู่:</strong> {certificateDetails.companyAddress}</p>
                <p><strong>โทรศัพท์:</strong> {certificateDetails.companyPhone} | <strong>เว็บไซต์/อีเมล:</strong> {certificateDetails.companyWebsite}</p>
              </div>
            </header>
            
            <div className="cert-body">
              {/* ข้อมูลโครงการ */}
              <div className="cert-section">
                <h5 className="cert-section-title">ข้อมูลโครงการ</h5>
                <p><strong>ชื่อโครงการ:</strong> {certificateDetails.projectNameAndLocation}</p>
                <p><strong>ชื่อลูกค้า:</strong> {certificateDetails.customerName}</p>
                <p><strong>วันที่ส่งมอบสินค้า:</strong> {certificateDetails.deliveryDate}</p>
              </div>

              {/* รายละเอียดสินค้า */}
              <div className="cert-section">
                <h5 className="cert-section-title">รายละเอียดสินค้า</h5>
                <p><strong>ประเภทสินค้า:</strong> โครงสร้างสำเร็จระบบ Fully precast concrete</p>
                <p><strong>รายการสินค้า:</strong> {certificateDetails.productItems}</p>
                <p><strong>หมายเลขการผลิต/ล็อต (Batch No.):</strong> {certificateDetails.batchNumber}</p>
              </div>

              {/* รายละเอียดการรับประกัน */}
              <div className="cert-section">
                <h5 className="cert-section-title">รายละเอียดการรับประกัน</h5>
                <p>
                  บริษัท {certificateDetails.companyName} ขอรับประกันโครงสร้างสำเร็จระบบ <strong>Fully precast concrete</strong> ที่ได้ส่งมอบให้กับโครงการนี้เป็นระยะเวลา <strong>3 ปี</strong> นับจากวันที่ส่งมอบ โดยมีรายละเอียดดังนี้:
                </p>
                <ol className="cert-list">
                  <li><strong>ขอบเขตการรับประกัน:</strong> การรับประกันนี้ครอบคลุมความเสียหายที่เกิดขึ้นกับโครงสร้างหลักอันเป็นผลมาจาก<strong>ความผิดพลาดในการผลิต</strong> หรือ<strong>ความบกพร่องของวัสดุ</strong> ภายใต้การใช้งานตามปกติและตรงตามมาตรฐานการก่อสร้างที่ถูกต้อง</li>
                  <li><strong>เงื่อนไขและข้อจำกัด:</strong>
                    <ul className="cert-sublist">
                      <li>การรับประกันนี้จะครอบคลุมเฉพาะความเสียหายของโครงสร้างหลัก <strong>ไม่รวม</strong>ถึงผิวหน้าหรือส่วนประกอบที่ไม่ใช่โครงสร้าง (เช่น สี, รอยแตกร้าวเล็กน้อยที่ไม่มีผลต่อโครงสร้าง)</li>
                      <li>การรับประกันจะสิ้นสุดลงทันทีหากความเสียหายเกิดจากการติดตั้งที่ไม่ถูกต้อง, การดัดแปลง, การรื้อถอน, การต่อเติม, หรือการใช้งานผิดวัตถุประสงค์จากที่ได้ออกแบบไว้</li>
                      <li>การรับประกันนี้ <strong>ไม่ครอบคลุม</strong> ความเสียหายที่เกิดจากภัยธรรมชาติ, อุบัติเหตุ, หรือเหตุสุดวิสัย เช่น น้ำท่วม, แผ่นดินไหว, ไฟไหม้, หรือการเคลื่อนตัวของพื้นดินที่ไม่ได้เกิดจากโครงสร้างเอง</li>
                    </ul>
                  </li>
                </ol>
              </div>

              {/* ข้อควรระวังและเงื่อนไขเพิ่มเติม */}
              <div className="cert-section">
                <h5 className="cert-section-title">ข้อควรระวังและเงื่อนไขเพิ่มเติม</h5>
                <ul className="cert-list">
                  <li><strong>การดัดแปลงแก้ไข:</strong> การรับประกันนี้จะสิ้นสุดลงทันที หากมีการเจาะผนัง, ทุบทำลาย, ดัดแปลง หรือแก้ไขโครงสร้างโดยไม่ได้รับอนุญาตหรือคำแนะนำจากวิศวกรของบริษัท</li>
                  <li><strong>การบำรุงรักษา:</strong> ลูกค้ามีหน้าที่ดูแลและบำรุงรักษาโครงสร้างตามคำแนะนำของบริษัท หากความเสียหายเกิดจากการละเลยการบำรุงรักษาที่เหมาะสม จะไม่อยู่ในขอบเขตการรับประกัน</li>
                  <li><strong>การเข้าตรวจสอบ:</strong> ลูกค้าต้องอำนวยความสะดวกให้บริษัทเข้าตรวจสอบความเสียหายตามวันและเวลาที่นัดหมาย เพื่อประเมินและดำเนินการซ่อมแซม</li>
                </ul>
              </div>

              {/* ขั้นตอนการเคลม */}
              <div className="cert-section">
                <h5 className="cert-section-title">ขั้นตอนการเคลม</h5>
                <ul className="cert-list">
                  <li>หากพบความเสียหายที่เข้าเงื่อนไขการรับประกัน โปรดแจ้งให้บริษัททราบเป็นลายลักษณ์อักษรภายใน 30 วันนับจากวันที่พบ เพื่อให้บริษัทเข้าตรวจสอบและประเมินความเสียหาย</li>
                  <li>บริษัทขอสงวนสิทธิ์ในการพิจารณาซ่อมแซม, เสริมความแข็งแรง, หรือเปลี่ยนชิ้นส่วนโครงสร้างที่ชำรุด โดยการดำเนินการจะอยู่ภายใต้ดุลยพินิจของวิศวกรและมาตรฐานทางวิศวกรรม</li>
                </ul>
              </div>
            </div>

            <footer className="cert-footer">
              <p><strong>หมายเหตุ:</strong> โปรดเก็บเอกสารนี้ไว้เป็นหลักฐานเพื่อใช้ในการเคลมสินค้า</p>
              <p><strong>เอกสารนี้ออกโดยระบบดิจิทัล ไม่จำเป็นต้องลงลายเซ็น</strong></p>
              <p>วันที่ออกเอกสาร: {certificateDetails.issueDate}</p>
            </footer>
          </div>
          
          <button 
            className="btn btn-print" 
            onClick={onExportPDF} 
            disabled={isExporting}
          >
            {isExporting ? 'กำลังส่งออก...' : 'ส่งออกเป็น PDF'}
          </button>
        </>
      ) : (
        <div className="placeholder">
          <p>กรุณากรอกข้อมูลในแบบฟอร์มด้านซ้ายเพื่อสร้างใบรับประกัน</p>
        </div>
      )}
    </section>
  );
};
