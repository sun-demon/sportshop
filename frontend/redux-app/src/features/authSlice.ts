import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../types';

interface AuthState {
  user: IUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: IUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.token !== null;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';
