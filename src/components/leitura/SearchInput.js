import React, { useState } from 'react';
import { searchAgendamentos } from '../../services/api';

const SearchInput = ({ onSearchResults }) => {
  const [termo, setTermo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termo.trim()) return;

    console.log('SearchInput: Iniciando busca para:', termo);
    setLoading(true);

    try {
      const resultados = await searchAgendamentos(termo);
      console.log('SearchInput: Resultados obtidos da API:', resultados);
      console.log('SearchInput: Número de resultados:', resultados ? resultados.length : 0);
      
      // Sempre chama onSearchResults, mesmo se resultados for vazio
      if (onSearchResults) {
        console.log('SearchInput: Chamando onSearchResults com:', resultados);
        onSearchResults(resultados || []);
      } else {
        console.error('SearchInput: onSearchResults não está definido');
      }
    } catch (error) {
      console.error('SearchInput: Erro na busca:', error);
      // Em caso de erro, chama onSearchResults com array vazio
      if (onSearchResults) {
        console.log('SearchInput: Chamando onSearchResults com array vazio devido ao erro');
        onSearchResults([]);
      }
    } finally {
      setLoading(false);
      console.log('SearchInput: Busca finalizada');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite o número da NF ou chave de acesso"
          style={{ flex: 1, padding: '8px' }}
          disabled={loading}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Buscando...
            </>
          ) : (
            'Buscar'
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchInput;