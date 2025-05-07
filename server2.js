// server.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 80;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/mysql', async (req, res) => {

    const { nome, login, senha, tipo, id, domain } = req.body;

    // Aqui estou definindo as variáveis padrão para uso na conexão com o servidor mysql local
    var srvHost = '127.0.0.1';
    var srvUser = 'root';
    var srvPassword = 'senac@02';
    var srvDatabase = 'salinet';

    // Aqui estou definindo as variáveis padrão para uso na conexão com o servidor mysql remoto
    if (domain != "localhost") {
        srvHost = 'sql.freedb.tech';
        srvUser = 'freedb_salinet';
        srvPassword = 'Eecj!x9yxK#ZUkU';
        srvDatabase = 'freedb_salinet';
    }

    const pool = mysql.createPool({
        host: srvHost,
        user: srvUser,
        password: srvPassword,
        database: srvDatabase
    });

    switch (tipo) {
        case 'cadastro':
            var strSql = "";
            try {
                strSql = "select * from `" + srvDatabase + "`.`tbl_login` where `login` = '" + login + "';";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length == 1) {
                    res.json({ 
                        message: 'Login já cadastrado!',
                        error: 'Favor digitar outro login!'
                    });
                    // version 1.0.1: correção de bug que permite cadastrar dois usuários com mesmo login
                    // depois esta correção se transformará em uma feature (melhoria) que vai ser versionada na próxima versão da feature, ou seja: 
                    // version: 1.1.0
                } else {
                    var [rows, fields] = await pool.query(
                        "insert into `" + srvDatabase + "`.`tbl_login` (`nome`, `login`, `senha`) values ('" + nome + "', '" + login + "', md5('" + senha + "'));"
                    );
                    if (rows.affectedRows > 0) {
                        res.json({ message: 'Usuário cadastrado com sucesso!' });
                    } else {
                        throw ('Não foi possível cadastrar o usuário!');
                    }
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de cadastro: ${err} ${domain}`,
                    error: `Erro de cadastro: ${err} ${domain}`
                });
            }
            break;
        case 'login':
            var strSql = "";
            try {
                strSql = "select * from `" + srvDatabase + "`.`tbl_login` where `login` = '" + login + "' and `senha` = md5('" + senha + "');";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length == 1) {
                    res.json({ 
                        message: 'Usuário logado com sucesso! Redirecionando...',
                        id: rows[0].id
                    });
                } else {
                    throw ("Não foi possível logar o usuário! Cadastro inválido ou duplicado.");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de login: ${err}`,
                    error: `Erro de login: ${err}`
                });
            }
            break;
        case 'primeiro':
        case 'leitura':
            try {
                var addNome = "";
                var addLogin = "";
                var addAnd = "";

                if (nome.trim().length > 0) {
                    addNome = " `nome` like '%" + nome + "%' ";
                }

                if (login.trim().length > 0) {
                    addLogin = " `login` like '%" + login + "%' ";
                }

                if (nome.trim().length > 0 && login.trim().length > 0) {
                    addAnd = " and ";
                }

                var strSql = "select * from `" + srvDatabase + "`.`tbl_login` where" + 
                    addNome + addAnd + addLogin + " order by `id` asc;";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length > 0) {
                    res.json({ 
                        message: 'Nome ou login encontrado com sucesso!',
                        id: rows[0].id,
                        nome: rows[0].nome,
                        login: rows[0].login,
                        linhas: rows
                    });
                } else {
                    throw ("Não foi possível encontrar o nome ou login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de leitura: ${err}`,
                    error: `Erro de leitura: ${err}`
                });
            }
            break;
        case 'anterior':
            var strSql = "";
            try {
                var addId = "";
                var addNome = "";
                var addLogin = "";

                if (typeof(nome) != undefined) {
                    addNome = " `nome` like '%" + nome + "%' ";
                }

                if (typeof(login) != undefined) {
                    addLogin = " `login` like '%" + login + "%' ";
                }

                if (typeof(nome) != undefined && typeof(login) != undefined) {
                    addLogin = " and " + addLogin;
                }

                if (typeof(id) != undefined) {
                    addId = " `id` < " + id + " ";
                }

                if (typeof(nome) != undefined && typeof(id) != undefined) {
                    addId = " and " + addId;
                } else if (typeof(login) != undefined && typeof(id) != undefined) {
                    addId = " and " + addId;
                }

                var strSql = "select * from `" + srvDatabase + "`.`tbl_login` where" + 
                    addNome + addLogin + addId + " order by `id` desc;";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length > 0) {
                    res.json({
                        message: 'Nome ou login encontrado com sucesso!',
                        id: rows[0].id,
                        nome: rows[0].nome,
                        login: rows[0].login,
                        linhas: rows
                    });
                } else {
                    throw ("Não foi possível encontrar o nome ou login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de anterior: ${err}`,
                    error: `Erro de anterior: ${err}`
                });
            }
            break;
        case 'proximo':
            var strSql = "";
            try {
                var addId = "";
                var addNome = "";
                var addLogin = "";

                if (typeof(nome) != undefined) {
                    addNome = " `nome` like '%" + nome + "%' ";
                }

                if (typeof(login) != undefined) {
                    addLogin = " `login` like '%" + login + "%' ";
                }

                if (typeof(nome) != undefined && typeof(login) != undefined) {
                    addLogin = " and " + addLogin;
                }

                if (typeof(id) != undefined) {
                    addId = " `id` > " + id + " ";
                }

                if (typeof(nome) != undefined && typeof(id) != undefined) {
                    addId = " and " + addId;
                } else if (typeof(login) != undefined && typeof(id) != undefined) {
                    addId = " and " + addId;
                }

                strSql = "select * from `" + srvDatabase + "`.`tbl_login` where" + 
                    addNome + addLogin + addId + " order by `id` asc;";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length > 0) {
                    res.json({
                        message: 'Nome ou login encontrado com sucesso!',
                        id: rows[0].id,
                        nome: rows[0].nome,
                        login: rows[0].login,
                        linhas: rows
                    });
                } else {
                    // throw ("Não foi possível encontrar o nome ou login!");
                    throw ("Não foi possível encontrar o nome ou login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de próximo: ${err}`,
                    error: `Erro de próximo: ${err}`
                });
            }
            break;
        case 'ultimo':
            try {
                var addNome = "";
                var addLogin = "";
                var addAnd = "";

                if (nome.trim().length > 0) {
                    addNome = " `nome` like '%" + nome + "%' ";
                }

                if (login.trim().length > 0) {
                    addLogin = " `login` like '%" + login + "%' ";
                }

                if (nome.trim().length > 0 && login.trim().length > 0) {
                    addAnd = " and ";
                }

                var strSql = "select * from `" + srvDatabase + "`.`tbl_login` where" + 
                    addNome + addAnd + addLogin + " order by `id` desc;";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length > 0) {
                    res.json({
                        message: 'Nome ou login encontrado com sucesso!',
                        id: rows[0].id,
                        nome: rows[0].nome,
                        login: rows[0].login,
                        linhas: rows
                    });
                } else {
                    // throw ("Não foi possível encontrar o nome ou login!");
                    throw ("Não foi possível encontrar o nome ou login! sql: " + strSql);
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de último: ${err}`,
                    error: `Erro de último: ${err}`
                });
            }
            break;
        case 'atualizacao':
            try {
                var strSql = "select * from `" + srvDatabase + "`.`tbl_login` order by `id` asc;";
                var [rows, fields] = await pool.query(strSql);
                if (rows.length > 0) {
                    res.json({ 
                        message: 'Nome, login e senhas encontrados com sucesso!',
                        rows: rows
                    });
                } else {
                    throw ("Não há registro algum na tabela tbl_login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de atualização: ${err}`,
                    error: `Erro de atualização: ${err}`
                });
            }
            break;
        case 'atualizar':
            try {
                var addId = "";
                var addNome = "";
                var addLogin = "";
                var addSenha = "";
                var addAnd = "";

                if (id.trim().length > 0) {
                    addId = id;
                }

                if (nome.trim().length > 0) {
                    addNome = " `nome` = '" + nome + "' ";
                }

                if (login.trim().length > 0) {
                    addLogin = " `login` = '" + login + "' ";
                }

                if (addNome.length > 0) {
                    addLogin = " , " + addLogin;
                }

                if (senha.trim().length > 0) {
                    addSenha = " `senha` = md5('" + senha + "') ";
                }

                if (addLogin.length > 0) {
                    addSenha = " , " + addSenha;
                }

                var strSql = "update `" + srvDatabase + "`.`tbl_login` set " + 
                    addNome + addLogin + addSenha + 
                    " where `id` = " + addId + ";";
                var [rows, fields] = await pool.query(strSql);
                if (rows.affectedRows > 0) {
                    res.json({ 
                        message: 'Registro atualizado com sucesso!'
                    });
                } else {
                    throw ("Não foi possível atualizar o id: " + addId + " na tabela tbl_login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de atualizar: ${err}`,
                    error: `Erro de atualizar: ${err}`
                });
            }
            break;
        case 'remover':
            try {
                var addId = "";

                if (id.trim().length > 0) {
                    addId = id;
                }

                var strSql = "delete from `" + srvDatabase + "`.`tbl_login` where `id` = " + addId + ";";
                var [rows, fields] = await pool.query(strSql);
                if (rows.affectedRows > 0) {
                    res.json({ 
                        message: 'Registro removido com sucesso!'
                    });
                } else {
                    throw ("Não foi possível remover o id: " + addId + " na tabela tbl_login!");
                }
            } catch (err) {
                // console.error(err); // aqui não vai aparecer o erro no console, pois este arquivo não é processado pelo frontend, mas sim pelo backend (node server.js)
                res.status(500).json({ 
                    message: `Erro de remover: ${err}`,
                    error: `Erro de remover: ${err}`
                });
            }
            break;
        default:
            throw ("Não foi possível identificar o tipo!");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});