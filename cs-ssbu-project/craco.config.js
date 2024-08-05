const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Añadir los fallbacks necesarios
      webpackConfig.resolve.fallback = {
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "net": false,
        "tls": false,
        "fs": false,
        "worker_threads": false,
        "process": require.resolve("process/browser.js")
      };

      // Añadir los plugins necesarios
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
        })
      ];

      // Configuración adicional para asegurarse de que los cambios en el HTML se reflejen
      webpackConfig.output = {
        ...webpackConfig.output,
        publicPath: '/',
      };

      return webpackConfig;
    },
  },
};
