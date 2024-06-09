import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, TextField, Button, Paper } from '@mui/material';
import API from '../service/API.js';
import { styled } from '@mui/system';

const StyledTableContainer = styled(TableContainer)({
  margin: '20px',
});

const StyledTable = styled(Table)({
  minWidth: 650,
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '@media (max-width: 600px)': {
    display: 'block',
    textAlign: 'right',
    '&:before': {
      content: 'attr(data-label)',
      float: 'left',
      fontWeight: 'bold',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&.purchased': {
    textDecoration: 'line-through',
  },
  '@media (max-width: 600px)': {
    display: 'block',
    marginBottom: '15px',
  },
}));

const StyledButton = styled(Button)({
  marginTop: '20px',
});

const ShoppingList = () => {
  const [materials, setMaterials] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    API.get('/compras')
      .then(response => {
        setMaterials(response.data);
      })
      .catch(error => {
        console.error("Error fetching materials:", error);
      });
  }, []);

  const handleCheckboxChange = (index) => {
    const newMaterials = [...materials];
    newMaterials[index].purchased = !newMaterials[index].purchased;
    setMaterials(newMaterials);
  };

  const handleValueChange = (index, value) => {
    const newMaterials = [...materials];
    newMaterials[index].price = value;  // Mantém o valor como string
    setMaterials(newMaterials);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Converte o valor para número ao salvar
    const materialsToSave = materials.map(material => ({
      ...material,
      price: parseFloat(material.price.replace(',', '.'))
    }));

    API.post('/material', materialsToSave)
      .then(response => {
        setIsSaving(false);
        console.log("Data saved successfully");
      })
      .catch(error => {
        setIsSaving(false);
        console.error("Error saving data:", error);
      });
  };

  return (
    <div>
      <StyledTableContainer component={Paper}>
        <StyledTable aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Checkbox</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Comprar</TableCell>
              <TableCell>Val. Última Compra</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((material, index) => (
              <StyledTableRow key={material.id} className={material.purchased ? 'purchased' : ''}>
                <StyledTableCell>
                  <Checkbox
                    checked={material.purchased}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </StyledTableCell>
                <StyledTableCell>{material.name}</StyledTableCell>
                <StyledTableCell>{material.neededquantity - material.quantity}</StyledTableCell>
                <StyledTableCell>
                  <TextField
                    size="small"
                    value={(parseFloat(material.price.replace('$', '').replace(',', '.'))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$','')} // Use o valor original aqui
                    onChange={(e) => handleValueChange(index, e.target.value)}
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
      <StyledButton
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </StyledButton>
    </div>
  );
};

export default ShoppingList;
