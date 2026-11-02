import { test, expect } from '../../src/fixtures/test';
import type { Post } from '../../src/api/PostsClient';

test.describe('Posts API', () => {
  test('GET /posts returns 100 posts', { tag: ['@smoke', '@api'] }, async ({ postsClient }) => {
    const response = await postsClient.list();

    expect(response.status()).toBe(200);
    const posts: Post[] = await response.json();
    expect(posts).toHaveLength(100);
  });

  test('GET /posts/:id returns a post matching the schema', { tag: ['@api'] }, async ({ postsClient }) => {
    const response = await postsClient.get(1);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toEqual({
      userId: expect.any(Number),
      id: 1,
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('GET /posts filters by userId', { tag: ['@api'] }, async ({ postsClient }) => {
    const response = await postsClient.list({ userId: 3 });

    const posts: Post[] = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((p) => p.userId === 3)).toBe(true);
  });

  test('GET /posts/:id returns 404 for an unknown post', { tag: ['@api'] }, async ({ postsClient }) => {
    const response = await postsClient.get(9999);

    expect(response.status()).toBe(404);
  });

  test('POST /posts creates a post', { tag: ['@api'] }, async ({ postsClient }) => {
    const newPost = { userId: 1, title: 'Playwright', body: 'API testing with Playwright' };

    const response = await postsClient.create(newPost);

    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ ...newPost, id: expect.any(Number) });
  });

  test('PATCH /posts/:id updates a post', { tag: ['@api'] }, async ({ postsClient }) => {
    const response = await postsClient.update(1, { title: 'Updated title' });

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ id: 1, title: 'Updated title' });
  });

  test('DELETE /posts/:id succeeds', { tag: ['@api'] }, async ({ postsClient }) => {
    const response = await postsClient.delete(1);

    expect(response.status()).toBe(200);
  });
});
