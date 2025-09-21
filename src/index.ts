import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { AppDataSource } from './data-source';
import { Status } from './entity/Status';
import { Blog } from './entity/Blog';
import { Usuario } from './entity/Usuario';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { autenticarJWT } from './middleware/autenticarJWT';

// Extende o tipo Request para incluir 'usuario'
declare global {
  namespace Express {
    interface Request {
      usuario?: any;
    }
  }
}

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Blog',
      version: '1.0.0',
      description: 'Documentação da API do Blog',
    },
  },
  apis: ['./src/index.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
/**
 * @openapi
 * /login:
 *   post:
 *     summary: Autenticação de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT gerado
 *       401:
 *         description: Credenciais inválidas
 */
app.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
    }
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOneBy({ login });
    if (!usuario) {
      return res.status(401).json({ error: 'Login ou senha inválidos.' });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Login ou senha inválidos.' });
    }
    const token = jwt.sign(
      { id: usuario.id, login: usuario.login, nome: usuario.nome },
      process.env.JWT_SECRET || 'segredo_super_secreto',
      { expiresIn: '2d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao autenticar.' });
  }
});
/**
 * @openapi
 * /usuarios:
 *   post:
 *     summary: Cadastro de novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               login:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Dados inválidos ou login já existente
 */
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, login, senha } = req.body;
    if (!nome || !login || !senha) {
      return res.status(400).json({ error: 'Nome, login e senha são obrigatórios.' });
    }
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const existente = await usuarioRepo.findOneBy({ login });
    if (existente) {
      return res.status(400).json({ error: 'Login já cadastrado.' });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = usuarioRepo.create({ nome, login, senha: senhaHash });
    const salvo = await usuarioRepo.save(novoUsuario);
    // Não retorna a senha
    const { senha: _, ...usuarioSemSenha } = salvo;
    res.status(201).json(usuarioSemSenha);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

/**
 * @openapi
 * /:
 *   get:
 *     summary: Retorna status da API
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

/**
 * @openapi
 * /status:
 *   get:
 *     summary: Lista todos os status
 *     responses:
 *       200:
 *         description: Lista de status
 */
app.get('/status', async (req, res) => {
  try {
    const statusRepo = AppDataSource.getRepository(Status);
    const allStatus = await statusRepo.find();
    res.json(allStatus);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /status:
 *   post:
 *     summary: Cria um novo status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Status criado
 */
app.post('/status', async (req, res) => {
  try {
    const { label, order, is_active } = req.body;
    const statusRepo = AppDataSource.getRepository(Status);
    const newStatus = statusRepo.create({ label, order, is_active });
    const savedStatus = await statusRepo.save(newStatus);
    res.status(201).json(savedStatus);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blogs:
 *   get:
 *     summary: Lista todos os blogs
 *     responses:
 *       200:
 *         description: Lista de blogs
 */
app.get('/blogs', async (req, res) => {
  try {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blogs = await blogRepo.find({ relations: ['status', 'usuario'] });
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blog-alunos:
 *   get:
 *     summary: Lista apenas os blogs publicados (statusId = 1)
 *     responses:
 *       200:
 *         description: Lista de blogs publicados
 */
app.get('/blog-alunos', async (req, res) => {
  try {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blogs = await blogRepo.find({ where: { statusId: 1 }, relations: ['status', 'usuario'] });
    const result = blogs.map(blog => ({
      id: blog.id,
      titulo: blog.title,
      createdDateTime: blog.createdDateTime,
      updatedDateTime: blog.updatedDateTime,
      autor: blog.usuario.nome
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blog-alunos/busca:
 *   get:
 *     summary: Busca blogs publicados por título e/ou conteúdo
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Título do blog
 *       - in: query
 *         name: content
 *         schema:
 *           type: string
 *         required: false
 *         description: Conteúdo do blog
 *     responses:
 *       200:
 *         description: Lista de blogs encontrados
 */
app.get('/blog-alunos/busca', async (req, res) => {
  try {
    const { title, content } = req.query;
    const blogRepo = AppDataSource.getRepository(Blog);
    let blogs;
    if (title || content) {
      blogs = await blogRepo.createQueryBuilder('blog')
        .leftJoinAndSelect('blog.usuario', 'usuario')
        .where('blog.statusId = :statusId', { statusId: 1 })
        .andWhere(title ? 'LOWER(blog.title) LIKE LOWER(:title)' : '1=1', { title: `%${title || ''}%` })
        .andWhere(content ? 'LOWER(blog.content) LIKE LOWER(:content)' : '1=1', { content: `%${content || ''}%` })
        .getMany();
    } else {
      blogs = await blogRepo.find({ where: { statusId: 1 } });
    }
    const result = blogs.map(blog => ({
      id: blog.id,
      titulo: blog.title,
      autor: blog.usuario ? blog.usuario.nome : null,
      createdDateTime: blog.createdDateTime,
      updatedDateTime: blog.updatedDateTime
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blogs/{id}:
 *   get:
 *     summary: Busca blog por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog encontrado
 *       404:
 *         description: Blog não encontrado
 */
app.get('/blogs/:id', async (req, res) => {
  try {
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOne({ where: { id: Number(req.params.id) }, relations: ['status', 'usuario'] });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blogs:
 *   post:
 *     summary: Cria um novo blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               statusId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Blog criado
 */
app.post('/blogs', autenticarJWT, async (req, res) => {
  try {
    const { title, content, statusId } = req.body;
    const usuarioId = req.usuario.id; // Pega o ID do usuário autenticado

    const blogRepo = AppDataSource.getRepository(Blog);
    const newBlog = blogRepo.create({ title, content, statusId, usuarioId });
    const savedBlog = await blogRepo.save(newBlog);
    res.status(201).json(savedBlog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blogs/{id}:
 *   put:
 *     summary: Atualiza um blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               statusId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Blog atualizado
 *       404:
 *         description: Blog não encontrado
 */
app.put('/blogs/:id', async (req, res) => {
  try {
    const { title, content, statusId } = req.body;
    const usuarioId = req.usuario.id;
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOneBy({ id: Number(req.params.id) });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    blog.title = title ?? blog.title;
    blog.content = content ?? blog.content;
    blog.statusId = statusId ?? blog.statusId;
    blog.usuarioId = usuarioId;
    const updatedBlog = await blogRepo.save(blog);
    res.json(updatedBlog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /blogs/{id}:
 *   delete:
 *     summary: Remove um blog
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog removido
 *       404:
 *         description: Blog não encontrado
 */
app.delete('/blogs/:id', async (req, res) => {
  try {
    const blogRepo = AppDataSource.getRepository(Blog);
    const result = await blogRepo.delete(Number(req.params.id));
    if (result.affected === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Inicialização do banco e servidor
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      app.listen(3000, '0.0.0.0', () => {
        console.log('Server running on port 3000');
      });
      console.log('Database connected!');
    })
    .catch((error) => {
      console.error('Error during Data Source initialization:', error);
    });
}

export default app;
