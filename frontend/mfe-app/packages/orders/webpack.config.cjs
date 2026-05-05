const { createMfeWebpackConfig } = require('@sportshop/webpack-mfe-config');

module.exports = createMfeWebpackConfig({
  appDir: __dirname,
  name: 'orders',
  port: 4202,
  isHost: false,
  exposes: {
    './CartPage': './src/CartPage.tsx',
    './OrdersPage': './src/OrdersPage.tsx',
    './ProfilePage': './src/ProfilePage.tsx',
  },
});
