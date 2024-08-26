import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QrCodeGenerator = ({ value }) => {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, value, 
          { errorCorrectionLevel: 'H',
            width: 155, // 設定寬度
            scale: 160, // 調整比例 
            }, (error) => {
          if (error) console.error(error);
        });
      }
    }, [value]);
  
    return (
      <div>
        <canvas ref={canvasRef}></canvas>
      </div>
    );
  };
  
  export default QrCodeGenerator;