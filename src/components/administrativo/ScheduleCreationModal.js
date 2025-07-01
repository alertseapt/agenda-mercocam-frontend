import React, { useState, useEffect, useRef } from 'react';
import { getClientes, createAgendamento, updateAgendamentoStatus } from '../../services/api';
import { extrairNumeroNF } from '../../utils/nfUtils';
import '../administrativo/InvoiceDetailsModal.css';

const ScheduleCreationModal = ({ isOpen, onClose, onRefresh }) => {
  const [input, setInput] = useState('');
  const [volumes, setVolumes] = useState('');
  const [data, setData] = useState('');
  const [ePrevisao, setEPrevisao] = useState(false);
  const [marcarRecebido, setMarcarRecebido] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  
  // Refs
  const inputRef = useRef(null);
  const clienteSearchRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  useEffect(() => {
    // Define a data atual como valor padrão
    const hoje = new Date().toISOString().split('T')[0];
    setData(hoje);
    
    // Carrega a lista de clientes
    fetchClientes();
    
    // Foca no input quando o modal abre
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Adicionar event listener para fechar sugestões ao clicar fora
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // Filtrar clientes quando o termo de busca muda
  useEffect(() => {
    if (clienteSearch.trim() === '') {
      setFilteredClientes([]);
      setShowSuggestions(false);
      return;
    }
    
    const lowerCaseSearch = clienteSearch.toLowerCase();
    const filtered = clientes
      .filter(cliente => 
        cliente.nome.toLowerCase().includes(lowerCaseSearch) ||
        cliente.cnpj.replace(/[^\d]/g, '').includes(lowerCaseSearch.replace(/[^\d]/g, ''))
      )
      .sort((a, b) => {
        // Priorizar matches que começam com o termo de busca
        const aStartsWithName = a.nome.toLowerCase().startsWith(lowerCaseSearch);
        const bStartsWithName = b.nome.toLowerCase().startsWith(lowerCaseSearch);
        
        if (aStartsWithName && !bStartsWithName) return -1;
        if (!aStartsWithName && bStartsWithName) return 1;
        
        return a.nome.localeCompare(b.nome);
      })
      .slice(0, 8); // Limitar a 8 resultados
    
    setFilteredClientes(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [clienteSearch, clientes]);
  
  const handleClickOutside = (event) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        clienteSearchRef.current && !clienteSearchRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };
  
  const fetchClientes = async () => {
    try {
      const clientesList = await getClientes();
      setClientes(clientesList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };
  
  const handleSelectCliente = (cliente) => {
    setClienteSearch(cliente.nome);
    setClienteId(cliente.id);
    setShowSuggestions(false);
    setFilteredClientes([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteId) {
      setMensagem('Cliente é obrigatório');
      return;
    }
    
    if (!ePrevisao && !data) {
      setMensagem('Data é obrigatória quando não é previsão');
      return;
    }
    
    setLoading(true);
    setMensagem('');
    
    try {
      // Processa o número da NF ou chave de acesso
      const numeroNF = extrairNumeroNF(input);
      const chaveAcesso = input.length === 44 ? input : '';
      
      const novoAgendamento = {
        numeroNF,
        chaveAcesso,
        data: ePrevisao ? null : (() => {
          // Converte a string de data para um objeto Date com hora zerada
          const [ano, mes, dia] = data.split('-').map(Number);
          // Cria uma data com o fuso horário local, às 12:00 (meio-dia)
          // Isso evita problemas de mudança de dia devido ao fuso horário
          return new Date(ano, mes - 1, dia, 12, 0, 0);
        })(),
        ePrevisao,
        volumes: Number(volumes) || 0,
        clienteId,
        observacoes
      };
      
      const response = await createAgendamento(novoAgendamento);
      
      // Se a opção estiver marcada, alterar status para recebido
      if (marcarRecebido && response.id) {
        await updateAgendamentoStatus(response.id, 'recebido');
        setMensagem('Agendamento criado e marcado como recebido');
      } else {
        setMensagem('Agendamento criado com sucesso');
      }
      
      // Limpa o formulário
      setInput('');
      setVolumes('');
      setData(new Date().toISOString().split('T')[0]);
      setEPrevisao(false);
      setClienteId('');
      setClienteSearch('');
      setObservacoes('');
      setMarcarRecebido(false);
      
      onRefresh();
      
      // Foca no input de NF novamente
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setMensagem('Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-content">
        <div className="invoice-modal-header">
          <h3 className="invoice-modal-title">Criar Agendamento</h3>
          <div className="invoice-modal-actions-header">
            <button type="button" onClick={onClose} className="invoice-cancel-edit-button">
              Cancelar
            </button>
            <button className="invoice-close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="invoice-modal-body">
          <form onSubmit={handleSubmit} className="invoice-edit-form">
            <div className="invoice-form-group">
              <label className="invoice-form-label">Número da NF ou Chave de Acesso</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                ref={inputRef}
                className="invoice-form-input"
                placeholder="Digite o número da NF ou chave de acesso"
              />
            </div>
            
            <div className="invoice-form-group">
              <label className="invoice-form-label">Volumes</label>
              <input
                type="number"
                value={volumes}
                onChange={(e) => setVolumes(e.target.value)}
                min="1"
                className="invoice-form-input"
                placeholder="Quantidade de volumes"
              />
            </div>
            
            <div className="invoice-form-group autocomplete-container">
              <label className="invoice-form-label">Cliente</label>
              <input
                type="text"
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  if (e.target.value.trim() === '') {
                    setClienteId('');
                  }
                }}
                onFocus={() => {
                  if (clienteSearch.trim() !== '' && filteredClientes.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay para permitir o clique no item
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                placeholder="Digite o nome ou CNPJ do cliente"
                required
                ref={clienteSearchRef}
                className="invoice-form-input"
              />
              
              {showSuggestions && filteredClientes.length > 0 && (
                <div className="invoice-suggestions" ref={suggestionsRef}>
                  {filteredClientes.map(cliente => (
                    <div 
                      key={cliente.id} 
                      className="invoice-suggestion-item"
                      onClick={() => handleSelectCliente(cliente)}
                      onMouseDown={(e) => e.preventDefault()} // Previne perda de foco
                    >
                      <div className="invoice-suggestion-name">{cliente.nome}</div>
                      <div className="invoice-suggestion-cnpj">{cliente.cnpj}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {clienteId && clienteSearch && (
                <div className="invoice-selected-cliente">
                  ✓ Cliente selecionado: {clientes.find(c => c.id === clienteId)?.nome}
                </div>
              )}
            </div>
            
            <div className="invoice-form-group">
              <label className="invoice-form-label">
                <input
                  type="checkbox"
                  checked={ePrevisao}
                  onChange={(e) => setEPrevisao(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                É previsão (sem data específica)
              </label>
            </div>
            
            {!ePrevisao && (
              <div className="invoice-form-group">
                <label className="invoice-form-label">Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required={!ePrevisao}
                  className="invoice-form-input"
                />
              </div>
            )}
            
            <div className="invoice-form-group">
              <label className="invoice-form-label">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows="3"
                placeholder="Observações adicionais (opcional)"
                className="invoice-form-textarea"
              />
            </div>
            
            <div className="invoice-form-group" style={{marginTop: "15px", marginBottom: "15px"}}>
              <label className="invoice-form-label">
                <input
                  type="checkbox"
                  id="marcarRecebido"
                  checked={marcarRecebido}
                  onChange={(e) => setMarcarRecebido(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Marcar como recebido automaticamente
              </label>
            </div>
            
            <button type="submit" disabled={loading} className="invoice-save-button">
              {loading ? (
                <>
                  <span className="invoice-loading-spinner"></span>
                  Criando...
                </>
              ) : (
                'Criar Agendamento'
              )}
            </button>
          </form>
          
          {mensagem && (
            <p className={`invoice-message ${mensagem.includes('sucesso') || mensagem.includes('recebido') ? 'success' : 'error'}`}>
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreationModal;