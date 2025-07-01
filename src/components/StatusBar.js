import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './StatusBar.css';

const StatusBar = ({ 
  selectedItems = [], 
  selectedAgendamentos = [], 
  onStatusUpdate, 
  isUpdatingStatus = false,
  onCreateSchedule,
  isCreatingSchedule = false
}) => {
  const { ambiente } = useAuth();

  // 管理環境でのみ表示
  if (ambiente !== 'administrativo') {
    return null;
  }

  const handleStatusUpdate = (status) => {
    if (onStatusUpdate && !isUpdatingStatus) {
      onStatusUpdate(status);
    }
  };

  // 選択されたNF番号を表示するための関数
  const getSelectedNFsDisplay = () => {
    if (selectedAgendamentos.length === 0) return '';
    
    const nfNumbers = selectedAgendamentos
      .map(agendamento => agendamento.numeroNF || 'Sem NF')
      .filter(nf => nf !== 'Sem NF'); // 'Sem NF'を除外
    
    if (nfNumbers.length === 0) {
      return `${selectedAgendamentos.length} nota(s) sem número`;
    } else if (nfNumbers.length === 1) {
      return `NF ${nfNumbers[0]}`;
    } else {
      return `NFs ${nfNumbers.join(', ')}`;
    }
  };

  return (
    <div className="status-bar">
      <div className="status-bar-content">
        {/* Status change buttons on the left */}
        <div className="status-buttons-group">
          <button 
            className="status-action-button informado"
            onClick={() => handleStatusUpdate('informado')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="status-loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'Informado'
            )}
          </button>
          <button 
            className="status-action-button em-tratativa"
            onClick={() => handleStatusUpdate('em tratativa')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="status-loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'Em Tratativa'
            )}
          </button>
          <button 
            className="status-action-button a-paletizar"
            onClick={() => handleStatusUpdate('a paletizar')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="status-loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'A Paletizar'
            )}
          </button>
          <button 
            className="status-action-button finalizar"
            onClick={() => handleStatusUpdate('fechado')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="status-loading-spinner"></span>
                Finalizando...
              </>
            ) : (
              'Finalizar'
            )}
          </button>
        </div>

        {/* Middle section for selection info */}
        {selectedItems.length > 0 && (
          <div className="selection-info">
            <span className="selection-count">{selectedItems.length} selecionado(s)</span>
            <span className="selection-details">{getSelectedNFsDisplay()}</span>
          </div>
        )}

        {/* Create schedule button on the right */}
        <div className="create-button-group">
          <button 
            className="status-action-button create-schedule"
            onClick={onCreateSchedule}
            disabled={isCreatingSchedule}
          >
            {isCreatingSchedule ? (
              <>
                <span className="status-loading-spinner"></span>
                Criando...
              </>
            ) : (
              'Criar Agendamento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusBar; 