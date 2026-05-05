const { createMfeWebpackConfig } = require('@sportshop/webpack-mfe-config');

module.exports = createMfeWebpackConfig({
  appDir: __dirname,
  name: 'catalog',
  port: 4201,
  isHost: false,
  exposes: {
    './ProductsPage': './src/ProductsPage.tsx',
    './ProductDetailPage': './src/ProductDetailPage.tsx',
    './ProductFormPage': './src/ProductFormPage.tsx',
  },
});
