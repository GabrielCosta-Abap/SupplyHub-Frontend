import React, { useState } from 'react';
import '../css/Menu.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home'; 
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Home from './Home';
import MateriaPrima from './MateriaPrima';

function Menu({user}) {
    
    const [fragment, setFragment] = useState('home');
    const [showIconsOnly, setShowIconsOnly] = useState(false);
    
    if (!user) {
        return <div>Loading...</div>;
      }
    const handleItemClick = (item) => {
        setFragment(item);
    };

    const toggleMenu = () => {
        setShowIconsOnly(!showIconsOnly);
    };

    return (
        <div className="container">
            <div className="side-menu">
                {/* <div className="menu-header"> */}
                    <IconButton onClick={toggleMenu} className='side-menu-icon-burger' >
                        <MenuIcon fontSize="large" className='side-menu-burger' />
                    </IconButton>
                {/* </div> */}
                <List className={`home-lateral-menu ${showIconsOnly ? 'icons-only' : ''}`}>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('home')}>
                        <HomeIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Início" />}
                    </ListItem>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('materia-prima')}>
                        <AppRegistrationIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Matéria prima" />}
                    </ListItem>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('produtos')}>
                        <LibraryAddIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Produtos" />}
                    </ListItem>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('registrar-venda')}>
                        <PointOfSaleIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Registrar venda" />}
                    </ListItem>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('emitir-lista')}>
                        <ShoppingCartIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Emitir lista de compras" />}
                    </ListItem>
                    <ListItem button className='menu-item' onClick={() => handleItemClick('relatorio-vendas')}>
                        <AssessmentIcon fontSize="large" />
                        {!showIconsOnly && <ListItemText primary="Relatório de vendas" />}
                    </ListItem>
                </List>
            </div>
            <div className="content">
                {fragment === 'home' && <Home user={user}/>}
                {fragment === 'materia-prima' && <MateriaPrima />}
                {fragment === 'produtos' && <h1>Você está na página de Matéria Produtos</h1>}
                {fragment === 'registrar-venda' && <h1>Registrar venda</h1>}
                {fragment === 'emitir-lista' && <h1>Emitir lista de compras</h1>}
                {fragment === 'relatorio-vendas' && <h1>Relatório de vendas</h1>}
            </div>
        </div>
    );
}

export default Menu;
