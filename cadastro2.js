var domain = window.location.hostname;

document.getElementById('frmCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const txtNome = document.getElementById('txtNome');
    const txtLogin = document.getElementById('txtLogin');
    const txtSenha = document.getElementById('txtSenha');
    const txtConfirmacaoSenha = document.getElementById('txtConfirmacaoSenha');

    const id = "";
    const nome = txtNome.value.trim();
    const login = txtLogin.value.trim();
    const senha = txtSenha.value.trim();
    const confirmacaoSenha = txtConfirmacaoSenha.value.trim();

    const notificacao = document.getElementById('notificacao');
    const tipo = 'cadastro';

    if (nome.length == 0) {
        notificacao.innerText = "É necessário digitar um nome para continuar!";
        txtNome.focus();
        return false;
    }

    if (login.length == 0) {
        notificacao.innerText = "É necessário digitar um login para continuar!";
        txtLogin.focus();
        return false;
    }

    if (senha.length == 0) {
        notificacao.innerText = "É necessário digitar uma senha para continuar!";
        txtSenha.focus();
        return false;
    }

    if (senha != confirmacaoSenha) {
        notificacao.innerText = "Senhas não conferem!";
        txtConfirmacaoSenha.focus();
        return false;
    }

    const response = await fetch('/api/mysql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, login, senha, tipo, id, domain })
    });

    const result = await response.json();
    console.log(result.message);
    let msgErro = (result.error) ? " " + result.error : "";
    notificacao.innerText = result.message + msgErro;

    // essa linha vai verificar se há uma mensagem de erro e vai impedir a janela de fechar automaticamente
    if (result.error) {
        txtLogin.focus();
        return false;
    }

    // As linhas abaixo irão manipular a leitura do parâmetro: "redirect" que está localizado na url, por exemplo: http://localhost:3000/cadastro.html?redirect=false, ou seja, será possível identificar se o parâmetro: "redirect" existe na url
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);
    let getRedirect = params.get('redirect');

    if (typeof(getRedirect) == undefined || typeof(getRedirect) == null) {
        window.setTimeout(() => {
            window.open('./login.html', '_self');
        }, 5000);
    }
});

function limparCampos() {
    document.getElementById('txtNome').value = "";
    document.getElementById('txtLogin').value = "";
    document.getElementById('txtSenha').value = "";
    document.getElementById('txtNome').focus();
    document.getElementById('notificacao').innerText = "Comece digitando um Nome, depois Login e por fim a Senha. (TODOS OS CAMPOS SÃO OBRIGATÓRIOS!)";
}

limparCampos();