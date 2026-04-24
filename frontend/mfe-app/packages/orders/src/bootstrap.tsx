import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import OrdersApp from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="app-wrapper">
        <main className="main-content">
          <OrdersApp />
        </main>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
