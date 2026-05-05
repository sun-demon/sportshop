import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../store';
import type {
  AuthResponse, IOrder, IProduct, IProductCreate,
  IUser, LoginRequest, RegisterRequest,
} from '../types';
import { logout, setTokens } from '../features/authSlice';

function normalizeAuthResponse(raw: AuthResponse | (AuthResponse & { accessToken: string })): AuthResponse {
  const r = raw as { user: IUser; token?: string; accessToken?: string; refreshToken?: string };
  const token = r.accessToken ?? r.token;
  if (!token) throw new Error('Auth response missing accessToken');
  return { user: r.user, token, refreshToken: r.refreshToken };
}

// RTK Query автоматически кэширует результаты.
// keepUnusedDataFor — секунды хранения данных после размонтирования компонента.
// providesTags / invalidatesTags — инвалидация кэша при мутациях.

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken ?? localStorage.getItem('refreshToken');
  if (!refreshToken) {
    api.dispatch(logout());
    return result;
  }

  const refreshResult = await rawBaseQuery(
    { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
    api,
    extraOptions,
  );
  if (!refreshResult.data) {
    api.dispatch(logout());
    return result;
  }

  const data = refreshResult.data as { accessToken?: string; refreshToken?: string };
  if (!data.accessToken) {
    api.dispatch(logout());
    return result;
  }

  api.dispatch(setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? null }));
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const sportshopApi = createApi({
  reducerPath: 'sportshopApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: normalizeAuthResponse,
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: normalizeAuthResponse,
    }),
    updateMe: builder.mutation<AuthResponse, { email?: string; name?: string; password?: string }>({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      transformResponse: normalizeAuthResponse,
    }),
    logout: builder.mutation<{ message?: string }, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    sendFeedback: builder.mutation<{ message: string }, { subject: string; message: string }>({
      query: (body) => ({ url: '/auth/feedback', method: 'POST', body }),
    }),
    getMe: builder.query<IUser, void>({
      query: () => '/auth/me',
      keepUnusedDataFor: 600, // 10 минут
      providesTags: ['User'],
    }),

    // Products
    getProducts: builder.query<IProduct[], void>({
      query: () => '/products',
      keepUnusedDataFor: 300, // 5 минут
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProduct: builder.query<IProduct, number>({
      query: (id) => `/products/${id}`,
      keepUnusedDataFor: 300,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<IProduct, IProductCreate>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<IProduct, { id: number; data: Partial<IProductCreate> }>({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Orders
    getMyOrders: builder.query<IOrder[], void>({
      query: () => '/orders/my',
      keepUnusedDataFor: 60, // 1 минута
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Order' as const, id })), { type: 'Order', id: 'MY' }]
          : [{ type: 'Order', id: 'MY' }],
    }),
    getAllOrders: builder.query<IOrder[], void>({
      query: () => '/orders',
      keepUnusedDataFor: 30, // 30 секунд
      providesTags: [{ type: 'Order', id: 'ALL' }],
    }),
    getOrder: builder.query<IOrder, number>({
      query: (id) => `/orders/${id}`,
      keepUnusedDataFor: 60,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<IOrder, { items: Array<{ productId: number; quantity: number }> }>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'MY' }],
    }),
    updateOrderStatus: builder.mutation<IOrder, { id: number; status: IOrder['status'] }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }, { type: 'Order', id: 'ALL' }],
    }),
  }),
});

export const {
  useLoginMutation, useRegisterMutation, useUpdateMeMutation, useLogoutMutation, useSendFeedbackMutation, useGetMeQuery,
  useGetProductsQuery, useGetProductQuery,
  useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation,
  useGetMyOrdersQuery, useGetAllOrdersQuery, useGetOrderQuery,
  useCreateOrderMutation, useUpdateOrderStatusMutation,
} = sportshopApi;
