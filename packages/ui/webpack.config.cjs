const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      process: 'process/browser',
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'build'),
      },
      {
        directory: path.join(__dirname, 'src/assets'),
        publicPath: '/assets',
      },
    ],
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'assets',
        },
      ],
    }),
  ],
  mode: 'development',
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
        // Specific group for MUI packages
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui-vendor',
          chunks: 'all',
          priority: 10,
        },
      },
    },
  },
};
