/**
 * GraphQL Client
 * Simple, reusable GraphQL client
 */

import { ENV } from '../config';
import type { GraphQLResponse } from '../types';

interface RequestOptions {
  query: string;
  variables?: Record<string, any>;
}

class GraphQLClient {
  private headers: Record<string, string> = { 'Content-Type': 'application/json' };

  constructor(private baseUrl: string) {}

  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const token = this.getAuthToken();
    if (token) this.setAuthToken(token);

    console.group('📤 GraphQL Request');
    console.log('🔗 Endpoint:', this.baseUrl);
    console.log('📝 Query:', options.query);
    if (options.variables) console.log('📦 Variables:', options.variables);
    console.groupEnd();

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query: options.query,
          variables: options.variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors?.length) {
        const errorMessage = result.errors.map(e => e.message).join(', ');
        console.group('❌ GraphQL Error');
        console.error('Error Message:', errorMessage);
        console.error('Full Errors:', result.errors);
        console.groupEnd();
        throw new Error(errorMessage);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL');
      }

      console.group('✅ GraphQL Response');
      console.log('📥 Data:', result.data);
      console.groupEnd();

      return result.data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

export const graphqlClient = new GraphQLClient(ENV.GRAPHQL_URL);
