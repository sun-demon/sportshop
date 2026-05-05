import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AuthResponse,
  IOrder,
  IProduct,
  IProductCreate,
  IUser,
  LoginRequest,
  RegisterRequest,
} from '../types';

/** Ответ API после refresh-токенов: в store остаётся поле `token` для Authorization */
function normalizeAuthResponse(raw: AuthResponse | (AuthResponse & { accessToken: string })): AuthResponse {
  const r = raw as { user: IUser; token?: string; accessToken?: string };
  const token = r.accessToken ?? r.token;
  if (!token) throw new Error('Auth response missing accessToken');
  return { user: r.user, token };
}

export const sportshopApi = createApi({
  reducerPath: 'sportshopApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: normalizeAuthResponse,
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: normalizeAuthResponse,
    }),
    getMe: builder.query<IUser, void>({
      query: () => '/auth/me',
      keepUnusedDataFor: 600,
      providesTags: ['User'],
    }),
    getProducts: builder.query<IProduct[], void>({
      query: () => '/products',
      keepUnusedDataFor: 300,
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
    getMyOrders: builder.query<IOrder[], void>({
      query: () => '/orders/my',
      keepUnusedDataFor: 60,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Order' as const, id })), { type: 'Order', id: 'MY' }]
          : [{ type: 'Order', id: 'MY' }],
    }),
    getAllOrders: builder.query<IOrder[], void>({
      query: () => '/orders',
      keepUnusedDataFor: 30,
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
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = sportshopApi;
