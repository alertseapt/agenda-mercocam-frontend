import React, { useState } from 'react';
import { searchAgendamentos, updateAgendamentoStatus, updateAgendamento } from '../../services/api';
import { extrairNumeroNF, formatarData } from '../../utils/nfUtils';

const InvoiceKeyInput = ({ onRefresh }) => {
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [receivingIds, setReceivingIds] = useState(new Set());
  
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter') {
      setLoading(true);
      setMensagem('');
      
      try {
        const agendamentos = await searchAgendamentos(chaveAcesso);
        
        // Filtra apenas agendamentos com status "agendado"
        const agendadosResultados = agendamentos.filter(a => a.status === 'agendado');
        
        setResultados(agendadosResultados);
        
        if (agendadosResultados.length === 0) {
          const numeroNF = extrairNumeroNF(chaveAcesso);
          setMensagem(`Nota ${numeroNF} não agendada`);
        }
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        setMensagem('Erro ao buscar agendamentos');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleReceberNota = async (id, agendamento) => {
    // Adiciona o ID ao conjunto de IDs sendo processados
    setReceivingIds(prev => new Set(prev).add(id));
    
    try {
      // Verificar se é uma chave de acesso (44 dígitos) e se o agendamento ainda não tem chave
      if (chaveAcesso.length === 44 && /^\d+$/.test(chaveAcesso) && 
          (!agendamento.chaveAcesso || agendamento.chaveAcesso.length === 0)) {
        
        // Primeiro atualiza a chave de acesso
        await updateAgendamento(id, { chaveAcesso });
        console.log(`Chave de acesso ${chaveAcesso} adicionada ao agendamento ${id}`);
      }
      
      // Depois altera o status para recebido
      await updateAgendamentoStatus(id, 'recebido');
      
      // Atualiza a lista de resultados
      setResultados(resultados.filter(item => item.id !== id));
      
      // Limpa o campo de chave de acesso
      setChaveAcesso('');
      
      // Notifica que a nota foi recebida
      setMensagem('Nota recebida com sucesso');
      
      // Atualiza a tela principal
      onRefresh();
    } catch (error) {
      console.error('Erro ao receber nota:', error);
      setMensagem(`Erro ao receber nota: ${error.message}`);
    } finally {
      // Remove o ID do conjunto de IDs sendo processados
      setReceivingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  
  return (
    <div className="invoice-key-input">
      <h3>Chave de Acesso da Nota Fiscal</h3>
      <input
        type="text"
        value={chaveAcesso}
        onChange={(e) => setChaveAcesso(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Digite a chave de acesso da NF..."
        disabled={loading}
      />
      
      {loading && <p>Carregando...</p>}
      
      {mensagem && <p className="mensagem">{mensagem}</p>}
      
      {resultados.length > 0 && (
        <div className="resultados">
          <h4>Agendamentos encontrados:</h4>
          <ul>
            {resultados.map(item => (
              <li key={item.id}>
                <span>NF: {item.numeroNF}</span>
                <span>Cliente: {item.cliente.nome}</span>
                <span>Data: {formatarData(item.data)}</span>
                <button 
                  onClick={() => handleReceberNota(item.id, item)}
                  disabled={receivingIds.has(item.id)}
                >
                  {receivingIds.has(item.id) ? (
                    <>
                      <span className="loading-spinner"></span>
                      Recebendo...
                    </>
                  ) : (
                    'Receber'
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceKeyInput;