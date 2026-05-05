import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../types';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const readAccessToken = () => localStorage.getItem('accessToken') ?? localStorage.getItem('token');
const readRefreshToken = () => localStorage.getItem('refreshToken');

const initialState: AuthState = {
  user: null,
  accessToken: readAccessToken(),
  refreshToken: readRefreshToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: IUser; token: string; refreshToken?: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      localStorage.setItem('accessToken', action.payload.token);
      localStorage.removeItem('token');
      if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    setTokens(state, action: PayloadAction<{ accessToken: string | null; refreshToken?: string | null }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      if (action.payload.accessToken) localStorage.setItem('accessToken', action.payload.accessToken);
      else localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      if (action.payload.refreshToken !== undefined) {
        if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken);
        else localStorage.removeItem('refreshToken');
      }
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, setTokens, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.accessToken !== null;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';
