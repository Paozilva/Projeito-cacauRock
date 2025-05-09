var domain = window.location.hostname;

document.getElementById('frmLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const notificacao = document.getElementById('notificacao') || criarNotificacao();
    const id = "";
    const nome = "";
    const login = document.getElementById('txtLogin').value.trim();
    const senha = document.getElementById('txtSenha').value.trim();
    const tipo = 'login';

    if (login.length === 0) {
        notificacao.innerText = "É necessário digitar um login para continuar!";
        alert("É necessário digitar um login para continuar!");
        document.getElementById('txtLogin').focus();
        return;
    }

    if (senha.length === 0) {
        notificacao.innerText = "É necessário digitar uma senha para continuar!";
        alert("É necessário digitar uma senha para continuar!");
        document.getElementById('txtSenha').focus();
        return;
    }

    try {
        const response = await fetch('/api/mysql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, login, senha, tipo, id, domain })
        });

        if (!response.ok) {
            const erroTexto = await response.text();
            throw new Error(`Erro ${response.status}: ${erroTexto}`);
        }

        const result = await response.json();
        notificacao.innerText = result.message || "Login efetuado.";

        if (result.error) {
            alert(result.error);
            document.getElementById('txtLogin').focus();
            return;
        }

        localStorage.setItem('usuario_logado', result.id);
        window.setTimeout(() => {
            window.open('./index.html', '_self');
        }, 2000);

    } catch (err) {
        notificacao.innerText = `Erro inesperado: ${err.message}`;
        alert(`Erro inesperado: ${err.message}`);
    }
});

function criarNotificacao() {
    const h6 = document.createElement('h6');
    h6.id = 'notificacao';
    h6.className = 'mt-3 text-danger text-center';
    document.getElementById('frmLogin').appendChild(h6);
    return h6;
}
