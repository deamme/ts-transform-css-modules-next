const webpack = require('webpack');
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const path = require("path");
const transformInferno = require("ts-transform-inferno").default;
const transformCSS = require('../../../dist').default
// const transformCSS = require('ts-transform-css-modules-next').default

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist/"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".styl"]
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        loader: path.resolve(__dirname, './loader.js')
      },
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {
          getCustomTransformers: () => ({
            before: [
              transformCSS({
                autoprefix: true,
                paths: [path.resolve(__dirname, 'styles')],
                output: path.resolve(__dirname, 'dist')
              }),
              transformInferno({ classwrap: true })
            ]
          })
        }
      },
    ]
  },
  devServer: {
    contentBase: "dist/",
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: "body"
    }),
    new CleanWebpackPlugin(["dist"], {
      verbose: true
    }),
    // By default, webpack does `n=>n` compilation with entry files. This concatenates
    // them into a single chunk.
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    // new webpack.HotModuleReplacementPlugin(),
    // new ExtractTextPlugin("styles.css"),
  ]
};
