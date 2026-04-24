/**
 * Объявления типов для Module Federation удалённых модулей.
 * TypeScript не знает об этих модулях автоматически — они разрешаются
 * в runtime через remoteEntry.js, а не через node_modules.
 */

declare module 'catalog/App' {
  import type React from 'react';
  const App: React.ComponentType;
  export default App;
}

declare module 'orders/App' {
  import type React from 'react';
  const App: React.ComponentType;
  export default App;
}
