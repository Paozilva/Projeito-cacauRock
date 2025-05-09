var domain = window.location.hostname;

document.getElementById('frmCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = "";
    const nome = document.getElementById('txtNome').value.trim();
    const login = document.getElementById('txtEmail').value.trim();
    const senha = document.getElementById('txtSenha').value.trim();
    const confirmacaoSenha = document.getElementById('txtConfirmacaoSenha').value.trim();
    const notificacao = document.getElementById('notificacao');

    const tipo = 'cadastro';

    if (nome.length == 0) {
        notificacao.innerText = "É necessário digitar um nome para continuar!";
        alert("É necessário digitar um nome para continuar!");
        document.getElementById('txtNome').focus();
        return;
    }

    if (login.length == 0) {
        notificacao.innerText = "É necessário digitar um login para continuar!";
        alert("É necessário digitar um login para continuar!");
        document.getElementById('txtEmail').focus();
        return;
    }

    if (senha.length == 0) {
        notificacao.innerText = "É necessário digitar uma senha para continuar!";
        alert("É necessário digitar uma senha para continuar!");
        document.getElementById('txtSenha').focus();
        return;
    }

    if (senha !== confirmacaoSenha) {
        notificacao.innerText = "Senhas não conferem!";
        alert("Senhas não conferem!");
        document.getElementById('txtConfirmacaoSenha').focus();
        return;
    }

    try {
        const response = await fetch('/api/mysql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, login, senha, id, domain, tipo })
        });

        if (!response.ok) {
            const erroTexto = await response.text();
            throw new Error(`Erro ${response.status}: ${erroTexto}`);
        }

        const result = await response.json();
        let msgErro = (result.error) ? " " + result.error : "";
        notificacao.innerText = result.message + msgErro;
        alert(result.message + msgErro);

        if (result.error) {
            document.getElementById('txtEmail').focus();
            return;
        }

        let url = new URL(window.location);
        let params = new URLSearchParams(url.search);
        let getRedirect = params.get('redirect');

        if (getRedirect === null || getRedirect === undefined || getRedirect === 'true') {
            window.setTimeout(() => {
                window.open('./login.html', '_self');
            }, 3000);
        }

    } catch (err) {
        notificacao.innerText = `Erro inesperado: ${err.message}`;
        alert(`Erro inesperado: ${err.message}`);
    }
});
