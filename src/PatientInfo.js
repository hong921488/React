import React, { useState, useEffect } from 'react';
import QrCodeGenerator from './QrCodeGenerator';
import axios from 'axios';
import { getJWTToken } from './authService';
import config from './config.js';



const PatientInfo = ({hcaseno}) => {
  const [patientInfo, setPatientInfo] = useState({
    HSEX:'',
    HNAMEC: '',
    hbldtype: '',
    age: '',
    language: '',
    tot_sc: '0'
  });



  useEffect(() => {
    const fetchData = async () => {
      const token = await getJWTToken();
      if (token) {
        try {
          const response = await axios.get(`${config.dbUrl}/EbedsidecardSpring/api/getPatientData`, {
            params: {hcaseno},
            headers: {
              Authorization: `Bearer ${token}`
            },
          });

          const data = response.data;

          // 設置日期和星期
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const date = `${year}/${month}/${day}`;

          const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
          const dayOfWeek = `週${weekdays[today.getDay()]}`;

          // 處理語言數據
          const languages = data.nursingNoteData;
          const languageValue = languages.CHINESE === 'Y'
            ? '中文'
            : languages.TAIWANESE === 'Y'
              ? '台語'
              : languages.HAKKA === 'Y'
                ? '客語'
                : languages.OTHERLANGUAGE === 'Y'
                  ? '其他'
                  : '未設';

          // 設置患者信息
          const patientData = data.bedInfo.length > 0 ? data.bedInfo[0] : {};
          const patientName = data.nursShiftTube.length > 0 ? data.nursShiftTube[0] : {};
          const ewsScore = data.ewsScore.length > 0 ? data.ewsScore[0].TOT_SC.toString() : '';

          setPatientInfo({
            HSEX: patientData.HSEX || 'M',
            HNAMEC: patientName.HNAMEC || '空床',
            hbldtype: patientData.HBLDTYPE || '',
            age: patientData.AGE || '',
            language: languageValue || '',
            tot_sc: ewsScore || '0',
            date: date || '',
            day: dayOfWeek || '',
            HNURSTAT: patientData.HNURSTAT || '',
            HBEDNO: patientData.HBEDNO || ''
          });

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [hcaseno]);


  const formatHNAMEC = (name) => {
    if(name === '空床') {
      return name;
    }else if (name.length <= 2) {
      return name[0] + '〇';
    } else if (name.length <= 4) {
      return name.slice(0, -2) + '〇' + name[name.length - 1];
    } else {
      return name.slice(0, -4) + '〇' + name.slice(-3);
    }
  };

  return (
    <>
      <div className="row" style={{marginTop:'10px'}}>
        <div className="col-6">
          <h1 className="custom-font" style={{ fontSize: '110px', display: 'flex', alignItems: 'center' }}>
          <img src={`/imgs/${patientInfo.tot_sc}C.png`} alt='' style={{ width: '150px', height: '150px' }} />
            {patientInfo.HNURSTAT}-{patientInfo.HBEDNO}
          </h1>
        </div>
        <div className="col-3">
          <div className="me-5">
            <span className="custom-font" style={{marginLeft:'50px'}}>{patientInfo.date}</span>
          </div>
          <div className="me-5">
            <span className="custom-font" style={{marginLeft:'50px'}}>{patientInfo.day}</span>
          </div>
        </div>
        <div className="col-2" style={{ display: 'flex', alignItems: 'center', width: '150px', height: '150px', marginLeft: '130px'} }>
          <QrCodeGenerator value="12345"  />
          </div>
      </div>

      
      <div className="line-separator" style={{marginLeft:'-11px',marginBottom:'10px',marginTop:'10px'}}></div>
      

      <div className="row" style={{height:'250px'}}>
        <div className="col-9">
          <h2 className="custom-font" style={{ fontSize: '180px' }}>
            <img src={`${patientInfo.HSEX==='F'?'/imgs/female.png':'/imgs/male.png' }`} alt="male" style={{ width: '70px', height: '150px',marginTop:'-30px' }} />
            <span>{patientInfo.HNAMEC !== '' ? formatHNAMEC(patientInfo.HNAMEC) : '空床'}</span>
          </h2>
        </div>
        <div className="col-3" >
          <div className="me-5" style={{ marginLeft: '-47px' }}>
            <span className="custom-font" >血型: <span style={{ color: 'red'}}>{patientInfo.hbldtype}</span></span>

          </div>
          <div className="me-5"style={{ marginLeft: '-47px' }}>
            <span className="custom-font"  >年齡: <span style={{ color: 'red' }}>{patientInfo.age}</span></span>
          </div>
          <div style={{ marginLeft: '-47px' }}>
            <span className="custom-font"  >語言: <span style={{ color: 'red' }}>{patientInfo.language}</span></span>
          </div>
        </div>
      </div>

      <div className="line-separator" style={{marginLeft:'-11px',marginTop:'10px',marginBottom:'30px'}}></div>
      
    </>
  );
};

export default PatientInfo;

