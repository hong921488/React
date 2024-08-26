import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getJWTToken } from './authService';
import config from './config.js';

const forbiddenList = ['右手', '左手', '雙手', '右腳', '左腳', '雙腳', '右耳', '左耳', '雙耳'];
const bedAng = ['60', '45', '30', '20', '平躺'];
const evdAng = ['最高', '30CM', '25CM', '20CM', '15CM', '10CM', '5CM', '0CM', '-5CM', '-10CM', '-15CM', '-20CM', '-25CM', '-30CM', '最低', '關閉'];

const MedicalInfo = ({ hcaseno }) => {
  const [medicalInfo, setMedicalInfo] = useState({
    admissionDate: '',
    department: '',
    allergy: '',
    dnr: '',
    HPATISOL: '',
    fall_yn: '',
    eat_yn: '',
    treat_yn: '',
    endotrachealTube: { type: '', days: 0 },
    urinaryCatheter: { type: '', days: 0 },
    treatment: '',
    bed: '',
    evd: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = await getJWTToken();
      if (token) {
        try {
          const response = await axios.get(`${config.dbUrl}/EbedsidecardSpring/api/getPatientData`, {
            params: { hcaseno },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = response.data;
          const dnrallCount = data.dnrallCount && data.dnrallCount.length > 0 ? data.dnrallCount[0] : {};
          const dnrCount = dnrallCount.DNR_COUNT || 0;
          const allergyCount = dnrallCount.ALLERGY_COUNT || 0;
          const dnr = dnrCount > 0 ? '有' : '無';
          const adr = allergyCount > 0 ? '有' : '無';
          const bedInfo = data.bedInfo && data.bedInfo.length > 0 ? data.bedInfo[0] : {};
          const tubeData = data.nursShiftTube || [];
          const forbiddenData = data.nurePaperConfig || {};
          // const tubeType = tubeData.BUNDLEYN;

          setMedicalInfo({
            admissionDate: formatROCDate(bedInfo.HADMDT),
            department: bedInfo.HCURSVCL || '',
            allergy: adr,
            dnr: dnr,
            HPATISOL: bedInfo.HPATISOL || '',
            fall_yn: data.fallRisk === 'Y' ? 'Y' : 'N',
            eat_yn: forbiddenData.FASTING,
            catheters: tubeData.length > 0 ? tubeData.map(tube => ({
              type: tube.BUNDLEYN || '未知導管',
              days: calculateDays(tube.ONDATE, tube.CHANGDATE)
            })) : [],
            treatment: forbiddenData.TREATMENT,
            bed: forbiddenData.BED,
            evd: forbiddenData.EVD,
            shift: forbiddenData.SHIFT,
            // ondate: tubeData.ONDATE,
            // changedate: tubeData.CHANGDATE

          });

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [hcaseno]);

  const formatROCDate = (dateStr) => {
    if (!dateStr) return '';
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const rocYear = year - 1911;
    return `${rocYear}/${month}/${day}`;
  };

  const calculateDays = (ondateStr, changedateStr) => {
    if (!ondateStr) return 0;
    const ondate = new Date(ondateStr);
    const changedate = changedateStr ? new Date(changedateStr) : null;
    const today = new Date();
    const endDate = changedate || today;
    return Math.floor((endDate - ondate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const WarningCards = ({ medicalInfo }) => {
    return (
      <>
        {medicalInfo.treatment && typeof medicalInfo.treatment === 'string' && medicalInfo.treatment.trim() !== '' && medicalInfo.treatment.split(',').map((item, index) => (
          <div key={index} className="warning-card">
            <div className="text">{forbiddenList[parseInt(item) - 1]} 禁治</div>
          </div>
        ))}

        {medicalInfo.bed && typeof medicalInfo.bed === 'string' && medicalInfo.bed.trim() !== '' && (
          <div className="warning-card">
            <div className="text">床頭 {bedAng[parseInt(medicalInfo.bed) - 1]}</div>
          </div>
        )}

        {medicalInfo.shift && typeof medicalInfo.shift === 'string' && medicalInfo.shift.trim() !== '' && (
          <div className="warning-card">
            <div className="text">{medicalInfo.shift}</div>
          </div>
        )}

        {medicalInfo.evd && typeof medicalInfo.evd === 'string' && medicalInfo.evd.trim() !== '' && (
          <div className="warning-card">
            <div className="text">EVD: {evdAng[parseInt(medicalInfo.evd) - 1]}</div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="col-12">
        <div className="row">
          <div className="col-7">
            <div className="me-5">
              <span className="custom-font">
                入院日期: <span style={{ color: 'red' }}>{medicalInfo.admissionDate}</span>
              </span>
            </div>
          </div>
          <div className="col-5">
            <div className="me-5">
              <span className="custom-font">
                科別: <span style={{ color: 'red' }}>{medicalInfo.department}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-7">
            <div className="me-5">
              <span className="custom-font">
                過敏藥物: <span style={{ color: 'black' }}>{medicalInfo.allergy}</span>
              </span>
            </div>
          </div>
          <div className="col-5">
            <div>
              <span className="custom-font">
                DNR: <span style={{ color: 'black' }}>{medicalInfo.dnr}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="line-separator" style={{ marginLeft: '-11px', marginTop: '30px', marginBottom: '20px' }}></div>

      <div className="grid-container">
        {medicalInfo.HPATISOL && medicalInfo.HPATISOL.trim() !== '' && (
          <img src={`/imgs/ISOLATE_${medicalInfo.HPATISOL}.png`} alt={`ISOLATE_${medicalInfo.HPATISOL}`} />
        )}
        <WarningCards medicalInfo={medicalInfo} />
      </div>

      <div className="line-separator" style={{ marginLeft: '-11px', marginTop: '10px', marginBottom: '30px' }}></div>

      <div className="row" style={{ marginTop: '-30px' }}>
        <div className="d-flex flex-wrap">
          <span className="custom-font col-3">導管</span>
          <span className="custom-font col-3 text-center">天數</span>
          <span className="custom-font col-3">&nbsp;導管</span>
          <span className="custom-font col-3 text-center">天數</span>
        </div>
        {medicalInfo.catheters && medicalInfo.catheters.length > 0 && (
        <div className="container-fluid"> 
          <div className="row">
            {medicalInfo.catheters.map((catheter, index) => (
              <div key={index} className="col-6 mb-2">
                <div className="d-flex align-items-center"> 
                  <div className="custom-font " style={{ flex: 1, whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {catheter.type}
                  </div>
                  <div className="text-center" style={{ flex: 1, whiteSpace: 'nowrap', textAlign: 'left' }}>
                    <div className="rounded-box">{catheter.days}</div> 
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
    </>
  );
};

export default MedicalInfo;
