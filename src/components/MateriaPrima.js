import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import '../css/MateriaPrima.css'; // Importe o arquivo CSS com os estilos
import API from '../service/API.js';

export default function MateriaPrima() {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeNecessaria, setQuantidadeNecessaria] = useState('');
  const [unidade, setUnidade] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [sucessoPopup, setSucessoPopup] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [erroPopup, setErroPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');

  useEffect(() => {
    // Buscar materiais da API
    API.get('/material')
      .then(response => {
        setMateriais(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [mostrarPopup]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let formattedPrice = precoCusto.replaceAll('.', '').replace(',', '.')
    const oDados = { id: id, 
                     name: nome, 
                     quantity: quantidade,
                     neededQuantity: quantidadeNecessaria, 
                     um: unidade, 
                     price: formattedPrice };
    console.log('Dados do formulário:', oDados);

    API.post('/material', oDados)
      .then(response => {
        console.log('Material gravado com sucesso:', response.data);
        setSuccessMessage('Material gravado com sucesso!')
        setSucessoPopup(true);
        limparCampos();
      })
      .catch(error => {
        console.error(error);
        setErrorMessage(error.response.data)
        setErroPopup(true);
      });
  };

  const handleDelete = (e) => {
    setDeletePopup(true);
  }

  const confirmDeleteMaterial = (e) => {
    setDeletePopup(false)
  
    debugger
    API.delete(`/material/${id}`)
      .then(response => {
        debugger
        console.log('Material deletado com sucesso:', response.data);
        setSuccessMessage('Material deletado com sucesso!')
        setSucessoPopup(true);
        limparCampos();
      })
      .catch(error => {
        debugger
        console.error(error);
        setErrorMessage(error.response.data)
        setErroPopup(true);
      });

  }

  const limparCampos = () => {
    setId('');
    setNome('');
    setQuantidade('');
    setQuantidadeNecessaria('');
    setUnidade('');
    setPrecoCusto('');
  };
  
  const handleSelecionarMaterial = (material) => {
    setId(material.id);
    setNome(material.name);
    setQuantidade(material.quantity);
    setQuantidadeNecessaria(material.neededquantity);
    setUnidade(material.um);
    setPrecoCusto(material.price);
    setMostrarPopup(false);
  };

  // Função para renderizar a lista de materiais no popup
  const renderizarListaMateriais = () => {
    // Filtrar os materiais pelo nome inserido no campo de busca
    const materiaisFiltrados = materiais.filter(material =>
      material.name.toLowerCase().includes(filtroNome.toLowerCase())
    );

    return (
      <Dialog open={mostrarPopup} onClose={() => setMostrarPopup(false)}>
        <DialogTitle>Selecione um Material</DialogTitle>
        <DialogContent>
          <TextField
            label="Buscar Material"
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {materiaisFiltrados.map(material => (
            <div className="materialsListButton" key={material.id}>
              <Button onClick={() => handleSelecionarMaterial(material)}>{material.name}</Button>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setMostrarPopup(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

    );
  };

  return (
    <div className="materia-prima-container">
      <h1 className="form-title">Materia Prima</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <TextField
            label="Id"
            size="small"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="form-input"
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMostrarPopup(true)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div>
          <TextField
            label="Nome do Material"
            type="text"
            size="small"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input input-nome-material"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div>
          <TextField
            label="Quantidade em estoque"
            type="number"
            size="small"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="form-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div>
          <TextField
            label="Quantidade necessária"
            type="number"
            size="small"
            value={quantidadeNecessaria}
            onChange={(e) => setQuantidadeNecessaria(e.target.value)}
            className="form-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div>
          <TextField
            label="Unidade de Medida"
            type="text"
            size="small"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className="form-input input-unidade-de-medida"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div>
          <TextField
            label="Preço de Custo"
            type="float"
            size="small"
            value={precoCusto}
            onChange={(e) => setPrecoCusto(e.target.value)}
            className="form-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <div className="footerbar">
          <Button type="submit" className="form-button btn-salvar" startIcon={<SaveIcon />}>Salvar</Button>
          <Button type="button" onClick={handleDelete} className="form-button btn-deletar" startIcon={<DeleteIcon />}>Deletar material</Button>
          <Button type="button" onClick={limparCampos} className="form-button btn-limpar" startIcon={<RotateLeftIcon />}>Limpar formulário</Button>
        </div>
      </form>

      <Dialog open={mostrarPopup} onClose={() => setMostrarPopup(false)}>
        <DialogTitle>Selecione um Material</DialogTitle>
        <DialogContent>
          {renderizarListaMateriais()}
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setMostrarPopup(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={sucessoPopup} onClose={() => setSucessoPopup(false)}>
        <DialogTitle className='successTitle'>Sucesso!</DialogTitle>
        <DialogContent className='successMessage'>
          {successMessage}
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setSucessoPopup(false)}>Ok</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={erroPopup} onClose={() => setErroPopup(false)}>
        <DialogTitle className='errorTitle'>Erro!</DialogTitle>
        <DialogContent className='errorMessage'>
          {errorMessage}
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setErroPopup(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deletePopup} onClose={() => setDeletePopup(false)}>
        <DialogTitle className='deleteTitle'>ATENÇÃO!</DialogTitle>
        <DialogContent className='deleteMessage'>
          Tem certeza de que quer deletar este item?
        </DialogContent>
        <DialogActions>
          <Button className="deleteButton" onClick={confirmDeleteMaterial}>Deletar</Button>
          <Button className="normalButton" onClick={() => setDeletePopup(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
