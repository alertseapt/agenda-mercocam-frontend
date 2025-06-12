import React, { useState } from 'react';
import InvoiceKeyInput from '../components/operacional/InvoiceKeyInput';
import ToBePalletizedList from '../components/operacional/ToBePalletizedList';
import TodaySchedulesList from '../components/operacional/TodaySchedulesList';

const OperacionalPage = () => {
  const [refresh, setRefresh] = useState(0);
  
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };
  
  return (
    <div className="page operacional-page" style={{ 
      maxWidth: '70%', 
      margin: '0 auto',
      height: 'calc(100vh - 100px)', // 100px = navbar height (60px) + padding (40px)
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2>Operacional</h2>
      
      <InvoiceKeyInput onRefresh={handleRefresh} />
      
      <div className="lists-container" style={{ 
        display: 'flex', 
        gap: '20px',
        flex: 1,
        minHeight: 0 // Important for flex child to respect parent height
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <ToBePalletizedList refresh={refresh} onRefresh={handleRefresh} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <TodaySchedulesList refresh={refresh} />
        </div>
      </div>
    </div>
  );
};

export default OperacionalPage;