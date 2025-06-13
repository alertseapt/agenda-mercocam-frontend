import React, { useState } from 'react';
import ScheduleCreationModal from '../components/administrativo/ScheduleCreationModal';
import ProcessingInvoicesList from '../components/administrativo/ProcessingInvoicesList';
import './AdministrativoPage.css';

const AdministrativoPage = () => {
  const [refresh, setRefresh] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAgendamentos, setSelectedAgendamentos] = useState([]);
  const [updateStatusFunction, setUpdateStatusFunction] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingSchedule(false);
  };

  const handleSelectionChange = (items, agendamentos) => {
    setSelectedItems(items);
    setSelectedAgendamentos(agendamentos || []);
  };

  const handleUpdateStatusRef = (updateFunction) => {
    setUpdateStatusFunction(() => updateFunction);
  };

  const handleStatusUpdate = async (status) => {
    if (updateStatusFunction && !isUpdatingStatus) {
      try {
        setIsUpdatingStatus(true);
        await updateStatusFunction(status);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleCreateSchedule = () => {
    setIsCreatingSchedule(true);
    openModal();
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
    <div className="page administrativo-page">
      <div className="action-buttons">
        <div className="buttons-group">
          <button 
            className="action-button informado"
            onClick={() => handleStatusUpdate('informado')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'Informado'
            )}
          </button>
          <button 
            className="action-button em-tratativa"
            onClick={() => handleStatusUpdate('em tratativa')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'Em Tratativa'
            )}
          </button>
          <button 
            className="action-button a-paletizar"
            onClick={() => handleStatusUpdate('a paletizar')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="loading-spinner"></span>
                Atualizando...
              </>
            ) : (
              'A Paletizar'
            )}
          </button>
          <button 
            className="action-button finalizar"
            onClick={() => handleStatusUpdate('fechado')}
            disabled={selectedItems.length === 0 || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <>
                <span className="loading-spinner"></span>
                Finalizando...
              </>
            ) : (
              'Finalizar'
            )}
          </button>
          
          {selectedItems.length > 0 && (
            <span className="selection-info">
              {getSelectedNFsDisplay()}
            </span>
          )}
        </div>
        
        <button 
          className="create-button" 
          onClick={handleCreateSchedule}
          disabled={isCreatingSchedule}
        >
          {isCreatingSchedule ? (
            <>
              <span className="loading-spinner"></span>
              Criando...
            </>
          ) : (
            'Criar Novo Agendamento'
          )}
        </button>
      </div>
      
      <ScheduleCreationModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onRefresh={handleRefresh}
      />
      
      <ProcessingInvoicesList 
        refresh={refresh} 
        onRefresh={handleRefresh}
        onSelectionChange={handleSelectionChange}
        onUpdateStatus={handleUpdateStatusRef}
      />
    </div>
  );
};

export default AdministrativoPage;