import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getJWTToken } from './authService';
import config from './config.js';

const CareTeam = ({ hcaseno }) => {
  const [careTeam, setCareTeam] = useState({
    attendingPhysician: '',
    residentPhysician: '',
    npNurse: '',
    primaryNurse: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getJWTToken();
        const responsePatientData = await axios.get(`${config.dbUrl}/EbedsidecardSpring/api/getPatientData`, {
          params: { hcaseno },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const patientData = responsePatientData.data;
        const doctor = patientData.bedInfo && patientData.bedInfo.length > 0 ? patientData.bedInfo[0] : {};
        const npnurse = patientData.patAdmDoctor  || {};
        const nurse = patientData.nursClassDetail && patientData.nursClassDetail.length > 0 ? patientData.nursClassDetail[0] : {};
        // if(!hbedno) {
        //   setCareTeam({
        //   attendingPhysician: '',
        //   residentPhysician: '',
        //   npNurse: '',
        //   primaryNurse: ''
        //   });
        //   return;
        // }
        // const responseNursClassDetail = await axios.get('http://localhost:8080/EbedsidecardSpring/api/getNursClass', {
        //   params: { hbedno },
        //   headers: {
        //     Authorization: Bearer ${token}
        //   }
        // });
        
        // const nursClassDetail = responseNursClassDetail.data;
        // const nurse = nursClassDetail && nursClassDetail.length > 0 ? nursClassDetail[0] : {};
        
        setCareTeam({
          attendingPhysician: doctor.HVDOCNM || '',
          residentPhysician: doctor.HRDOCNM || '',
          npNurse: npnurse.HGDOCNM || '',
          primaryNurse: nurse.NAMEC || ''
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [hcaseno]);

  return (
    <>
      <div className="custom-1 row">
        <h2 className="name-font text-center">照護團隊</h2>
      </div>
      <div className="custom-2 row">
        <h3 className="custom-font text-center">主治醫師</h3>
        <p className="name-font text-center">{careTeam.attendingPhysician}</p>
      </div>
      <div className="custom-3 row">
        <h3 className="custom-font text-center">住院醫師</h3>
        <p className="name-font text-center">{careTeam.residentPhysician}</p>
      </div>
      <div className="custom-4 row">
        <h3 className="custom-font text-center">專科護理師</h3>
        <p className="name-font text-center">{careTeam.npNurse}</p>
      </div>
      <div className="custom-5 row">
        <h3 className="custom-font text-center">主責護理師</h3>
        <p className="name-font text-center">{careTeam.primaryNurse}</p>
      </div>
    </>
  );
};

export default CareTeam;