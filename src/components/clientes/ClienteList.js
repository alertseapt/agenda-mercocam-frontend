import React from 'react';
import './ClienteList.css';

const ClienteList = ({ clientes, onEdit }) => {
  if (!clientes || clientes.length === 0) {
    return (
      <div className="cliente-list-empty">
        <p>Nenhum cliente cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="cliente-list">
      <div className="cliente-list-header">
        <h2>Clientes Cadastrados ({clientes.length})</h2>
      </div>
      
      <div className="cliente-table-container">
        <table className="cliente-table">
          <thead>
            <tr>
              <th>Nome da Empresa</th>
              <th>CNPJ</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="cliente-row">
                <td className="cliente-nome">{cliente.nome}</td>
                <td className="cliente-cnpj">{cliente.cnpj}</td>
                <td className="cliente-observacoes">
                  {cliente.observacoes || '-'}
                </td>
                <td className="cliente-acoes">
                  <button 
                    className="btn-edit"
                    onClick={() => {
                      console.log('Botão editar clicado para:', cliente);
                      onEdit(cliente);
                    }}
                    title="Editar cliente"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClienteList; 