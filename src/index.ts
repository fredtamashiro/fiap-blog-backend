import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { AppDataSource } from './data-source';
import { Status } from './entity/Status';
import { Blog } from './entity/Blog';

const app = express();
app.use(express.json());

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
    const blogs = await blogRepo.find({ relations: ['status'] });
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
    const blogs = await blogRepo.find({ where: { statusId: 1 }, relations: ['status'] });
    const result = blogs.map(blog => ({
      id: blog.id,
      titulo: blog.title,
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
    const blog = await blogRepo.findOne({ where: { id: Number(req.params.id) }, relations: ['status'] });
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
app.post('/blogs', async (req, res) => {
  try {
    const { title, content, statusId } = req.body;
    const blogRepo = AppDataSource.getRepository(Blog);
    const newBlog = blogRepo.create({ title, content, statusId });
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
    const blogRepo = AppDataSource.getRepository(Blog);
    const blog = await blogRepo.findOneBy({ id: Number(req.params.id) });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    blog.title = title ?? blog.title;
    blog.content = content ?? blog.content;
    blog.statusId = statusId ?? blog.statusId;
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
      app.listen(3000, () => {
        console.log('Server running on port 3000');
      });
      console.log('Database connected!');
    })
    .catch((error) => {
      console.error('Error during Data Source initialization:', error);
    });
}

export default app;
