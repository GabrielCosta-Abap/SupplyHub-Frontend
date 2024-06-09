import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import '../css/Produtos.css'; // Importe o arquivo CSS com os estilos
import API from '../service/API.js';

export default function RegistrarVenda() {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [precoVenda, setPrecoVenda] = useState(''); // Adicionando estado para o preço de venda
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [sucessoPopup, setSucessoPopup] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [erroPopup, setErroPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [precoTotal, setPrecoTotal] = useState(0);
  const [mostrarPopupProdutos, setMostrarPopupProdutos] = useState(false);
  const [linhaAtiva, setLinhaAtiva] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Buscar produtos da API
    API.get('/produto')
      .then(response => {
        const produtosComChecked = response.data.map(produto => ({
          ...produto,
          checked: false,
          quantityUn: 1 // Assume quantidade inicial como 1
        }));
        setProdutos(produtosComChecked);
      })
      .catch(error => {
        console.error(error);
      });
  }, [mostrarPopup]);

  useEffect(() => {
    if (produtos.length > 0) {
      setProdutos(produtos);
    }
  }, [produtos]);

  useEffect(() => {
    // Atualizar o preço total sempre que a quantidade ou o preço do produto mudar
    let total = 0;
    produtosSelecionados.forEach(produto => {
      produto.sale_price = produto.sale_price.replace('$','')
      total += produto.quantity * produto.sale_price;
    });
    setPrecoTotal(total);
  }, [produtosSelecionados]);

  useEffect(() => {
    const novosProdutosSelecionados = produtosSelecionados.map(produto =>
      ({ ...produto, checked: selectAllChecked, quantityUn: produto.quantity })
    );
    setProdutosSelecionados(novosProdutosSelecionados);
  }, [selectAllChecked]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Define o estado de carregamento como verdadeiro
    setLoading(true);

    const produtos = produtosSelecionados.map(produto => ({
      product_id: produto.id,
      quantity: produto.quantity,
      unit_value: parseFloat(produto.sale_price),
      total_value: produto.quantity * parseFloat(produto.sale_price)
    }));

    const vendaData = {
      valor_total: precoTotal,
      itens: produtos
    };

    API.post('/venda', vendaData)
      .then(response => {
        console.log('Venda registrada com sucesso:', response.data);
        setSuccessMessage('Venda registrada com sucesso!')
        setSucessoPopup(true);
        setId(response.data.id)
        limparCampos();
      })
      .catch(error => {
        console.error(error);
        setErrorMessage(error.response.data)
        setErroPopup(true);
      })
      .finally(() => {
        // Define o estado de carregamento como falso após a conclusão da requisição
        setLoading(false);
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
    setProdutosSelecionados([]);
  };

  const handleSelecionarProduto = (produto) => {
    const produtoExistente = produtosSelecionados.find(p => p.id === produto.id);

    if (produtoExistente) {
      // Se o produto já foi selecionado, deselecione-o
      const novosProdutosSelecionados = produtosSelecionados.filter(p => p.id !== produto.id);
      setProdutosSelecionados(novosProdutosSelecionados);
    } else {
      // Se o produto ainda não foi selecionado, adicione-o aos produtos selecionados
      const novoProduto = { ...produto, quantityUn: 1, quantity: 1 };
      setProdutosSelecionados([...produtosSelecionados, novoProduto]);
    }

    const novaLinhaAtiva = linhaAtiva === produto.id ? null : produto.id;
    setLinhaAtiva(novaLinhaAtiva);
  };

  const handleQuantidadeChange = (produtoId, newQuantity) => {
    const novosProdutosSelecionados = produtosSelecionados.map(produto =>
      produto.id === produtoId ? { ...produto, quantityUn: produto.quantity, quantity: newQuantity } : produto
    );
    setProdutosSelecionados(novosProdutosSelecionados);
  };

  const handleCheckboxChange = (produtoId) => {
    const produtoIndex = produtosSelecionados.findIndex(produto => produto.id === produtoId);
    const novosProdutosSelecionados = [...produtosSelecionados];
    novosProdutosSelecionados[produtoIndex].checked = !novosProdutosSelecionados[produtoIndex].checked;
    setProdutosSelecionados(novosProdutosSelecionados);
  };

  const handleDeleteSelected = () => {
    const novosProdutos = produtosSelecionados.filter(produto => !produto.checked);
    setProdutos(novosProdutos);
    setProdutosSelecionados(novosProdutos);
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
      <div className="materia-prima-container">
        <h1 className="form-title">Registrar Venda</h1>
        <form onSubmit={handleSubmit} className="form-container">

          <div className='divAdicionaProdutos'>
            <Button className='addMaterialButton'
              variant="contained"
              onClick={() => setMostrarPopup(true)}
              endIcon={<AddIcon />}>Adicionar produtos </Button>

            <Button className='deleteMaterialButton'
              variant="contained"
              onClick={handleDeleteSelected}
              endIcon={<DeleteIcon />}>Deletar selecionados</Button>
          </div>

          <div>
            <TableContainer component={Paper}>
              <Table aria-label="produtos selecionados">
                <TableHead className='smallTableHeader'>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={selectAllChecked}
                        onChange={handleSelectAllChange}
                      />
                    </TableCell>
                    <TableCell>Produto</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="center">Valor Unitário (R$)</TableCell>
                    <TableCell align="center">Valor (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtosSelecionados.map(produto => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <Checkbox
                          checked={produto.checked}
                          onChange={() => handleCheckboxChange(produto.id)}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {produto.description}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          className='smallCellInput'
                          type="number"
                          value={produto.quantity}
                          onChange={(e) => handleQuantidadeChange(produto.id, e.target.value)}
                          InputProps={{
                            style: { textAlign: 'center' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{produto.sale_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell align="center">
                        {(produto.quantity * parseFloat(produto.sale_price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className='precoTotal'>
                    <TableCell className="precoTotalCell" colSpan={4} align="right">TOTAL:</TableCell>
                    <TableCell className="precoTotalCell" align="center">{precoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="footerbar">
            <Button type="submit" className="form-button btn-salvar" startIcon={<AttachMoneyIcon />}>Registrar Venda</Button>
            <Button type="button" onClick={limparCampos} className="form-button btn-limpar" startIcon={<RotateLeftIcon />}>Começar de novo</Button>
          </div>
        </form>

        <Dialog open={mostrarPopup} onClose={() => setMostrarPopup(false)}>
          <DialogTitle>Selecione um Produto</DialogTitle>
          <DialogContent>
            <TextField
              label="Buscar Produto"
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
              <Table aria-label="produtos disponíveis">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell align="center">Descrição</TableCell>
                    <TableCell align="center">Valor R$</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtos.filter(produto =>
                    produto.description.toLowerCase().includes(filtroNome.toLowerCase())
                  ).map(produto => (
                    <TableRow key={produto.id}
                              hover 
                              onClick={() => handleSelecionarProduto(produto)}>
                      <TableCell>{produto.id}</TableCell>
                      <TableCell>{produto.description}</TableCell>
                      <TableCell align="center">{produto.sale_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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
                        setPrecoVenda(produto.sale_price);
                        setProdutosSelecionados(produto.produtos);
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
      {loading && 
      (
      <div className="loading-overlay">
        <div className="loading-indicator">Carregando...</div>
      </div>
    )}

    </div>
  );
}
