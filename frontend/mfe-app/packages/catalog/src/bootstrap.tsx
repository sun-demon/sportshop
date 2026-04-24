/**
 * Standalone-режим Catalog MFE.
 * При запуске через `npm start` внутри packages/catalog
 * добавляем BrowserRouter чтобы Routes работали без host.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CatalogApp from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="app-wrapper">
        <main className="main-content">
          <CatalogApp />
        </main>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);
