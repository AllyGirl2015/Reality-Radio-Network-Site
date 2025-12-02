// Simple admin authentication using environment variable
// In production, use a proper auth system like NextAuth.js

import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rrn-admin-2025';

export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) return false;
  
  // Basic auth: "Basic base64(password)"
  if (authHeader.startsWith('Basic ')) {
    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    return decoded === ADMIN_PASSWORD;
  }
  
  // Bearer token auth: "Bearer password"
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return token === ADMIN_PASSWORD;
  }
  
  return false;
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { 
      status: 401, 
      headers: { 
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Admin"'
      } 
    }
  );
}
