import React, { useState, useEffect, useCallback } from 'react';
import { getAgendamentos, updateAgendamentoStatus } from '../../services/api';
import { formatarData } from '../../utils/nfUtils';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import './ProcessingInvoicesList.css';

const ProcessingInvoicesList = ({ refresh, onRefresh, onSelectionChange, onUpdateStatus }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchAgendamentos();
  }, [refresh]);
  
  useEffect(() => {
    // 選択された項目が変更されたときに親コンポーネントに通知
    if (onSelectionChange) {
      // 選択されたIDに対応するアジェンダの詳細情報を取得
      const selectedAgendamentos = agendamentos.filter(agendamento => 
        selectedItems.includes(agendamento.id)
      );
      onSelectionChange(selectedItems, selectedAgendamentos);
    }
  }, [selectedItems, agendamentos]); // agendamentosも依存配列に追加
  
  // Função auxiliar para converter timestamp para Date
  const timestampToDate = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      // Formato específico com _seconds e _nanoseconds
      if (timestamp && typeof timestamp === 'object' && 
          (timestamp._seconds !== undefined || timestamp.seconds !== undefined)) {
        
        // Obter seconds do objeto, dependendo do formato
        const seconds = timestamp._seconds !== undefined ? timestamp._seconds : timestamp.seconds;
        
        // Verificar se é um timestamp futuro (válido até 31/12/2024)
        const currentYear = new Date().getFullYear();
        const maxValidTimestamp = new Date(`${currentYear+1}-01-01`).getTime() / 1000;
        
        if (seconds > maxValidTimestamp) {
          console.warn('Data futura inválida detectada:', timestamp);
          return null;
        }
        
        return new Date(seconds * 1000);
      }
      
      // Se já for uma data ou string de data
      const date = new Date(timestamp);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Formato de data inválido:', timestamp);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error('Erro ao converter timestamp:', error, timestamp);
      return null;
    }
  };
  
  // Função para verificar se uma data é válida
  const isValidDate = (date) => {
    return date && !isNaN(date.getTime());
  };
  
  const fetchAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAgendamentos();
      // フィルタリング：fechadoとagendadoを除外
      const filteredData = data.filter(item => 
        item.status !== 'fechado' && item.status !== 'agendado'
      );
      
      // 受領日で並び替え（古い順）
      const sortedData = filteredData.sort((a, b) => {
        const getReceivedTimestamp = (item) => {
          if (!item.historicoStatus || !Array.isArray(item.historicoStatus)) return null;
          const recebido = item.historicoStatus.find(h => h.status === 'recebido');
          return recebido ? recebido.timestamp : null;
        };
        
        const timestampA = getReceivedTimestamp(a);
        const timestampB = getReceivedTimestamp(b);
        
        // 受領日がない項目は最後に配置
        if (!timestampA && !timestampB) return 0;
        if (!timestampA) return 1;
        if (!timestampB) return -1;
        
        // timestampを日付に変換して比較
        const dateA = timestampToDate(timestampA);
        const dateB = timestampToDate(timestampB);
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // 古い日付が先に来るように昇順ソート
        return dateA.getTime() - dateB.getTime();
      });
      
      setAgendamentos(sortedData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []); // 依存関係なし
  
  const handleItemClick = (item) => {
    setSelectedAgendamento(item);
  };
  
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  const handleUpdateStatus = useCallback(async (status) => {
    try {
      for (const id of selectedItems) {
      await updateAgendamentoStatus(id, status);
      }
      await fetchAgendamentos();
      setSelectedItems([]);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }, [selectedItems, fetchAgendamentos]);
  
  // 親コンポーネントから呼び出される関数
  useEffect(() => {
    if (onUpdateStatus) {
      onUpdateStatus(handleUpdateStatus);
    }
  }, [handleUpdateStatus, onUpdateStatus]);
  
  const handleCloseDetails = () => {
    setSelectedAgendamento(null);
  };
  
  const getDataRecebimento = (historicoStatus) => {
    if (!historicoStatus || !Array.isArray(historicoStatus)) return '-';
    
    const recebido = historicoStatus.find(h => h.status === 'recebido');
    if (!recebido) return '-';
    
    return formatarData(recebido.timestamp);
  };

  // Verifica se a NF deve ficar destacada em vermelho
  const isNFHighlighted = (item) => {
    // Verifica se não tem volume ou volume é zero
    const semVolume = !item.volumes || item.volumes === 0;
    
    // Verifica se não tem chave de acesso
    const semChaveAcesso = !item.chaveAcesso || item.chaveAcesso.trim() === '';
    
    return semVolume || semChaveAcesso;
  };
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="processing-invoices-container">
      {agendamentos.length === 0 ? (
        <p>Nenhuma nota em processamento</p>
      ) : (
        <ul className="agendamentos-list">
          {agendamentos.map(item => (
            <li 
              key={item.id} 
              className={`agendamento-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
              data-status={item.status}
            >
              <div className="item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleItemSelect(item.id)}
                />
              </div>
              <div className="item-content" onClick={() => handleItemClick(item)}>
                <div className="item-info">
                  <span className="nf-number">NF: {item.numeroNF || 'Sem NF'}</span>
                  <span className="cliente">{item.cliente?.nome || 'Sem cliente'}</span>
                  <span className="volumes">Volumes: {item.volumes}</span>
                  <span className="data-recebimento">Recebido: {getDataRecebimento(item.historicoStatus)}</span>
                </div>
                <div className="item-status">
                  <span className="status">{item.status}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {selectedAgendamento && (
        <InvoiceDetailsModal
          agendamento={selectedAgendamento}
          onClose={handleCloseDetails}
          onRefresh={fetchAgendamentos}
        />
      )}
    </div>
  );
};

export default ProcessingInvoicesList;