import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_ENV = 'test';

const listMock = vi.fn();
const chatMock = vi.fn();
const generateMock = vi.fn();
const OllamaMock = vi.fn().mockImplementation(function () {
  return {
    list: listMock,
    chat: chatMock,
    generate: generateMock,
  };
});

vi.mock('ollama', () => ({
  __esModule: true,
  Ollama: OllamaMock,
}));

const { app } = await import('../server.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ai-server routes', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('ai-server');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('lists available models', async () => {
    listMock.mockResolvedValueOnce({ models: [{ name: 'model-a' }] });

    const res = await request(app).get('/models').expect(200);

    expect(res.body).toEqual({ models: [{ name: 'model-a' }] });
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it('handles model listing errors', async () => {
    listMock.mockRejectedValueOnce(new Error('boom'));

    const res = await request(app).get('/models').expect(500);

    expect(res.body.error).toBe('Failed to fetch models');
    expect(res.body.message).toBe('boom');
  });

  it('validates chat request body', async () => {
    const res = await request(app).post('/chat').send({}).expect(400);

    expect(res.body.error).toMatch(/messages array is required/i);
    expect(chatMock).not.toHaveBeenCalled();
  });

  it('returns chat completion when not streaming', async () => {
    chatMock.mockResolvedValueOnce({
      message: { role: 'assistant', content: 'Hello!' },
      model: 'test-model',
      created_at: 'now',
      done: true,
    });

    const res = await request(app)
      .post('/chat')
      .send({ messages: [{ role: 'user', content: 'Hi' }], model: 'test-model', stream: false })
      .expect(200);

    expect(res.body.message).toEqual({ role: 'assistant', content: 'Hello!' });
    expect(res.body.model).toBe('test-model');
    expect(res.body.done).toBe(true);
  });

  it('streams chat responses when requested', async () => {
    async function* stream() {
      yield { message: { role: 'assistant', content: 'Hi there' }, model: 'stream-model', created_at: 't1', done: false };
      yield { done: true };
    }

    chatMock.mockResolvedValueOnce(stream());

    const res = await request(app)
      .post('/chat')
      .send({ messages: [{ role: 'user', content: 'Hello' }], model: 'stream-model', stream: true })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('"content":"Hi there"');
    expect(res.text).toContain('[DONE]');
  });

  it('requires prompt for generate endpoint', async () => {
    const res = await request(app).post('/generate').send({}).expect(400);

    expect(res.body.error).toMatch(/prompt is required/i);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it('returns generated text when not streaming', async () => {
    generateMock.mockResolvedValueOnce({
      response: 'Generated text',
      model: 'gen-model',
      created_at: 'now',
      done: true,
    });

    const res = await request(app)
      .post('/generate')
      .send({ prompt: 'Say hi', model: 'gen-model', stream: false })
      .expect(200);

    expect(res.body.response).toBe('Generated text');
    expect(res.body.model).toBe('gen-model');
    expect(res.body.done).toBe(true);
  });

  it('streams generated text when requested', async () => {
    async function* stream() {
      yield { response: 'Part 1', model: 'gen-model', created_at: 't1', done: false };
      yield { response: 'Part 2', model: 'gen-model', created_at: 't2', done: false };
      yield { done: true };
    }

    generateMock.mockResolvedValueOnce(stream());

    const res = await request(app)
      .post('/generate')
      .send({ prompt: 'Hello', model: 'gen-model', stream: true })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('Part 1');
    expect(res.text).toContain('Part 2');
    expect(res.text).toContain('[DONE]');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/not-found').expect(404);

    expect(res.body.error).toBe('Route not found');
  });
});
