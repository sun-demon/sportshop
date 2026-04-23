import { createContext, useContext } from 'react';
import { rootStore, RootStore } from './RootStore';

const StoreContext = createContext<RootStore>(rootStore);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}

export const useRootStore = () => useContext(StoreContext);
export const useAuthStore    = () => useContext(StoreContext).auth;
export const useProductStore = () => useContext(StoreContext).products;
export const useCartStore    = () => useContext(StoreContext).cart;
export const useOrderStore   = () => useContext(StoreContext).orders;
