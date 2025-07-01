import React, { useState } from 'react';
import ScheduleCreationModal from '../components/administrativo/ScheduleCreationModal';
import ProcessingInvoicesList from '../components/administrativo/ProcessingInvoicesList';
import FilterControls from '../components/administrativo/FilterControls';
import './AdministrativoPage.css';

const AdministrativoPage = ({ onUpdateStatusBar }) => {
  const [refresh, setRefresh] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAgendamentos, setSelectedAgendamentos] = useState([]);
  const [updateStatusFunction, setUpdateStatusFunction] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [filters, setFilters] = useState(null);
  const [clearSelectionFunction, setClearSelectionFunction] = useState(null);
  
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
    
    // Atualizar StatusBar
    if (onUpdateStatusBar) {
      onUpdateStatusBar({
        selectedItems: items,
        selectedAgendamentos: agendamentos || [],
        onCreateSchedule: handleCreateSchedule,
        isCreatingSchedule: isCreatingSchedule
      });
    }
  };

  const handleUpdateStatusRef = (updateFunction) => {
    setUpdateStatusFunction(() => updateFunction);
    
    // Atualizar StatusBar com função de atualização
    if (onUpdateStatusBar) {
      onUpdateStatusBar({
        onStatusUpdate: async (status) => {
          if (updateFunction && !isUpdatingStatus) {
            try {
              setIsUpdatingStatus(true);
              if (onUpdateStatusBar) {
                onUpdateStatusBar({ isUpdatingStatus: true });
              }
              await updateFunction(status);
            } catch (error) {
              console.error('Erro ao atualizar status:', error);
            } finally {
              setIsUpdatingStatus(false);
              if (onUpdateStatusBar) {
                onUpdateStatusBar({ isUpdatingStatus: false });
              }
            }
          }
        },
        onCreateSchedule: handleCreateSchedule,
        isCreatingSchedule: isCreatingSchedule
      });
    }
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

  const handleFilter = (filtros) => {
    console.log('AdministrativoPage: Novos filtros recebidos:', filtros);
    setFilters(filtros);
  };

  const handleClearSelection = () => {
    if (clearSelectionFunction) {
      clearSelectionFunction();
    }
  };

  const handleClearSelectionRef = (clearFunction) => {
    setClearSelectionFunction(() => clearFunction);
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
      <ScheduleCreationModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onRefresh={handleRefresh}
      />

      <FilterControls 
        onFilter={handleFilter} 
        onClearSelection={handleClearSelection}
        selectedCount={selectedItems.length}
      />
      
      <ProcessingInvoicesList 
        refresh={refresh} 
        onRefresh={handleRefresh}
        onSelectionChange={handleSelectionChange}
        onUpdateStatus={handleUpdateStatusRef}
        filters={filters}
        onClearSelectionRef={handleClearSelectionRef}
      />
    </div>
  );
};

export default AdministrativoPage;