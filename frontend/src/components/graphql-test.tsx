"use client";

import { useState } from "react";
import { Box, Button, Typography, TextField, Paper, Alert } from "@mui/material";

export default function GraphQLTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testQueries = {
    // 1. Простий запит без ID
    simpleUpdate: `
      mutation UpdateMe($data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(data: $data) {
          data {
            id
            attributes {
              username
              email
              avatarUrl
            }
          }
        }
      }
    `,
    
    // 2. Запит з ID
    updateWithId: `
      mutation UpdateUser($id: ID!, $data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(id: $id, data: $data) {
          data {
            id
            attributes {
              username
              email
              avatarUrl
            }
          }
        }
      }
    `,
    
    // 3. Простий запит без змінних
    simpleDirect: `
      mutation {
        updateUsersPermissionsUser(data: {
          username: "testuser",
          email: "test@example.com",
          avatarUrl: "https://example.com/avatar.jpg"
        }) {
          data {
            id
            attributes {
              username
              email
              avatarUrl
            }
          }
        }
      }
    `,
    
    // 4. Запит поточного користувача
    getCurrentUser: `
      query {
        me {
          id
          username
          email
          avatarUrl
        }
      }
    `
  };

  const runTest = async (queryName: string, query: string, variables: any = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const jwt = localStorage.getItem('jwt');
      
      console.log(`Testing ${queryName}:`, { query: query.substring(0, 100) + '...', variables, jwt: jwt ? jwt.substring(0, 20) + '...' : 'No JWT' });

      const response = await fetch(`${base}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt && { "Authorization": `Bearer ${jwt}` })
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      const result = await response.json();
      
      console.log(`${queryName} response:`, { status: response.status, result });
      
      setResult({
        queryName,
        status: response.status,
        data: result.data,
        errors: result.errors,
        raw: result
      });

    } catch (err) {
      console.error(`${queryName} error:`, err);
      setError(`${queryName} failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        GraphQL Test Sandbox
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => runTest('getCurrentUser', testQueries.getCurrentUser)}
          disabled={loading}
        >
          Get Current User
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('simpleUpdate', testQueries.simpleUpdate, {
            data: { username: "testuser", email: "test@example.com" }
          })}
          disabled={loading}
        >
          Simple Update (no ID)
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('updateWithId', testQueries.updateWithId, {
            id: "1",
            data: { username: "testuser2", email: "test2@example.com" }
          })}
          disabled={loading}
        >
          Update with ID
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('simpleDirect', testQueries.simpleDirect)}
          disabled={loading}
        >
          Direct Update
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Result: {result.queryName} (Status: {result.status})
          </Typography>
          
          {result.errors && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">GraphQL Errors:</Typography>
              <pre style={{ fontSize: '12px', margin: 0 }}>
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </Alert>
          )}
          
          {result.data && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Data:</Typography>
              <pre style={{ fontSize: '12px', margin: 0 }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Alert>
          )}
          
          <Typography variant="subtitle2">Full Response:</Typography>
          <pre style={{ fontSize: '10px', backgroundColor: '#f5f5f5', padding: '8px', overflow: 'auto' }}>
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
}
