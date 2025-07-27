import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../src/data-source';
import { Status } from '../src/entity/Status';
import { Blog } from '../src/entity/Blog';
import app from '../src/index';

describe('GET /', () => {
  it('deve retornar status da API', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'API is running!');
  });
});
