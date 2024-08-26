import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PatientInfo from './PatientInfo';
import MedicalInfo from './MedicalInfo';
import CareTeam from './CareTeam';
import PatientCard from './PatientCard';

const App = () => {

  
  const [hhisnum, setHhisnum] = useState('001528881A');
  const [hcaseno, setHcaseno] = useState('');

  return (
    <div>
      <PatientCard  hhisnum={hhisnum} setHhisnum={setHhisnum} setHcaseno={setHcaseno}/><br/>
      <div className="paper" >
        <div className="row" style={{ marginLeft: '10px' }}>
          <div className="col-9">
            <PatientInfo hcaseno={hcaseno} />
            <MedicalInfo hcaseno={hcaseno} />
          </div>
          <div className="col-3">
            <CareTeam hcaseno={hcaseno}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;