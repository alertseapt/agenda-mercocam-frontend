import React from 'react';
import { formatarData } from '../../utils/nfUtils';
import './SchedulesList.css';

const SchedulesList = ({ agendamentos, loading, onRowClick }) => {
  console.log('SchedulesList: Recebendo agendamentos:', agendamentos);
  console.log('SchedulesList: Loading status:', loading);
  console.log('SchedulesList: Número de agendamentos:', agendamentos?.length || 0);
  
  if (loading) {
    console.log('SchedulesList: Mostrando loading...');
    return (
      <div className="schedules-loading">
        <div className="loading-spinner"></div>
        <p>Carregando agendamentos...</p>
      </div>
    );
  }
  
  if (agendamentos.length === 0) {
    console.log('SchedulesList: Mostrando mensagem de nenhum agendamento...');
    return (
      <div className="schedules-empty">
        <p>Nenhum agendamento encontrado</p>
      </div>
    );
  }

  const getDataRecebimento = (historico) => {
    if (!historico) return '-';
    const recebido = historico.find(h => h.status === 'recebido');
    return recebido ? formatarData(recebido.timestamp) : '-';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'agendado': '#3498db',
      'recebido': '#f39c12',
      'informado': '#9b59b6',
      'em tratativa': '#e67e22',
      'a paletizar': '#d35400',
      'paletizado': '#27ae60',
      'fechado': '#16a085'
    };
    return statusColors[status] || '#666';
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <div className="schedules-list-container">
      <div className="schedules-table-wrapper">
        <table className="schedules-table">
          <thead>
            <tr>
              <th>Número NF</th>
              <th>Cliente</th>
              <th>Data Agendamento</th>
              <th>Data Recebimento</th>
              <th>Volumes</th>
              <th>Status</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map(item => (
              <tr 
                key={item.id} 
                className={`schedule-row status-${item.status.replace(/\s+/g, '-')}`}
                onClick={() => onRowClick(item)}
              >
                <td className="nf-cell">
                  <span className="nf-number">{item.numeroNF || '-'}</span>
                  {item.chaveAcesso && (
                    <span className="nf-key">{item.chaveAcesso.substring(0, 8)}...</span>
                  )}
                </td>
                <td className="cliente-cell">
                  <div className="cliente-info">
                    <span className="cliente-nome">{item.cliente ? item.cliente.nome : '-'}</span>
                    {item.cliente && item.cliente.cnpj && (
                      <span className="cliente-cnpj">{item.cliente.cnpj}</span>
                    )}
                  </div>
                </td>
                <td className="data-cell">
                  {item.ePrevisao 
                    ? <span className="previsao-badge">Previsão</span>
                    : formatarData(item.data)
                  }
                </td>
                <td className="recebimento-cell">
                  {getDataRecebimento(item.historicoStatus)}
                </td>
                <td className="volumes-cell">
                  <span className="volumes-number">{item.volumes || 0}</span>
                </td>
                <td className="status-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>
                <td className="observacoes-cell">
                  {item.observacoes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulesList;