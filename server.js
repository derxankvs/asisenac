const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Caminhos para arquivos JSON
const dataDir = path.join(__dirname, 'data');
const usuariosPath = path.join(dataDir, 'usuarios.json');
const contatosPath = path.join(dataDir, 'contatos.json');
const cargasPath = path.join(dataDir, 'cargas.json');

// Função para garantir que a pasta 'data' exista
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Função para ler JSON de arquivo, criando se não existir
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      // Cria arquivo vazio com array
      fs.writeFileSync(filePath, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erro ao ler ${filePath}:`, err);
    return [];
  }
}

// Função para escrever JSON no arquivo
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Erro ao escrever ${filePath}:`, err);
  }
}

// POST /api/cadastrar
app.post('/api/cadastrar', (req, res) => {
  const novo = req.body;
  if (!novo || !novo.cpf || !novo.funcao) {
    return res.status(400).json({ sucesso: false, erro: 'Dados incompletos' });
  }

  ensureDataDir();

  // Define arquivo baseado na função
  const filePath = novo.funcao === 'maior' ? contatosPath : usuariosPath;

  const lista = readJson(filePath);

  if (lista.some(u => u.cpf === novo.cpf)) {
    return res.json({ sucesso: false, mensagem: 'CPF já cadastrado' });
  }

  lista.push(novo);
  writeJson(filePath, lista);

  res.json({ sucesso: true });
});

// POST /api/remover
app.post('/api/remover', (req, res) => {
  const { cpf } = req.body;
  if (!cpf) {
    return res.status(400).json({ sucesso: false, erro: 'CPF não fornecido' });
  }

  ensureDataDir();

  let alterado = false;

  [usuariosPath, contatosPath].forEach(file => {
    let lista = readJson(file);
    const novaLista = lista.filter(u => u.cpf !== cpf);
    if (novaLista.length !== lista.length) {
      alterado = true;
      writeJson(file, novaLista);
    }
  });

  res.json({ sucesso: alterado });
});

// Gera ID simples (6 caracteres alfanuméricos)
function gerarId() {
  return Math.random().toString(36).substring(2, 8);
}

// POST /api/cargas
app.post('/api/cargas', (req, res) => {
  const { setor, itens } = req.body;
  if (!setor || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  ensureDataDir();

  const lista = readJson(cargasPath);
  const id = gerarId();

  lista.push({ id, setor, itens });
  writeJson(cargasPath, lista);

  res.json({ id });
});

// GET /api/cargas/:id
app.get('/api/cargas/:id', (req, res) => {
  const lista = readJson(cargasPath);
  const carga = lista.find(c => c.id === req.params.id);
  if (!carga) return res.json({ erro: true });
  res.json(carga);
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
