const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); 

// CONFIGURAÇÃO DO SEU POSTGRESQL
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'painelmanutencao', // <- Garanta que está o nome do seu banco real aqui
  password: '1406', // <- Garanta que está a sua senha real aqui
  port: 5432,
});

// 1. ROTA DE LOGIN (Adicionada agora)
app.post('/api/login', async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const query = 'SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2';
    const resultado = await pool.query(query, [usuario, senha]);

    if (resultado.rows.length > 0) {
      res.json({ mensagem: 'Login realizado com sucesso!' });
    } else {
      res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no banco de dados durante a autenticação.' });
  }
});

// 2. ROTA PARA SALVAR OCORRÊNCIA
app.post('/api/ocorrencias', async (req, res) => {
  const { parquimetro, tipo_erro } = req.body;
  try {
    const query = 'INSERT INTO ocorrencias (parquimetro, tipo_erro) VALUES ($1, $2) RETURNING *';
    const resultado = await pool.query(query, [parquimetro, tipo_erro]);
    res.status(201).json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao salvar o relatório.' });
  }
});

// 3. ROTA PARA LISTAR OCORRÊNCIAS
app.get('/api/ocorrencias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM ocorrencias ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar relatórios.' });
  }
});

// 4. ROTA PARA DAR BAIXA
app.put('/api/ocorrencias/:id/concluir', async (req, res) => {
  const { id } = req.params;
  try {
    const query = "UPDATE ocorrencias SET status = 'Concluído' WHERE id = $1 RETURNING *";
    const resultado = await pool.query(query, [id]);
    res.json({ mensagem: 'Ocorrência finalizada!' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar o status.' });
  }
});

app.listen(3000, () => {
  console.log('Servidor de Manutenção rodando em http://localhost:3000');
});
