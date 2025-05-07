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

    var srvHost = '127.0.0.1';
    var srvUser = 'root';
    var srvPassword = 'senac@02';
    var srvDatabase = 'cacau_rock';

    if (domain != "localhost") {
        srvHost = 'sql.freedb.tech';
        srvUser = 'freedb_cacau_rock';
        srvPassword = '%utdX@3uQp$t&ZQ';
        srvDatabase = 'freedb_cacau_rock';
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
                        message: 'Usuário logado com sucesso',
                        id: rows[0].id
                    });
                } else {
                    throw ("Não foi possível logar o usuário! Cadastro inválido ou duplicado.");
                }
            } catch (err) {
                res.status(500).json({ 
                    message: `Erro de login: ${err}`,
                    error: `Erro de login: ${err}`
                });

            break;
       }
    }   
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});