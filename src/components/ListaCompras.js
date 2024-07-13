import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, TextField, Button, Paper } from '@mui/material';
import API from '../service/API.js';
import { styled } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';

const StyledTableContainer = styled(TableContainer)({
  '@media (max-width: 600px)': {
    width: '100%',
    padding: '10px',
  },
});

const StyledTable = styled(Table)({
  '@media (max-width: 600px)': {
    display: 'block',
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '@media (max-width: 600px)': {
    display: 'block',
    textAlign: 'right',
    position: 'relative',
    paddingLeft: '50%',
    '&:before': {
      content: 'attr(data-label)',
      position: 'absolute',
      left: 0,
      width: '45%',
      paddingLeft: '10px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // '&.purchased': {
  //   textDecoration: 'line-through',
  // },
  // '@media (max-width: 600px)': {
  //   display: 'block',
  //   marginBottom: '15px',
  // },
}));

const StyledButton = styled(Button)({
  marginTop: '20px',
});

const ListaCompras = () => {
  const [materials, setMaterials] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    API.get('/compras')
      .then(response => {
        response.data.forEach(element => {
          element.price = element.price.replace('$', '').replace('.', ',');
        });

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
    newMaterials[index].price = value;
    setMaterials(newMaterials);
  };

  const handleSave = () => {
    setIsSaving(true);
    const materialsToSave = materials.map(material => ({
      ...material,
      quantity: material.purchased === true ? material.neededquantity : material.quantity, 
      price: parseFloat(material.price.replace(',', '.')),
    }));

    API.put('/material', materialsToSave)
      .then(response => {
        setIsSaving(false);
        console.log("Data saved successfully");
      })
      .catch(error => {
        setIsSaving(false);
        console.error("Error saving data:", error);
      });
  };

  const calculateTotal = (material) => {
    const price = parseFloat(material.price.replace(',', '.'));
    const quantityToBuy = material.neededquantity - material.quantity;
    return price * quantityToBuy;
  };

  const totalSum = materials.reduce((sum, material) => sum + calculateTotal(material), 0);
  const formattedTotalSum = totalSum.toFixed(2).toString().replace('.', ',');

  return (
    <div>
      <StyledTableContainer component={Paper}>
        <StyledTable aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell data-label="Checkbox">Checkbox</StyledTableCell>
              <StyledTableCell data-label="Material">Material</StyledTableCell>
              <StyledTableCell data-label="Comprar">Comprar</StyledTableCell>
              <StyledTableCell data-label="Val. Última Compra">Val. Última Compra</StyledTableCell>
              <StyledTableCell data-label="Total">Total</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((material, index) => (
              <StyledTableRow key={material.id} className={material.purchased ? 'purchased' : ''}>
                <StyledTableCell data-label="Checkbox">
                  <Checkbox
                    checked={material.purchased}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </StyledTableCell>
                <StyledTableCell data-label="Material">{material.name}</StyledTableCell>
                <StyledTableCell data-label="Comprar">{material.neededquantity - material.quantity}</StyledTableCell>
                <StyledTableCell data-label="Val. Última Compra">
                  <TextField
                    size="small"
                    value={material.price}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                  />
                </StyledTableCell>
                <StyledTableCell data-label="Total">{calculateTotal(material).toFixed(2).toString().replace('.', ',')}</StyledTableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow className='totalizadorCompras'>
              <StyledTableCell colSpan={4} data-label="Total">Total</StyledTableCell>
              <StyledTableCell data-label="Total">{formattedTotalSum}</StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
      <div className="footerbar">
        <Button disabled={isSaving} onClick={handleSave} type="submit" className="form-button btn-salvar" startIcon={<SaveIcon />}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </div>
  );
};

export default ListaCompras;
