import { describe, it, expect } from 'vitest';
import { Elysia } from 'elysia';
import { authModule } from '../modules/auth';

// Define the expected response types
interface AuthSuccessResponse {
  success: boolean;
  data: {
    user: {
      username: string;
      email: string;
      id: string;
      password?: string;
      [key: string]: any;
    };
    token: string;
  };
  message: string;
}

interface AuthErrorResponse {
  success: boolean;
  error: string;
  message: string;
}

describe('Auth Module Tests', () => {
  const app = new Elysia().use(authModule);
  
  it('should register a new user successfully', async () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await app
      .handle(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      }))
      .then(res => res.json()) as AuthSuccessResponse;
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('User registered successfully');
    expect(response.data).toBeDefined();
    expect(response.data.user).toBeDefined();
    expect(response.data.user.username).toBe(testUser.username);
    expect(response.data.user.email).toBe(testUser.email);
    expect(response.data.token).toBeDefined();
    // Password should not be returned
    expect(response.data.user.password).toBeUndefined();
  });
  
  it('should login a user successfully', async () => {
    const loginCreds = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await app
      .handle(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginCreds)
      }))
      .then(res => res.json()) as AuthSuccessResponse;
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('Login successful');
    expect(response.data).toBeDefined();
    expect(response.data.user).toBeDefined();
    expect(response.data.user.email).toBe(loginCreds.email);
    expect(response.data.token).toBeDefined();
  });
  
  it('should return unauthorized for invalid login', async () => {
    const invalidCreds = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };
    
    const response = await app
      .handle(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidCreds)
      }))
      .then(res => res.json()) as AuthErrorResponse;
    
    expect(response.success).toBe(false);
    expect(response.error).toContain('InvalidCredentials');
  });
}); 