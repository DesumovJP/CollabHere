"use client";

import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, Alert, Container } from "@mui/material";

export default function GraphQLTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  // Check JWT on mount and when localStorage changes
  useEffect(() => {
    const checkJWT = () => {
      // AuthProvider uses 'auth.jwt' key
      const token = localStorage.getItem('auth.jwt');
      console.log('Checking JWT:', token);
      setJwt(token);
    };
    
    checkJWT();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkJWT);
    
    // Also check periodically in case of same-tab login
    const interval = setInterval(checkJWT, 1000);
    
    return () => {
      window.removeEventListener('storage', checkJWT);
      clearInterval(interval);
    };
  }, []);

  const testQueries = {
    // 1. Простий запит без ID (виправлений)
    simpleUpdate: `
      mutation UpdateMe($data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(data: $data) {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 2. Запит з ID (виправлений)
    updateWithId: `
      mutation UpdateUser($id: ID!, $data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(id: $id, data: $data) {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 3. Простий запит без змінних (виправлений)
    simpleDirect: `
      mutation {
        updateUsersPermissionsUser(data: {
          username: "testuser",
          email: "test@example.com",
          avatarUrl: "https://example.com/avatar.jpg"
        }) {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 4. Запит поточного користувача (тільки основні поля)
    getCurrentUser: `
      query {
        me {
          id
          username
          email
        }
      }
    `,
    
    // 11. Запит користувачів (тільки основні поля)
    getUsersWorking: `
      query {
        usersPermissionsUsers {
          id
          username
          email
        }
      }
    `,
    
    // 12. Оновлення користувача (тільки основні поля)
    updateUserWorking: `
      mutation UpdateUser($id: ID!, $data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(id: $id, data: $data) {
          id
          username
          email
        }
      }
    `,
    
    // 13. Оновлення без ID (найпростіший)
    updateMeWorking: `
      mutation UpdateMe($data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(data: $data) {
          id
          username
          email
        }
      }
    `,
    
    
    // 15. Альтернативна мутація
    updateMeAlternative: `
      mutation {
        updateUsersPermissionsUser(data: {
          username: "testuser123",
          email: "test123@example.com"
        }) {
          id
          username
          email
        }
      }
    `,
    
    // 16. Мутація me (можливо існує)
    updateMeDirect: `
      mutation UpdateMe($data: UsersPermissionsUserInput!) {
        me(data: $data) {
          id
          username
          email
        }
      }
    `,
    
    // 17. Мутація без параметрів
    updateMeNoParams: `
      mutation {
        updateUsersPermissionsUser {
          id
          username
          email
        }
      }
    `,
    
    // 18. Мутація з фіксованими значеннями
    updateMeFixed: `
      mutation {
        updateUsersPermissionsUser(data: {
          username: "newusername",
          email: "newemail@example.com"
        }) {
          id
          username
          email
        }
      }
    `,
    
    // 19. Мутація me (можливо існує)
    updateMeMutation: `
      mutation {
        me {
          id
          username
          email
        }
      }
    `,
    
    // 20. Мутація з іншою назвою
    updateUserMutation: `
      mutation {
        updateUser(data: {
          username: "testuser",
          email: "test@example.com"
        }) {
          id
          username
          email
        }
      }
    `,
    
    // 21. Мутація з іншою назвою
    updateProfileMutation: `
      mutation {
        updateProfile(data: {
          username: "testuser",
          email: "test@example.com"
        }) {
          id
          username
          email
        }
      }
    `,
    
    // 22. Перевірка чи є мутації для користувачів
    checkUserMutations: `
      query {
        __schema {
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }
    `,
    
    // 25. Спробуємо changePassword (може працювати)
    changePassword: `
      mutation ChangePassword($currentPassword: String!, $password: String!, $passwordConfirmation: String!) {
        changePassword(currentPassword: $currentPassword, password: $password, passwordConfirmation: $passwordConfirmation) {
          jwt
          user {
            id
            username
            email
          }
        }
      }
    `,
    
    // 26. Спробуємо updateUsersPermissionsUser з іншою структурою
    updateUserAlternative: `
      mutation UpdateUser($id: ID!, $data: UsersPermissionsUserInput!) {
        updateUsersPermissionsUser(id: $id, data: $data) {
          id
          username
          email
          confirmed
          blocked
        }
      }
    `,
    
    // 10. Простий тест GraphQL
    testGraphQL: `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `,
    
    // 5. Запит користувачів (виправлений)
    getUsers: `
      query {
        usersPermissionsUsers {
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
    
    // 6. Альтернативний запит користувачів
    getUsersSimple: `
      query {
        usersPermissionsUsers {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 7. Запит одного користувача
    getUserById: `
      query GetUser($id: ID!) {
        usersPermissionsUser(id: $id) {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 8. Запит без ID і data (простий)
    updateSimple: `
      mutation {
        updateUsersPermissionsUser {
          id
          username
          email
          avatarUrl
        }
      }
    `,
    
    // 9. Запит з фіксованими значеннями
    updateFixed: `
      mutation {
        updateUsersPermissionsUser(data: {
          username: "newuser",
          email: "new@example.com"
        }) {
          id
          username
          email
          avatarUrl
        }
      }
    `
  };

  const runTest = async (queryName: string, query: string, variables: any = {}) => {
    console.log(`Starting test: ${queryName}`);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const jwt = localStorage.getItem('auth.jwt');
      
      if (!jwt) {
        setError('No JWT token found. Please login first!');
        setLoading(false);
        return;
      }
      
      console.log(`Testing ${queryName}:`, { 
        query: query.substring(0, 100) + '...', 
        variables, 
        jwt: jwt.substring(0, 20) + '...',
        base 
      });

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
      
      // Log detailed errors
      if (result.errors) {
        console.error(`${queryName} GraphQL errors:`, result.errors);
      }
      
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
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        GraphQL Test Sandbox
      </Typography>
      
      {!jwt ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">⚠️ Not logged in!</Typography>
          <Typography variant="body2">
            You need to login first to test GraphQL mutations. 
            <Button 
              variant="text" 
              onClick={() => window.location.href = '/auth'}
              sx={{ ml: 1 }}
            >
              Go to Login
            </Button>
            <Button 
              variant="text" 
              onClick={() => {
                const token = localStorage.getItem('auth.jwt');
                console.log('Manual JWT check:', token);
                setJwt(token);
              }}
              sx={{ ml: 1 }}
            >
              Check JWT Again
            </Button>
          </Typography>
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">✅ Logged in!</Typography>
          <Typography variant="body2">
            JWT: {jwt.substring(0, 20)}...
            <Button 
              variant="text" 
              onClick={() => {
                const token = localStorage.getItem('auth.jwt');
                setJwt(token);
              }}
              sx={{ ml: 1 }}
            >
              Refresh
            </Button>
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => runTest('testGraphQL', testQueries.testGraphQL)}
          disabled={loading}
        >
          Test GraphQL
        </Button>
        
        <Button 
          variant="contained" 
          onClick={() => runTest('getCurrentUser', testQueries.getCurrentUser)}
          disabled={loading}
        >
          Get Current User
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('getUsers', testQueries.getUsers)}
          disabled={loading}
        >
          Get All Users (with data)
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('getUsersSimple', testQueries.getUsersSimple)}
          disabled={loading}
        >
          Get All Users (simple)
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('getUserById', testQueries.getUserById, { id: "1" })}
          disabled={loading}
        >
          Get User by ID
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
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('updateSimple', testQueries.updateSimple)}
          disabled={loading}
        >
          Update Simple (no params)
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => runTest('updateFixed', testQueries.updateFixed)}
          disabled={loading}
        >
          Update Fixed Values
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={() => runTest('getUsersWorking', testQueries.getUsersWorking)}
          disabled={loading}
        >
          Get Users (Working)
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={() => runTest('updateUserWorking', testQueries.updateUserWorking, {
            id: "1",
            data: { username: "updateduser", email: "updated@example.com" }
          })}
          disabled={loading}
        >
          Update User (Correct)
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => runTest('updateMeWorking', testQueries.updateMeWorking, {
            data: { username: "mynewuser", email: "mynew@example.com" }
          })}
          disabled={loading}
        >
          Update Me (Working)
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => runTest('updateMeAlternative', testQueries.updateMeAlternative)}
          disabled={loading}
        >
          Update Me (Alternative)
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => runTest('updateMeDirect', testQueries.updateMeDirect, {
            data: { username: "directuser", email: "direct@example.com" }
          })}
          disabled={loading}
        >
          Update Me (Direct)
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => runTest('updateMeNoParams', testQueries.updateMeNoParams)}
          disabled={loading}
        >
          Update Me (No Params)
        </Button>
        
        <Button 
          variant="outlined" 
          color="success"
          onClick={() => runTest('updateMeFixed', testQueries.updateMeFixed)}
          disabled={loading}
        >
          Update Me (Fixed)
        </Button>
        
        <Button 
          variant="outlined" 
          color="warning"
          onClick={() => runTest('updateMeMutation', testQueries.updateMeMutation)}
          disabled={loading}
        >
          Update Me (Mutation)
        </Button>
        
        <Button 
          variant="outlined" 
          color="info"
          onClick={() => runTest('updateUserMutation', testQueries.updateUserMutation)}
          disabled={loading}
        >
          Update User (Mutation)
        </Button>
        
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => runTest('updateProfileMutation', testQueries.updateProfileMutation)}
          disabled={loading}
        >
          Update Profile (Mutation)
        </Button>
        
        <Button 
          variant="contained" 
          color="info"
          onClick={() => runTest('checkUserMutations', testQueries.checkUserMutations)}
          disabled={loading}
        >
          Check User Mutations
        </Button>
        
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => runTest('updateUserAlternative', testQueries.updateUserAlternative, {
            id: "1",
            data: { username: "currentuser", email: "current@example.com" }
          })}
          disabled={loading}
        >
          Update User Alternative
        </Button>
        
        <Button 
          variant="outlined" 
          color="warning"
          onClick={() => runTest('changePassword', testQueries.changePassword, {
            currentPassword: "password123",
            password: "newpassword123",
            passwordConfirmation: "newpassword123"
          })}
          disabled={loading}
        >
          Change Password
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Result: {result.queryName} (Status: {result.status})
          </Typography>
          
          {result.errors && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">GraphQL Errors:</Typography>
              <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </Alert>
          )}
          
          {result.data && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Data:</Typography>
              <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Alert>
          )}
          
          <Typography variant="subtitle2">Full Response:</Typography>
          <pre style={{ 
            fontSize: '10px', 
            backgroundColor: '#f5f5f5', 
            padding: '8px', 
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        </Paper>
      )}
    </Container>
  );
}
