"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  slug?: string;
  location?: string;
  phoneNumber?: string;
  createdAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  jwt: string | null;
  isAuthenticated: boolean;
  login: (params: { identifier: string; password: string }) => Promise<void>;
  register: (params: { username: string; email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, password: string, passwordConfirmation: string) => Promise<void>;
  updateProfile: (data: { username?: string; email?: string; avatarUrl?: string; location?: string; phoneNumber?: string; avatar?: number }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "auth.jwt";
const STORAGE_USER_KEY = "auth.user";

// GraphQL мутації для аутентифікації (правильна структура з GraphQL схеми)
const LOGIN_MUTATION = gql`
  mutation Login($input: UsersPermissionsLoginInput!) {
    login(input: $input) {
      jwt
      user {
        id
        username
        email
        slug
        location
        phoneNumber
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: UsersPermissionsRegisterInput!) {
    register(input: $input) {
      jwt
      user {
        id
        username
        email
        slug
        location
        phoneNumber
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      slug
      location
      phoneNumber
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // hydrate from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) setJwt(stored);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {}
    setIsHydrated(true);
  }, []);

  const login = useCallback(async ({ identifier, password }: { identifier: string; password: string }) => {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    
    try {
      console.log('🔄 Виконуємо REST API логін...');
      console.log('Login data:', { identifier, password: '***' });
      
      // Спочатку використовуємо REST API для логіну
      const loginResponse = await fetch(`${base}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      
      console.log('Login response status:', loginResponse.status);
      
      if (!loginResponse.ok) {
        const err = await loginResponse.json().catch(() => ({}));
        console.error('Login error:', err);
        
        // Різні можливі структури помилок від Strapi
        const errorMessage = err?.error?.message || 
                           err?.message || 
                           err?.data?.[0]?.messages?.[0]?.message ||
                           `HTTP ${loginResponse.status}: ${loginResponse.statusText}`;
        
        throw new Error(errorMessage);
      }
      
      const loginData = await loginResponse.json();
      const token = loginData.jwt;
      const basicUser = loginData.user;
      
      console.log('✅ REST API login successful, getting full user data via REST API...');
      
      // Отримуємо повні дані з Collection Type "User" через GraphQL
      const userResponse = await fetch(`${base}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            query {
              usersPermissionsUsers(filters: { username: { eq: "${basicUser.username}" } }) {
                avatarUrl
                createdAt
              }
            }
          `
        })
      });
      
      let fullUserData = {
        id: basicUser.id,
        username: basicUser.username,
        email: basicUser.email,
        slug: basicUser.slug,
        location: basicUser.location,
        phoneNumber: basicUser.phoneNumber,
        avatarUrl: basicUser.pfp
      };
      
        
        if (userResponse.ok) {
          const graphqlData = await userResponse.json();
          console.log('🔍 GraphQL User response:', graphqlData);
          console.log('🔍 GraphQL errors:', graphqlData.errors);
          console.log('🔍 GraphQL data:', graphqlData.data);
          
          if (graphqlData.data?.usersPermissionsUsers?.[0]) {
            const userData = graphqlData.data.usersPermissionsUsers[0];
            
            fullUserData = {
              id: basicUser.id,
              username: basicUser.username,
              email: basicUser.email,
              slug: basicUser.slug || null,
              location: basicUser.location || null,
              phoneNumber: basicUser.phoneNumber || null,
              avatarUrl: userData.avatarUrl || basicUser.avatarUrl || null,
              createdAt: userData.createdAt || basicUser.createdAt
            };
            console.log('✅ Отримано повні дані через GraphQL:', fullUserData);
          } else {
            console.log('⚠️ GraphQL User query returned no data, using basic user data');
          }
        } else {
          console.log('⚠️ GraphQL User query failed, using basic user data');
          console.log('🔍 Response status:', userResponse.status);
          console.log('🔍 Response statusText:', userResponse.statusText);
          const errorText = await userResponse.text();
          console.log('🔍 Error response:', errorText);
        }
      
      setJwt(token);
      setUser(fullUserData);
      
      try {
        localStorage.setItem(STORAGE_KEY, token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fullUserData));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    
    try {
      console.log('🔄 Виконуємо REST API реєстрацію...');
      // Спочатку використовуємо REST API для реєстрації
      const registerResponse = await fetch(`${base}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      
      if (!registerResponse.ok) {
        const err = await registerResponse.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Failed to register");
      }
      
      const registerData = await registerResponse.json();
      const token = registerData.jwt;
      const basicUser = registerData.user;
      
      console.log('✅ REST API registration successful, getting avatar data...');
      
      // Отримуємо повні дані з User через GraphQL
      const userResponse = await fetch(`${base}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            query {
              usersPermissionsUsers(filters: { username: { eq: "${basicUser.username}" } }) {
                username
                avatarUrl
                createdAt
              }
            }
          `
        })
      });
      
      let fullUserData = {
        id: basicUser.id,
        username: basicUser.username,
        email: basicUser.email,
        slug: basicUser.slug,
        location: basicUser.location,
        phoneNumber: basicUser.phoneNumber,
        avatarUrl: basicUser.pfp
      };
      
        
        if (userResponse.ok) {
          const graphqlData = await userResponse.json();
          console.log('🔍 GraphQL User response:', graphqlData);
          console.log('🔍 GraphQL errors:', graphqlData.errors);
          console.log('🔍 GraphQL data:', graphqlData.data);
          
          if (graphqlData.data?.usersPermissionsUsers?.[0]) {
            const userData = graphqlData.data.usersPermissionsUsers[0];
            
            fullUserData = {
              id: basicUser.id,
              username: basicUser.username,
              email: basicUser.email,
              slug: basicUser.slug || null,
              location: basicUser.location || null,
              phoneNumber: basicUser.phoneNumber || null,
              avatarUrl: userData.avatarUrl || basicUser.avatarUrl || null,
              createdAt: userData.createdAt || basicUser.createdAt
            };
            console.log('✅ Отримано повні дані через GraphQL:', fullUserData);
          } else {
            console.log('⚠️ GraphQL User query returned no data, using basic user data');
          }
        } else {
          console.log('⚠️ GraphQL User query failed, using basic user data');
          console.log('🔍 Response status:', userResponse.status);
          console.log('🔍 Response statusText:', userResponse.statusText);
          const errorText = await userResponse.text();
          console.log('🔍 Error response:', errorText);
        }
      
      setJwt(token);
      setUser(fullUserData);
      
      try {
        localStorage.setItem(STORAGE_KEY, token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fullUserData));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const res = await fetch(`${base}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to send reset email");
    }
  }, []);

  const resetPassword = useCallback(async (code: string, password: string, passwordConfirmation: string) => {
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const res = await fetch(`${base}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, password, passwordConfirmation })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to reset password");
    }
  }, []);

  const updateProfile = useCallback(async (data: { username?: string; email?: string; avatarUrl?: string; location?: string; phoneNumber?: string }) => {
    if (!jwt || !user?.id) throw new Error("Not authenticated");
    
    const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    
    console.log('🔄 Updating profile via REST API:', { userId: user.id, data, jwt: jwt.substring(0, 20) + '...' });
    
    try {
      // Готуємо дані для оновлення
      const updateData: any = {};
      
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

      const response = await fetch(`${base}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ REST API update response:', updatedUser);
        
        // avatarUrl тепер просто текстове поле
        const userData = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          slug: updatedUser.slug,
          location: updatedUser.location,
          phoneNumber: updatedUser.phoneNumber,
          avatarUrl: updatedUser.avatarUrl || user?.avatarUrl || ''
        };
        
        console.log('✅ Profile updated successfully via REST API:', userData);
        setUser(userData);
        
        try {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
        
        return;
      } else {
        const responseText = await response.text();
        console.error('❌ REST API request failed:', response.status);
        console.error('❌ Response body:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        
        console.error('❌ Error data:', errorData);
        throw new Error(errorData?.error?.message || errorData?.message || `Update failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ REST API update failed:', error);
      throw error;
    }
  }, [jwt, user]);

  const logout = useCallback(() => {
    setJwt(null);
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    } catch {}
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: isHydrated ? user : null,
    jwt: isHydrated ? jwt : null,
    isAuthenticated: isHydrated ? Boolean(jwt) : false,
    login,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    logout,
  }), [jwt, user, isHydrated, login, register, forgotPassword, resetPassword, updateProfile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


