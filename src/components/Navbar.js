import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { ambiente, setAmbiente } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAmbienteChange = (newAmbiente) => {
    setAmbiente(newAmbiente);
    
    // Navegar para a rota correspondente
    switch (newAmbiente) {
      case 'administrativo':
        navigate('/administrativo');
        break;
      case 'leitura':
        navigate('/leitura');
        break;
      case 'clientes':
        navigate('/clientes');
        break;
      default:
        navigate('/administrativo');
    }
  };

  // Determinar ambiente atual baseado na rota
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/administrativo' && ambiente !== 'administrativo') {
      setAmbiente('administrativo');
    } else if (path === '/leitura' && ambiente !== 'leitura') {
      setAmbiente('leitura');
    } else if (path === '/clientes' && ambiente !== 'clientes') {
      setAmbiente('clientes');
    }
  }, [location.pathname, ambiente, setAmbiente]);

  return (
    <div className="navbar">
      <div className="logo">
        <h2>Logística</h2>
      </div>
      <nav>
        <ul>
          <li 
            className={ambiente === 'administrativo' ? 'active' : ''}
            onClick={() => handleAmbienteChange('administrativo')}
          >
            <span>Administrativo</span>
          </li>
          <li 
            className={ambiente === 'leitura' ? 'active' : ''}
            onClick={() => handleAmbienteChange('leitura')}
          >
            <span>Leitura</span>
          </li>
          <li 
            className={ambiente === 'clientes' ? 'active' : ''}
            onClick={() => handleAmbienteChange('clientes')}
          >
            <span>Clientes</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;