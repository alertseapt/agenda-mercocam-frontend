import React, { useState, useEffect } from 'react';
import './ClienteForm.css';

const ClienteForm = ({ cliente, onSubmit, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!cliente;

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        cnpj: cliente.cnpj || '',
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else {
      // Validação básica de CNPJ (formato XX.XXX.XXX/XXXX-XX)
      const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
      if (!cnpjRegex.test(formData.cnpj)) {
        newErrors.cnpj = 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit(cliente.id, formData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      // Tratar erro específico se necessário
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(cliente.id);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCNPJ = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const handleCNPJChange = (e) => {
    const formattedValue = formatCNPJ(e.target.value);
    setFormData(prev => ({
      ...prev,
      cnpj: formattedValue
    }));
    
    if (errors.cnpj) {
      setErrors(prev => ({
        ...prev,
        cnpj: ''
      }));
    }
  };

  return (
    <div className="cliente-form-overlay">
      <div className="cliente-form-modal">
        <div className="cliente-form-header">
          <h2>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button 
            className="btn-close"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-group">
            <label htmlFor="nome">Nome da Empresa *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className={errors.nome ? 'error' : ''}
              placeholder="Digite o nome da empresa"
              disabled={isSubmitting}
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cnpj">CNPJ *</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleCNPJChange}
              className={errors.cnpj ? 'error' : ''}
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength="18"
              disabled={isSubmitting}
            />
            {errors.cnpj && <span className="error-message">{errors.cnpj}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Observações sobre o cliente (opcional)"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
              >
                Excluir Cliente
              </button>
            )}
            
            <div className="form-actions-right">
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir o cliente "{cliente.nome}"?</p>
              <p className="warning">Esta ação não pode ser desfeita.</p>
              
              <div className="delete-confirm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteForm; 