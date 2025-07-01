import React, { useState } from 'react';

const PasswordModal = ({ onConfirm, onCancel, title = "Digite a senha para editar" }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === '102030') {
      onConfirm();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1001 }}>
      <div className="modal-content" style={{ maxWidth: '300px', padding: '20px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Digite a senha para editar:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            {error && (
              <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
                {error}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal; 