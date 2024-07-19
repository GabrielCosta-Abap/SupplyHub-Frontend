import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';

import '../css/Produtos.css'; // Importe o arquivo CSS com os estilos
import API from '../service/API.js';

export default function Produtos() {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [precoVenda, setPrecoVenda] = useState(''); // Adicionando estado para o preço de venda
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [sucessoPopup, setSucessoPopup] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [erroPopup, setErroPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [materiaisSelecionados, setMateriaisSelecionados] = useState([]);
  const [precoTotal, setPrecoTotal] = useState(0);
  const [mostrarPopupProdutos, setMostrarPopupProdutos] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [linhaAtiva, setLinhaAtiva] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    // Buscar materiais da API
    API.get('/material')
      .then(response => {
        const materiaisComChecked = response.data.map(material => ({
          ...material,
          checked: false,
          quantityUn: material.quantity
        }));
        setMateriais(materiaisComChecked);
      })
      .catch(error => {
        console.error(error);
      });
  }, [mostrarPopup]);

  useEffect(() => {
    // Buscar produtos da API
    API.get('/produto')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [mostrarPopupProdutos]);


  useEffect(() => {
    if (produtos && materiais.length > 0) {

      const produtosComDetalhesMateriais = produtos.map(produto => {
        const materiaisComDetalhes = produto.materials.map(materialProduto => {
          const detalhesMaterial = materiais.find(m => m.id === materialProduto.materialid);
          if (detalhesMaterial) {

            return {
              ...materialProduto,
              name: detalhesMaterial.name,
              um: detalhesMaterial.um,
              price: detalhesMaterial.price
            };
          }
          return null; // Caso o material não seja encontrado
        });
        return {
          ...produto,
          materials: materiaisComDetalhes.filter(material => material !== null)
        };
      });
      setProdutos(produtosComDetalhesMateriais);
    }
  }, [produtos, materiais]);

  

  useEffect(() => {
    // Atualizar o preço total sempre que a quantidade ou o preço do material mudar
    let total = 0;
    materiaisSelecionados.forEach(material => {
      material.price = material.price.replace('$', '').replace(',', '');
      total += material.quantity * material.price;
    });
    setPrecoTotal(total);
  }, [materiaisSelecionados]);

  useEffect(() => {
    const novosMateriaisSelecionados = materiaisSelecionados.map(material =>
      ({ ...material, checked: selectAllChecked, quantityUn: material.quantity })
    );
    setMateriaisSelecionados(novosMateriaisSelecionados);
  }, [selectAllChecked]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedPrice = precoVenda.replaceAll('.', '').replace(',', '.');
    const materials = materiaisSelecionados.map(material => ({
      materialid: material.id,
      name: material.name,
      quantity: material.quantity
    }));

    const produtoData = {
      id: id,
      description: nome,
      sale_price: formattedPrice,
      materials: materials
    };

    API.post('/produto', produtoData)
      .then(response => {
        console.log('Produto gravado com sucesso:', response.data);
        setSuccessMessage('Produto gravado com sucesso!')
        setSucessoPopup(true);
        setId(response.data.id)
        limparCampos();
      })
      .catch(error => {
        console.error(error);
        setErrorMessage(error.response.data)
        setErroPopup(true);
      });
  };

  const handleSalePriceChange = (e) => {
    // Atualiza o estado do preço de venda
    setPrecoVenda(e.target.value);
  };

  const handleDelete = (e) => {
    setDeletePopup(true);
  }

  const confirmDeleteProduct = (e) => {
    setDeletePopup(false)

    API.delete(`/produto/${id}`)
      .then(response => {
        console.log('Produto deletado com sucesso:', response.data);
        setSuccessMessage('Produto deletado com sucesso!')
        setSucessoPopup(true);
        limparCampos();
      })
      .catch(error => {
        console.error(error);
        setErrorMessage(error.response.data)
        setErroPopup(true);
      });
  }

  const limparCampos = () => {
    // Limpar os campos do formulário
    setId('');
    setNome('');
    setPrecoVenda('');
    setMateriaisSelecionados([]);
  };

  const handleSelecionarMaterial = (material) => {
    const materialExistente = materiaisSelecionados.find(m => m.id === material.id);

    if (materialExistente) {
      // Se o material já foi selecionado, deselecione-o
      const novosMateriaisSelecionados = materiaisSelecionados.filter(m => m.id !== material.id);
      setMateriaisSelecionados(novosMateriaisSelecionados);
    } else {
      // Se o material ainda não foi selecionado, adicione-o aos materiais selecionados
      const novoMaterial = { ...material, quantityUn: material.quantity, quantity: 1 };
      setMateriaisSelecionados([...materiaisSelecionados, novoMaterial]);
    }

    const novaLinhaAtiva = linhaAtiva === material.id ? null : material.id;
    setLinhaAtiva(novaLinhaAtiva);
  };

  const handleQuantidadeChange = (materialId, newQuantity) => {
    const novosMateriaisSelecionados = materiaisSelecionados.map(material =>
      material.id === materialId ? { ...material, quantityUn: material.quantity, quantity: newQuantity } : material
    );
    setMateriaisSelecionados(novosMateriaisSelecionados);
  };

  const handleCheckboxChange = (materialId) => {
    const materialIndex = materiaisSelecionados.findIndex(material => material.id === materialId);
    const novosMateriaisSelecionados = [...materiaisSelecionados];
    novosMateriaisSelecionados[materialIndex].checked = !novosMateriaisSelecionados[materialIndex].checked;
    setMateriaisSelecionados(novosMateriaisSelecionados);
  };

  const handleDeleteSelected = () => {
    const novosMateriais = materiaisSelecionados.filter(material => !material.checked);
    setMateriais(novosMateriais);
    setMateriaisSelecionados(novosMateriais);
  };

  const limparCampoPesquisa = () => {
    setFiltroNome('');
  };

  const handleSelectAllChange = () => {
    const newCheckedState = !selectAllChecked;
    setSelectAllChecked(newCheckedState);
  };

  return (
    <div className="materia-prima-container">
      <h1 className="form-title">Produtos</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <TextField
            label="Selecionar um produto"
            size="small"
            type="text"
            value={id}
            className="form-input"
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMostrarPopupProdutos(true)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
          <TextField
            label="Descrição do produto"
            size="small"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input descricaoProduto"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
          <TextField
            label="Preço de venda"
            size="small"
            type="text"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            className="form-input descricaoProduto"
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>

        <div className='divAdicionaMateriais'>
          <Button className='addMaterialButton'
            variant="contained"
            onClick={() => setMostrarPopup(true)}
            endIcon={<AddIcon />}>Adicionar materiais </Button>

          <Button className='deleteMaterialButton'
            variant="contained"
            onClick={handleDeleteSelected}
            endIcon={<DeleteIcon />}>Deletar selecionados</Button>
        </div>

        <div>
          <TableContainer component={Paper}>
            <Table aria-label="materiais selecionados">
              <TableHead className='smallTableHeader'>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectAllChecked}
                      onChange={handleSelectAllChange}
                    />
                  </TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="center">Quantidade</TableCell>
                  <TableCell align="center">Unidade de Medida</TableCell>
                  <TableCell align="center">Preço Unitário (R$)</TableCell>
                  <TableCell align="center">Preço (R$)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materiaisSelecionados.map(material => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <Checkbox
                        checked={material.checked}
                        onChange={() => handleCheckboxChange(material.id)}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {material.name}
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        className='smallCellInput'
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleQuantidadeChange(material.id, e.target.value)}
                        InputProps={{
                          style: { textAlign: 'center' },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{material.um}</TableCell>
                    <TableCell align="center">{material.price}</TableCell>
                    <TableCell align="center">
                      {(material.quantity * parseFloat(material.price.replace('$', '').replace(',', '.'))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className='precoTotal'>
                  <TableCell className="precoTotalCell" colSpan={5} align="right">TOTAL:</TableCell>
                  <TableCell className="precoTotalCell" align="center">{precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <div className="footerbar">
          <Button type="submit" className="form-button btn-salvar" startIcon={<SaveIcon />}>Salvar</Button>
          <Button type="button" onClick={handleDelete} className="form-button btn-deletar" startIcon={<DeleteIcon />}>Deletar produto</Button>
          <Button type="button" onClick={limparCampos} className="form-button btn-limpar" startIcon={<RotateLeftIcon />}>Limpar seleção</Button>
        </div>
      </form>

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
                  <IconButton onClick={limparCampoPesquisa}>
                    <ClearIcon />
                  </IconButton>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TableContainer component={Paper}>
            <Table aria-label="materiais disponíveis">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="center">Unidade de Medida</TableCell>
                  <TableCell align="center">Preço R$</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materiais.filter(material =>
                  material.name.toLowerCase().includes(filtroNome.toLowerCase())
                ).map(material => (
                  <TableRow
                    key={material.id}
                    hover onClick={() => handleSelecionarMaterial(material)}>
                    <TableCell>
                      {material.name}
                    </TableCell>
                    <TableCell align="center">{material.um}</TableCell>
                    <TableCell align="center">{material.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setMostrarPopup(false)}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mostrarPopupProdutos} onClose={() => setMostrarPopupProdutos(false)}>
        <DialogTitle>Selecione um Produto</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table aria-label="produtos disponíveis">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Descrição</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produtos.map(produto => (
                  <TableRow
                    key={produto.id}
                    hover onClick={() => {
                      setId(produto.id);
                      setNome(produto.description);
                      setPrecoVenda(produto.sale_price.replace('$','').replace('.',','));
                      setMateriaisSelecionados(produto.materials);
                      setMostrarPopupProdutos(false);
                    }}>
                    <TableCell>{produto.id}</TableCell>
                    <TableCell>{produto.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button className="normalButton" onClick={() => setMostrarPopupProdutos(false)}>Cancelar</Button>
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
          Tem certeza de que quer deletar este produto?
        </DialogContent>
        <DialogActions>
          <Button className="deleteButton" onClick={confirmDeleteProduct}>Deletar</Button>
          <Button className="normalButton" onClick={() => setDeletePopup(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
