import '../css/Home.css';

export default function Home({user}){

    console.log(user.name)

    return (
        <div className='home'>
            <h1>Olá, {user.name}! Bem-vindo ao Supply Hub!</h1>
        </div>
    )
}