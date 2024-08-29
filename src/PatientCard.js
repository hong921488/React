import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from 'html2canvas';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getJWTToken } from './authService';
import config from './config.js';

const PatientCard = ({ hhisnum, setHhisnum, setHcaseno }) => {
  const [medicalInfo, setMedicalinfo] = useState({
    HNURSTAT: '',
    HBEDNO: '',
    EPD_SIZE: 3,
    LABEL_ID: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getJWTToken();
        const responseHcaseno = await axios.get(`${config.dbUrl}/EbedsidecardSpring/api/getHcaseno`, {
          params: { hhisnum },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const dataArray = responseHcaseno.data;
        const hcaseno = dataArray.length > 0 ? dataArray[0].HCASENO : '';
        setHcaseno(hcaseno);

        // 獲取病人資料
        const responsePatientData = await axios.get(`${config.dbUrl}/EbedsidecardSpring/api/getPatientData`, {
          params: { hcaseno },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 處理病人資料
        const patientData = responsePatientData.data;
        const Cardinfo = patientData.bedInfo && patientData.bedInfo.length > 0 ? patientData.bedInfo[0] : {};
        setMedicalinfo({
          HNURSTAT: Cardinfo.HNURSTAT,
          HBEDNO: Cardinfo.HBEDNO,
          EPD_SIZE: Cardinfo.EPD_SIZE,
          LABEL_ID: Cardinfo.LABEL_ID
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [hhisnum, setHcaseno]); 

  // 處理截圖
  const handleScreenshot = async () => {
    const paperElement = document.querySelector('.paper');
    if (paperElement) {
      try {
        const canvas = await 
        html2canvas(paperElement, {
          width: 1600,      // 設定輸出畫布的寬度
          height: 1200,     // 設定輸出畫布的高度
          scale: 1,         // 設置縮放為1，保持原始大小
          useCORS: true,    // 如果圖片涉及跨域，可以開啟 CORS 支持
        });
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`;
        link.click();
      } catch (error) {
        console.error('Error taking screenshot:', error);
      }
    }
  };

  // 處理上傳
  const handleUpload = async () => {
    const paperElement = document.querySelector('.paper');
    if (paperElement) {
      try {
        const canvas = await 
        html2canvas(paperElement, {
          width: 1600,      // 設定輸出畫布的寬度
          height: 1200,     // 設定輸出畫布的高度
          scale: 1,         // 設置縮放為1，保持原始大小
          useCORS: true,    // 如果圖片涉及跨域，可以開啟 CORS 支持
        });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        const uploadUrl = `${config.serverUrl}:${config.port}/epaper/`;
        const formData = new FormData();
        formData.append('file', blob, `${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`);

        await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Image uploaded successfully');

        const requestData = {
          label_id: `${medicalInfo.LABEL_ID}`,
          bg_image_url: `${config.serverUrl}:${config.port}/epaper/${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`
        };
        if (requestData.label_id === 'undefined') {
          alert('上傳失敗！請檢查病歷號');
          console.error('Error: label_id does not match');
        } else {
          const token = await getJWTToken();
          const response = await axios.post(`${config.dbUrl}/EbedsidecardSpring/api/saveImageUrl`, requestData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          alert('上傳成功！');
          console.log(response.data);
        }

      } catch (error) {
        alert('上傳失敗！');
        console.error('Error uploading URL:', error);
      }
    }
  };

  // 處理 EPD 上傳
  const handleUploadEPD = async () => {
    const url = "http://172.22.94.140:8094/EPD-Service/api/ContentReceiver";
    const formData = new FormData();

    formData.append('SystemNo', 'EPD');
    formData.append('DeviceNo', 'EPD1332S1304001');
    formData.append('DeviceType', '6');
    formData.append('UploadUser', 'Admin');
    formData.append('Dither', 'Y');
    formData.append('PartialImage', 'null');

    // 將 DeviceConfig 對象轉換為 Blob，然後附加到 formData 中
    const DeviceConfig = {
      "DisplayNo": "1",
      "IsUpdate": true,
      "NextTime": 30,
      "LedMode": 0,
      "LedActionTime": 4,
      "FrontLight": 4,
      "FSImg": [
        {
          "FileName": `${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`,
          "x": 0,
          "y": 0,
          "w": 1600,
          "h": 1200
        }
      ],
      "ExpandButton_1": null,
      "ExpandButton_2": null,
      "ExpandButton_3": null,
      "ExpandButton_4": null,
      "WaitingTimeOut": null,
      "ConnFailCount": null,
      "ConnDelayTime": null
    }
    const configBlob = new Blob([JSON.stringify(DeviceConfig)], { type: 'application/json' });
    formData.append('ConfigFile', configBlob, 'DeviceConfig.json');

    // 從 URL 獲取圖片，並作為 Blob 附加到 formData
    fetch(`${config.serverUrl}:${config.port}/epaper/${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`)
      .then(response => response.blob())
      .then(blob => {
        formData.append('FullScreenImage', blob, `${medicalInfo.HNURSTAT}-${medicalInfo.HBEDNO}-${medicalInfo.EPD_SIZE}.png`);

        // 發送 POST 請求
        return axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      })
      .then(response => {
        if (response.data.result === 'Y')
          alert("更新成功！");
        else
          alert("更新失敗！");
        
        console.log(response.data);
      })
      .catch(error => {
        console.error("Axios error: ", error);
      });
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center" style={{ fontSize: '80px', color: 'gray' }}>病歷號查詢</h1>
      <div className="mb-3" style={{ textAlign: 'center' }}>
        <label htmlFor="hhisnum" className="form-label" style={{ fontSize: '40px' }}>請輸入病歷號:</label>
        <input
          style={{ fontSize: '30px' }}
          type="text"
          id="hhisnum"
          className="form-control"
          value={hhisnum}
          placeholder="例如: 001528881A"
          onChange={(e) => setHhisnum(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-center">
        <button type="button" className="btn btn-warning ms-2" style={{ fontSize: '50px' }} onClick={handleScreenshot}>下載圖片</button>
        <button type="button" className="btn btn-secondary ms-2" style={{ fontSize: '50px' }} onClick={handleUpload}>更新URL</button>
        <button type="button" className="btn btn-primary ms-2" style={{ fontSize: '50px' }} onClick={handleUploadEPD}>上傳EPD</button>
      </div>

    </div>
  );
};

export default PatientCard;
