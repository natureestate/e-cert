/**
 * ยูทิลิตี้สำหรับการพิมพ์เอกสารใบรับประกัน
 */

/**
 * เปิดหน้าต่าง Print Preview สำหรับการพิมพ์
 * @param certificateNumber หมายเลขใบรับประกัน (ไม่บังคับ)
 */
export const printCertificate = async (certificateNumber?: string): Promise<void> => {
  // รอสักครู่เพื่อให้ DOM update ก่อน
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // ค้นหา element ของใบรับประกัน
  let certificateElement = document.getElementById('certificate');
  
  if (!certificateElement) {
    // ลองหาด้วย className
    certificateElement = document.querySelector('.certificate-wrapper') as HTMLElement;
  }
  
  if (!certificateElement) {
    console.error("Certificate element not found!");
    throw new Error("ไม่พบองค์ประกอบใบรับประกัน กรุณาตรวจสอบว่ามีการแสดงใบรับประกันในหน้าจอ");
  }

  // ตรวจสอบว่า element มีเนื้อหาหรือไม่
  if (!certificateElement.textContent || certificateElement.textContent.trim().length === 0) {
    console.error("Certificate element is empty!");
    throw new Error("ใบรับประกันยังไม่มีข้อมูล กรุณากรอกข้อมูลให้ครบถ้วนก่อน");
  }

  console.log("✅ พบ certificate element:", certificateElement);

  try {
    // สร้าง print preview โดยการเปิดหน้าต่างใหม่
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error("ไม่สามารถเปิดหน้าต่าง Print Preview ได้ กรุณาอนุญาตให้เปิด popup");
    }

    // ดึง styles ทั้งหมดจากหน้าเดิม
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(element => element.outerHTML)
      .join('\n');

    // สร้าง HTML สำหรับการพิมพ์
    const printHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบรับประกัน${certificateNumber ? ` - ${certificateNumber}` : ''}</title>
    ${styles}
    <style>
        /* Print-specific styles */
        body {
            margin: 0;
            padding: 20px;
            background: white !important;
            font-family: 'IBM Plex Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        .certificate-wrapper {
            width: 100% !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            border: 8px double #1e40af !important;
            padding: 24px !important;
            background: white !important;
            color: #333 !important;
            page-break-inside: avoid;
        }
        
        /* ซ่อนปุ่มและ UI อื่นๆ ที่ไม่ต้องการพิมพ์ */
        button, .no-print {
            display: none !important;
        }
        
        /* ปรับสีให้เหมาะสมกับการพิมพ์ */
        .cert-header h4, 
        .cert-section-title, 
        .cert-company-info h5 {
            color: #1e40af !important;
        }
        
        .cert-header, 
        .cert-footer {
            border-color: #666 !important;
        }
        
        /* ปรับโลโก้ให้เหมาะสมกับการพิมพ์ */
        .cert-logo {
            filter: none !important;
            max-height: 80px !important;
        }
        
        /* Print media query */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .certificate-wrapper {
                margin: 0;
                padding: 20px;
                border: 6px double #000 !important;
            }
            
            .cert-header h4, 
            .cert-section-title, 
            .cert-company-info h5 {
                color: #000 !important;
            }
            
            .cert-header, 
            .cert-footer {
                border-color: #000 !important;
            }
            
            .cert-logo {
                filter: grayscale(100%) !important;
            }
        }
        
        /* ปรับขนาดฟอนต์สำหรับการพิมพ์ */
        .certificate-wrapper {
            font-size: 12px !important;
            line-height: 1.4 !important;
        }
        
        .cert-header h4 {
            font-size: 24px !important;
        }
        
        .cert-section-title {
            font-size: 14px !important;
        }
        
        .cert-company-info h5 {
            font-size: 16px !important;
        }
    </style>
</head>
<body>
    ${certificateElement.outerHTML}
    
    <script>
        // Auto-focus และแสดง print dialog เมื่อโหลดเสร็จ
        window.onload = function() {
            window.focus();
            // รอสักครู่แล้วเปิด print dialog
            setTimeout(function() {
                window.print();
            }, 1000);
        };
        
        // ปิดหน้าต่างหลังจากพิมพ์เสร็จ (หรือยกเลิก)
        window.onafterprint = function() {
            window.close();
        };
    </script>
</body>
</html>`;

    // เขียน HTML ลงในหน้าต่างใหม่
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    console.log(`✅ เปิด Print Preview สำเร็จ: ใบรับประกัน${certificateNumber ? ` ${certificateNumber}` : ''}`);
    
  } catch (error) {
    console.error("Error opening print preview:", error);
    throw new Error("เกิดข้อผิดพลาดในการเปิด Print Preview: " + (error as Error).message);
  }
};

/**
 * ฟังก์ชันสำหรับการพิมพ์โดยตรงโดยไม่เปิดหน้าต่างใหม่
 */
export const directPrint = (): void => {
  // เพิ่ม class สำหรับการพิมพ์
  document.body.classList.add('print-mode');
  
  // ซ่อน elements ที่ไม่ต้องการพิมพ์
  const elementsToHide = document.querySelectorAll('button, .no-print, nav, .nav, .navigation');
  elementsToHide.forEach(element => {
    (element as HTMLElement).style.display = 'none';
  });
  
  // เปิด print dialog
  window.print();
  
  // คืนค่า elements หลังจากพิมพ์
  setTimeout(() => {
    document.body.classList.remove('print-mode');
    elementsToHide.forEach(element => {
      (element as HTMLElement).style.display = '';
    });
  }, 100);
};

/**
 * ตรวจสอบว่าเบราว์เซอร์รองรับการพิมพ์หรือไม่
 */
export const isPrintSupported = (): boolean => {
  return typeof window !== 'undefined' && 'print' in window;
};

/**
 * ตรวจสอบว่าสามารถเปิด popup สำหรับ print preview ได้หรือไม่
 */
export const canOpenPrintWindow = (): boolean => {
  try {
    const testWindow = window.open('', '_blank', 'width=1,height=1');
    if (testWindow) {
      testWindow.close();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
