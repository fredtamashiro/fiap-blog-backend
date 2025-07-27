
import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data-source';
import { Status } from '../entity/Status';
import { Blog } from '../entity/Blog';

describe('API Blog - Rotas principais', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Garante pelo menos um status e um blog publicado para os testes
    const statusRepo = AppDataSource.getRepository(Status);
    let status = await statusRepo.findOneBy({ id: 1 });
    if (!status) {
      status = statusRepo.create({ id: 1, label: 'Publicado', order: 1, is_active: true });
      await statusRepo.save(status);
    }
    const blogRepo = AppDataSource.getRepository(Blog);
    const blogCount = await blogRepo.countBy({ statusId: 1 });
    if (blogCount === 0) {
      await blogRepo.save(blogRepo.create({
        title: 'Blog de Teste',
        content: 'Conteúdo de teste',
        statusId: 1,
        createdDateTime: new Date(),
        updatedDateTime: new Date()
      }));
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
  it('GET / deve retornar status da API', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'API is running!');
  });

  it('GET /status deve retornar array', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /blogs deve retornar array', async () => {
    const res = await request(app).get('/blogs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /blog-alunos deve retornar apenas blogs publicados', async () => {
    const res = await request(app).get('/blog-alunos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('titulo');
      expect(res.body[0]).toHaveProperty('createdDateTime');
      expect(res.body[0]).toHaveProperty('updatedDateTime');
    }
  });

  it('GET /blog-alunos/busca?title=abc deve filtrar por título', async () => {
    const res = await request(app).get('/blog-alunos/busca?title=abc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /blogs/99999 deve retornar 404 para blog inexistente', async () => {
    const res = await request(app).get('/blogs/99999');
    expect(res.statusCode).toBe(404);
  });
});
