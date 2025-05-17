// Export a dummy auth module for now
import { Elysia } from 'elysia';
export const authModule = new Elysia({ prefix: '/auth' }); 