import React, { useState, useEffect } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api';
import ClienteForm from '../components/clientes/ClienteForm';
import ClienteList from '../components/clientes/ClienteList';
import PasswordModal from '../components/administrativo/PasswordModal';
import './ClientesPage.css';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      // Ordenar clientes por ordem alfabética
      const sortedData = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setClientes(sortedData);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao carregar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCreateCliente = async (clienteData) => {
    try {
      await createCliente(clienteData);
      setShowForm(false);
      fetchClientes();
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      throw err;
    }
  };

  const handleUpdateCliente = async (id, clienteData) => {
    try {
      await updateCliente(id, clienteData);
      setShowForm(false);
      setEditingCliente(null);
      fetchClientes();
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      throw err;
    }
  };

  const handleDeleteCliente = async (id) => {
    try {
      await deleteCliente(id);
      setShowForm(false);
      setEditingCliente(null);
      fetchClientes();
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      throw err;
    }
  };

  const handleEditCliente = (cliente) => {
    console.log('Editando cliente:', cliente);
    setEditingCliente(cliente);
    setShowPasswordModal(true);
    console.log('showPasswordModal definido como true');
  };

  const handlePasswordConfirm = () => {
    console.log('Senha confirmada, abrindo formulário');
    setShowPasswordModal(false);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCliente(null);
  };

  if (loading) {
    return (
      <div className="clientes-page">
        <div className="loading">Carregando clientes...</div>
      </div>
    );
  }

  console.log('Renderizando ClientesPage - showPasswordModal:', showPasswordModal);

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h1>Gestão de Clientes</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Novo Cliente
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <ClienteList 
        clientes={clientes}
        onEdit={handleEditCliente}
      />

      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
          onCancel={handleCancelForm}
          onDelete={editingCliente ? handleDeleteCliente : null}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          onConfirm={handlePasswordConfirm}
          onCancel={() => {
            console.log('PasswordModal cancelado');
            setShowPasswordModal(false);
          }}
          title="Digite a senha para editar"
        />
      )}
    </div>
  );
};

export default ClientesPage; 