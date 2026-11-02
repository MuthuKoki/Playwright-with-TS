import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type NewPost = Omit<Post, 'id'>;

/** Thin service-object wrapper around the JSONPlaceholder /posts resource. */
export class PostsClient {
  constructor(private readonly request: APIRequestContext) {}

  list(params?: { userId?: number }): Promise<APIResponse> {
    return this.request.get('/posts', { params });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  create(post: NewPost): Promise<APIResponse> {
    return this.request.post('/posts', { data: post });
  }

  update(id: number, post: Partial<NewPost>): Promise<APIResponse> {
    return this.request.patch(`/posts/${id}`, { data: post });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/posts/${id}`);
  }
}
