import { useState } from "react";
import { Button } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import API from '../service/API';
import Menu from "./Menu";

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post('/login',
                JSON.stringify({ email, password }),
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            setUser(response.data[0]);

        } catch (error) {

            if (!error?.response) {
                setError('Erro ao acessar o servidor');
            } else if (error.response.status === 401) {
                setError('Usuário ou senha inválidos');
            }

        }

    }

    const handleLogoff = (e) => {
        e.preventDefault();
        setUser(null);
        setError('');
    }

    return (

        <div>

            {user == null ? (

            <div className="login-body">

                <div className='login-form-wrap'>
                    <h2>
                        Login
                    </h2>
                    <form className='login-form'>
                        <input type='email'
                            name='email'
                            placeholder='E-mail'
                            onChange={(e) => setEmail(e.target.value)}
                            required />

                        <input type='password'
                            name='password'
                            placeholder='Senha'
                            onChange={(e) => setPassword(e.target.value)}
                            required />

                        <button type='submit'
                            className='btn-login'
                            onClick={(e) => handleLogin(e)}>Login</button>

                    </form>
                    <p>{error}</p>
                </div>
            </div>    

            ) : (
                <>
                    <header className="app-header">
                        <div className="header-content">
                            <h1>Bem vindo ao Supply Hub, {user.name}!</h1>
                            <Button className="logoff-button"
                                variant="contained"
                                color="primary"
                                onClick={handleLogoff}
                                startIcon={<ExitToAppIcon />}
                                >
                                Logoff
                            </Button>
                        </div>
                    </header>
                    <Menu user={user} />
                </>
            )}


        </div>
    )
}

export default Login;
