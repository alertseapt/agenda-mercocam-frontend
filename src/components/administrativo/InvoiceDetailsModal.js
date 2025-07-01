import React, { useState, useEffect } from 'react';
import { formatarData, formatarDataHora } from '../../utils/nfUtils';
import { updateAgendamento, deleteAgendamento, getClientes, updateAgendamentoStatus } from '../../services/api';
import PasswordModal from './PasswordModal';
import './InvoiceDetailsModal.css';

const InvoiceDetailsModal = ({ agendamento, onClose, onRefresh, showStatusChange = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    numeroNF: agendamento?.numeroNF || '',
    chaveAcesso: agendamento?.chaveAcesso || '',
    volumes: agendamento?.volumes || 0,
    observacoes: agendamento?.observacoes || '',
    clienteId: agendamento?.clienteId || '',
    data: agendamento?.data || null,
    ePrevisao: agendamento?.ePrevisao || false,
    historicoStatus: agendamento?.historicoStatus || []
  });
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [clientes, setClientes] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  useEffect(() => {
    if (isEditing) {
      fetchClientes();
    }
  }, [isEditing]);

  const fetchClientes = async () => {
    try {
      const clientesList = await getClientes();
      clientesList.sort((a, b) => a.nome.localeCompare(b.nome));
      setClientes(clientesList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };
  
  if (!agendamento) return null;
  
  // Função para lidar com o evento de clique no overlay
  const handleOverlayClick = (e) => {
    // Verifica se o clique foi diretamente no overlay e não em seus filhos
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Converter volumes para número
    if (name === 'volumes') {
      setEditedData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else if (type === 'checkbox') {
      setEditedData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'data') {
      // Tratar especificamente a data
      setEditedData(prev => ({
        ...prev,
        [name]: value || null
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleHistoricoChange = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      historicoStatus: prev.historicoStatus.map((item, i) => 
        i === index ? { ...item, [field]: field === 'timestamp' ? (value || new Date().toISOString()) : value } : item
      )
    }));
  };

  const addHistoricoItem = () => {
    setEditedData(prev => ({
      ...prev,
      historicoStatus: [...prev.historicoStatus, { status: '', timestamp: new Date().toISOString() }]
    }));
  };

  const removeHistoricoItem = (index) => {
    setEditedData(prev => ({
      ...prev,
      historicoStatus: prev.historicoStatus.filter((_, i) => i !== index)
    }));
  };

  // Função para converter data ISO para formato de input datetime-local
  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error);
      return '';
    }
  };

  // Função para converter data ISO para formato de input date
  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 10);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };
  
  const handleSaveChanges = async () => {
    setSaving(true);
    setMensagem('');
    
    try {
      await updateAgendamento(agendamento.id, editedData);
      setMensagem('Informações atualizadas com sucesso!');
      setIsEditing(false);
      
      // Notifica o componente pai para atualizar a lista
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      setMensagem('Erro ao atualizar informações');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      try {
        await deleteAgendamento(agendamento.id);
        onRefresh();
        onClose();
      } catch (error) {
        console.error('Erro ao excluir nota fiscal:', error);
        alert('Erro ao excluir nota fiscal');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setMensagem('');
    
    try {
      await updateAgendamentoStatus(agendamento.id, newStatus);
      setMensagem(`Status alterado para "${newStatus}" com sucesso!`);
      
      // Notifica o componente pai para atualizar a lista
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setMensagem('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = () => {
    setIsEditing(true);
    setShowPasswordModal(false);
  };

  console.log("Renderizando modal para agendamento:", agendamento.id);
  
  return (
    <div className="invoice-modal-overlay" onClick={handleOverlayClick}>
      <div className="invoice-modal-content">
        <div className="invoice-modal-header">
          <h3 className="invoice-modal-title">Detalhes da Nota Fiscal</h3>
          <div className="invoice-modal-actions-header">
            {!isEditing ? (
              <button 
                className="invoice-edit-button" 
                onClick={handleEditClick}
              >
                Editar
              </button>
            ) : (
              <>
                <button 
                  className="invoice-cancel-edit-button" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData({
                      numeroNF: agendamento.numeroNF || '',
                      chaveAcesso: agendamento.chaveAcesso || '',
                      volumes: agendamento.volumes || 0,
                      observacoes: agendamento.observacoes || '',
                      clienteId: agendamento.clienteId || '',
                      data: agendamento.data || null,
                      ePrevisao: agendamento.ePrevisao || false,
                      historicoStatus: agendamento.historicoStatus || []
                    });
                    setMensagem('');
                  }}
                >
                  Cancelar Edição
                </button>
                <button 
                  className="invoice-delete-button" 
                  onClick={handleDelete}
                >
                  Excluir
                </button>
              </>
            )}
            <button className="invoice-close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="invoice-modal-body">
          {isEditing ? (
            <div className="invoice-edit-form">
              <div className="invoice-form-group">
                <label className="invoice-form-label">Número da NF:</label>
                <input
                  type="text"
                  name="numeroNF"
                  value={editedData.numeroNF}
                  onChange={handleInputChange}
                  className="invoice-form-input"
                />
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-form-label">Chave de Acesso:</label>
                <input
                  type="text"
                  name="chaveAcesso"
                  value={editedData.chaveAcesso}
                  onChange={handleInputChange}
                  placeholder="Informe a chave de acesso"
                  className="invoice-form-input"
                />
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">Cliente:</label>
                <select
                  name="clienteId"
                  value={editedData.clienteId}
                  onChange={handleInputChange}
                  className="invoice-form-select"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-form-label">Volumes:</label>
                <input
                  type="number"
                  name="volumes"
                  value={editedData.volumes}
                  onChange={handleInputChange}
                  min="0"
                  className="invoice-form-input"
                />
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-form-label">Observações:</label>
                <textarea
                  name="observacoes"
                  value={editedData.observacoes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Observações adicionais"
                  className="invoice-form-textarea"
                />
              </div>

              <div className="invoice-form-group">
                <label className="invoice-form-label">
                  <input
                    type="checkbox"
                    name="ePrevisao"
                    checked={editedData.ePrevisao}
                    onChange={handleInputChange}
                    style={{ marginRight: '8px' }}
                  />
                  É Previsão (sem data específica)
                </label>
              </div>

              {!editedData.ePrevisao && (
                <div className="invoice-form-group">
                  <label className="invoice-form-label">Data do Agendamento:</label>
                  <input
                    type="date"
                    name="data"
                    value={formatDateForInput(editedData.data) || ''}
                    onChange={handleInputChange}
                    className="invoice-form-input"
                  />
                </div>
              )}
              
              <button 
                className="invoice-save-button" 
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="invoice-loading-spinner"></span>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
              
              {mensagem && (
                <p className={`invoice-message ${mensagem.includes('sucesso') ? 'success' : 'error'}`}>
                  {mensagem}
                </p>
              )}

              {/* Seção de edição do histórico */}
              <div className="invoice-historico">
                <h4 className="invoice-historico-title">Editar Histórico de Status</h4>
                {editedData.historicoStatus.map((item, index) => (
                  <div key={index} className="invoice-historico-edit-item">
                    <div className="invoice-form-group">
                      <label className="invoice-form-label">Status:</label>
                      <input
                        type="text"
                        value={item.status}
                        onChange={(e) => handleHistoricoChange(index, 'status', e.target.value)}
                        className="invoice-form-input"
                        placeholder="Status"
                      />
                    </div>
                    <div className="invoice-form-group">
                      <label className="invoice-form-label">Data e Hora:</label>
                      <input
                        type="datetime-local"
                        value={formatDateTimeForInput(item.timestamp) || ''}
                        onChange={(e) => handleHistoricoChange(index, 'timestamp', e.target.value)}
                        className="invoice-form-input"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeHistoricoItem(index)}
                      className="invoice-delete-button"
                      style={{ marginTop: '10px' }}
                    >
                      Remover Item
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addHistoricoItem}
                  className="invoice-edit-button"
                  style={{ marginTop: '15px' }}
                >
                  Adicionar Item ao Histórico
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Número da NF:</span>
                <span className={`invoice-detail-value ${!agendamento.numeroNF ? 'empty' : ''}`}>
                  {agendamento.numeroNF || 'Não informado'}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Chave de Acesso:</span>
                <span className={`invoice-detail-value ${!agendamento.chaveAcesso ? 'empty' : ''}`}>
                  {agendamento.chaveAcesso || 'Não informado'}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Cliente:</span>
                <span className={`invoice-detail-value ${!agendamento.cliente?.nome ? 'empty' : ''}`}>
                  {agendamento.cliente?.nome || 'Não informado'}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">CNPJ:</span>
                <span className={`invoice-detail-value ${!agendamento.cliente?.cnpj ? 'empty' : ''}`}>
                  {agendamento.cliente?.cnpj || 'Não informado'}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Status:</span>
                <span className="invoice-detail-value">{agendamento.status}</span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Volumes:</span>
                <span className="invoice-detail-value">
                  {agendamento.volumes !== undefined ? agendamento.volumes : 'Não informado'}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Data:</span>
                <span className="invoice-detail-value">
                  {agendamento.ePrevisao 
                    ? 'Previsão (sem data específica)' 
                    : formatarData(agendamento.data)}
                </span>
              </div>
              
              <div className="invoice-detail-row">
                <span className="invoice-detail-label">Observações:</span>
                <span className={`invoice-detail-value ${!agendamento.observacoes ? 'empty' : ''}`}>
                  {agendamento.observacoes || 'Nenhuma observação'}
                </span>
              </div>
              
              {showStatusChange && !isEditing && (
                <div className="invoice-status-change-section">
                  <h4 className="invoice-status-title">Alterar Status</h4>
                  <div className="invoice-status-buttons">
                    <button 
                      className="invoice-status-button recebido"
                      onClick={() => handleStatusChange('recebido')}
                      disabled={updatingStatus || agendamento.status === 'recebido'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Atualizando...
                        </>
                      ) : (
                        'Recebido'
                      )}
                    </button>
                    <button 
                      className="invoice-status-button informado"
                      onClick={() => handleStatusChange('informado')}
                      disabled={updatingStatus || agendamento.status === 'informado'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Atualizando...
                        </>
                      ) : (
                        'Informado'
                      )}
                    </button>
                    <button 
                      className="invoice-status-button em-tratativa"
                      onClick={() => handleStatusChange('em tratativa')}
                      disabled={updatingStatus || agendamento.status === 'em tratativa'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Atualizando...
                        </>
                      ) : (
                        'Em Tratativa'
                      )}
                    </button>
                    <button 
                      className="invoice-status-button a-paletizar"
                      onClick={() => handleStatusChange('a paletizar')}
                      disabled={updatingStatus || agendamento.status === 'a paletizar'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Atualizando...
                        </>
                      ) : (
                        'A Paletizar'
                      )}
                    </button>
                    <button 
                      className="invoice-status-button paletizado"
                      onClick={() => handleStatusChange('paletizado')}
                      disabled={updatingStatus || agendamento.status === 'paletizado'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Atualizando...
                        </>
                      ) : (
                        'Paletizado'
                      )}
                    </button>
                    <button 
                      className="invoice-status-button fechado"
                      onClick={() => handleStatusChange('fechado')}
                      disabled={updatingStatus || agendamento.status === 'fechado'}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="invoice-loading-spinner"></span>
                          Finalizando...
                        </>
                      ) : (
                        'Finalizar'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="invoice-historico">
            <h4 className="invoice-historico-title">Histórico de Status</h4>
            {agendamento.historicoStatus && agendamento.historicoStatus.length > 0 ? (
              <ul className="invoice-historico-list">
                {agendamento.historicoStatus.map((item, index) => (
                  <li key={index} className="invoice-historico-item">
                    <span className="invoice-historico-status">{item.status}</span>
                    <span className="invoice-historico-date">{formatarDataHora(item.timestamp)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="invoice-historico-empty">Nenhum histórico disponível</p>
            )}
          </div>
        </div>
      </div>
      
      {showPasswordModal && (
        <PasswordModal
          onConfirm={handlePasswordConfirm}
          onCancel={() => setShowPasswordModal(false)}
          title="Digite a senha para editar"
        />
      )}
    </div>
  );
};

export default InvoiceDetailsModal;