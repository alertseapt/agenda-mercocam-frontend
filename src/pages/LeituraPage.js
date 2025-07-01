import React, { useState, useEffect, useCallback } from 'react';
import SearchInput from '../components/leitura/SearchInput';
import FilterControls from '../components/leitura/FilterControls';
import SchedulesList from '../components/leitura/SchedulesList';
import InvoiceDetailsModal from '../components/administrativo/InvoiceDetailsModal';
import { getAgendamentos } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { timestampToDate } from '../utils/nfUtils';

const LeituraPage = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  
  // Debug: log whenever filteredAgendamentos changes
  useEffect(() => {
    console.log('LeituraPage: filteredAgendamentos mudou:', filteredAgendamentos);
    console.log('LeituraPage: Número de agendamentos filtrados:', filteredAgendamentos.length);
  }, [filteredAgendamentos]);
  const [loading, setLoading] = useState(false);
  const [totalVolumes, setTotalVolumes] = useState(0);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const { ambienteChanged, resetAmbienteChanged } = useAuth();
  
  // Carrega os agendamentos iniciais e quando o ambiente muda para Leitura
  useEffect(() => {
    fetchAgendamentos();
    
    // Se a página foi carregada devido a mudança de ambiente, reset o sinalizador
    if (ambienteChanged) {
      resetAmbienteChanged();
    }
  }, [ambienteChanged]); // Adiciona ambienteChanged como dependência
  
  useEffect(() => {
    const total = filteredAgendamentos.reduce((acc, agendamento) => acc + (Number(agendamento.volumes) || 0), 0);
    setTotalVolumes(total);
  }, [filteredAgendamentos]);
  
  const fetchAgendamentos = async () => {
    setLoading(true);
    
    try {
      // Obtém todos os agendamentos
      const response = await getAgendamentos();
      
      // Log para depurar a estrutura dos dados recebidos
      console.log('Dados recebidos:', JSON.stringify(response[0]));
      
      setAgendamentos(response);
      
      // Aplica os filtros padrão (mês atual)
      const hoje = new Date();
      const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      applyDefaultFilters(response, primeiroDiaDoMes, hoje);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Aplica os filtros padrão aos agendamentos
  const applyDefaultFilters = (agendamentosList, dataInicial, dataFinal) => {
    if (!agendamentosList || agendamentosList.length === 0) return;
    
    const dataInicio = new Date(dataInicial);
    dataInicio.setHours(0, 0, 0, 0);

    const dataFim = new Date(dataFinal);
    dataFim.setHours(23, 59, 59, 999);
    
    const filtrados = agendamentosList.filter(a => {
      if (a.ePrevisao) return true;
      
      if (!a.data) return false;
      
      const dataAgendamento = timestampToDate(a.data);
      return dataAgendamento >= dataInicio && dataAgendamento <= dataFim;
    });
    
    // Ordenar por data mais antiga
    filtrados.sort((a, b) => {
      if (a.ePrevisao && !b.ePrevisao) return 1;
      if (!a.ePrevisao && b.ePrevisao) return -1;
      if (a.ePrevisao && b.ePrevisao) return 0;
      
      const dataA = timestampToDate(a.data);
      const dataB = timestampToDate(b.data);
      return dataA - dataB;
    });
    
    setFilteredAgendamentos(filtrados);
  };
  
  const handleSearchResults = (resultados) => {
    console.log('LeituraPage: Recebendo resultados da busca:', resultados);
    console.log('LeituraPage: Número de resultados:', resultados.length);
    
    // Sempre define searchResults, mesmo se vazio (para mostrar que uma busca foi realizada)
    setSearchResults(resultados);
    
    if (resultados.length > 0) {
      console.log('LeituraPage: Definindo filteredAgendamentos com resultados da busca');
      setFilteredAgendamentos(resultados);
    } else {
      console.log('LeituraPage: Nenhum resultado encontrado, limpando lista');
      // Se a busca não retornou resultados, mostra lista vazia
      setFilteredAgendamentos([]);
    }
  };
  
  const clearSearch = () => {
    console.log('LeituraPage: Limpando busca');
    setSearchResults(null);
    
    // Aplica filtros aos agendamentos gerais quando limpa a busca
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    applyDefaultFilters(agendamentos, primeiroDiaDoMes, hoje);
  };
  
  const handleFilter = useCallback((filtros) => {
    console.log('LeituraPage: handleFilter chamado com filtros:', filtros);
    console.log('LeituraPage: searchResults atual:', searchResults);
    
    let resultado = searchResults ? [...searchResults] : [...agendamentos];
    
    // Aplica filtros
    if (filtros.cliente) {
      resultado = resultado.filter(a => a.clienteId === filtros.cliente);
    }
    
    if (filtros.status) {
      if (filtros.status.length > 0) {
        resultado = resultado.filter(a => filtros.status.includes(a.status));
      } else {
        // Se nenhum status for selecionado, a lista fica vazia
        resultado = [];
      }
    }
    
    // Filtra por data
    if (filtros.dataInicial && filtros.dataFinal) {
      const dataInicio = new Date(filtros.dataInicial);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(filtros.dataFinal);
      dataFim.setHours(23, 59, 59, 999);
      
      resultado = resultado.filter(a => {
        if (a.ePrevisao) return true;
        
        if (!a.data) return false;
        
        const dataAgendamento = timestampToDate(a.data);
        return dataAgendamento >= dataInicio && dataAgendamento <= dataFim;
      });
    }
    
    // Aplica ordenação
    switch (filtros.ordenacao) {
      case 'data_antiga':
        resultado.sort((a, b) => {
          if (a.ePrevisao && !b.ePrevisao) return 1;
          if (!a.ePrevisao && b.ePrevisao) return -1;
          if (a.ePrevisao && b.ePrevisao) return 0;
          
          const dataA = timestampToDate(a.data);
          const dataB = timestampToDate(b.data);
          return dataA - dataB;
        });
        break;
      case 'data_recente':
        resultado.sort((a, b) => {
          if (a.ePrevisao && !b.ePrevisao) return 1;
          if (!a.ePrevisao && b.ePrevisao) return -1;
          if (a.ePrevisao && b.ePrevisao) return 0;
          
          const dataA = timestampToDate(a.data);
          const dataB = timestampToDate(b.data);
          return dataB - dataA;
        });
        break;
      case 'volumes':
        resultado.sort((a, b) => b.volumes - a.volumes);
        break;
      default:
        break;
    }
    
    console.log('LeituraPage: Resultado do filtro:', resultado);
    setFilteredAgendamentos(resultado);
  }, [agendamentos, searchResults]);
  
  // Versão do handleFilter que não deve ser executada quando há searchResults
  const handleFilterWithSearchCheck = useCallback((filtros) => {
    // Se há resultados de busca, não aplica filtros automáticos
    if (searchResults !== null) {
      console.log('LeituraPage: Ignorando filtro automático porque há resultados de busca');
      return;
    }
    handleFilter(filtros);
  }, [handleFilter, searchResults]);
  
  const handleRowClick = (agendamento) => {
    setSelectedAgendamento(agendamento);
  };

  const closeModal = () => {
    setSelectedAgendamento(null);
  };
  
  return (
    <div className="page leitura-page" style={{ maxWidth: '70%', margin: '0 auto' }}>
      <h2>Leitura</h2>
      
      <SearchInput onSearchResults={handleSearchResults} />
      
      <FilterControls onFilter={handleFilterWithSearchCheck} />
      
      <div className="total-volumes-info">
        <p>Volumetria total: <strong>{totalVolumes}</strong></p>
      </div>
      
      {searchResults !== null && (
        <div className="search-info">
          <p>Exibindo resultados da busca ({filteredAgendamentos.length})</p>
          <button onClick={clearSearch}>
            Limpar busca
          </button>
        </div>
      )}
      
      <SchedulesList 
        agendamentos={filteredAgendamentos} 
        loading={loading}
        onRowClick={handleRowClick}
      />
      
      {/* Debug info */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        fontSize: '12px',
        borderRadius: '4px',
        maxWidth: '300px'
      }}>
        <div>Total agendamentos: {agendamentos.length}</div>
        <div>Agendamentos filtrados: {filteredAgendamentos.length}</div>
        <div>Search results: {searchResults ? searchResults.length : 'null'}</div>
        <div>Loading: {loading ? 'true' : 'false'}</div>
      </div>

      {selectedAgendamento && (
        <InvoiceDetailsModal
          agendamento={selectedAgendamento}
          onClose={closeModal}
          onRefresh={fetchAgendamentos}
          showStatusChange={true}
        />
      )}
    </div>
  );
};

export default LeituraPage;