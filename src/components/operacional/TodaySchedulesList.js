import React, { useState, useEffect } from 'react';
import { getAgendamentos } from '../../services/api';
import { formatarData, timestampToDate } from '../../utils/nfUtils';

const TodaySchedulesList = ({ refresh }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchAgendamentos();
  }, [refresh]);
  
  const fetchAgendamentos = async () => {
    setLoading(true);
    
    try {
      // Busca agendamentos com status "agendado"
      const response = await getAgendamentos({ status: 'agendado' });
      
      // Filtra os agendamentos do dia atual
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // início do dia
      
      const agendamentosHoje = response.filter(a => {
        if (a.ePrevisao) return false;
        
        const dataAgendamento = timestampToDate(a.data);
        
        if (!dataAgendamento) return false;
        
        // Compara apenas ano, mês e dia
        return dataAgendamento.getDate() === hoje.getDate() &&
               dataAgendamento.getMonth() === hoje.getMonth() &&
               dataAgendamento.getFullYear() === hoje.getFullYear();
      });
      
      setAgendamentos(agendamentosHoje);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <p>Carregando...</p>;
  }
  
  return (
    <div className="today-schedules-list" style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <h3>Agendamentos para Hoje</h3>
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento para hoje</p>
      ) : (
        <div className="agendamentos-container" style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          minHeight: 0
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #ddd',
            fontWeight: 'bold'
          }}>
            <div>NF</div>
            <div>Cliente</div>
            <div>Volumes</div>
          </div>
          {agendamentos.map((item, index) => (
            <div 
              key={item.id} 
              style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
                gap: '10px',
                padding: '10px',
                backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                borderRadius: '4px',
                marginBottom: '10px',
                alignItems: 'center',
                border: '1px solid #e0e0e0'
              }}
            >
              <div>NF: {item.numeroNF}</div>
              <div>{item.cliente.nome}</div>
              <div>VOL: {item.volumes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaySchedulesList;