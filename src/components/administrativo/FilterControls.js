import React, { useState, useEffect } from 'react';
import { getClientes } from '../../services/api';
import './FilterControls.css';

// Statuses relevantes para o ambiente administrativo (excluindo 'fechado' e 'agendado')
const statusOptions = ['recebido', 'informado', 'em tratativa', 'a paletizar', 'paletizado'];
const statusLabels = {
  'recebido': 'Recebido',
  'informado': 'Informado',
  'em tratativa': 'Em Tratativa',
  'a paletizar': 'A Paletizar',
  'paletizado': 'Paletizado'
};

const FilterControls = ({ onFilter, onClearSelection, selectedCount = 0 }) => {
  const [cliente, setCliente] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [clientes, setClientes] = useState([]);
  
  useEffect(() => {
    // Carrega a lista de clientes
    fetchClientes();
  }, []);

  useEffect(() => {
    // Aplica os filtros sempre que um estado de filtro mudar
    const filtros = {
      cliente: cliente || undefined,
      status: selectedStatus || undefined
    };
    onFilter(filtros);
  }, [cliente, selectedStatus, onFilter]);

  const fetchClientes = async () => {
    try {
      const clientesList = await getClientes();
      // Ordena os clientes em ordem alfabética
      clientesList.sort((a, b) => a.nome.localeCompare(b.nome));
      setClientes(clientesList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const smallInputStyle = {
    padding: '8px 12px',
    fontSize: '0.9rem',
    height: 'auto',
    width: 'fit-content',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff'
  };
  
  return (
    <div className="admin-filter-container">
      <div className="admin-main-filters">
        <button 
          className="clear-selection-button"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          title={`Limpar seleção${selectedCount > 0 ? ` (${selectedCount} item${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''})` : ''}`}
        >
          🗑️ Limpar Seleção
          {selectedCount > 0 && <span className="selection-count-badge">{selectedCount}</span>}
        </button>

        <div className="admin-filter-group">
          <label>Cliente</label>
          <select value={cliente} onChange={(e) => setCliente(e.target.value)} style={smallInputStyle}>
            <option value="">Todos os clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter-group">
          <label>Status</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={smallInputStyle}>
            <option value="">Todos os status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls; 