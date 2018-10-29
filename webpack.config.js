const path = require("path");
const rootPath = path.resolve(__dirname, ".");

const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devServer: {
    port: 5000
  },
  entry: {
    index: rootPath + "/src/index.js"
  },
  output: {
    path: rootPath + "/dist",
    filename: "[name].[contenthash].js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|woff|ttf|woff2)$/,
        use: ["file-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: rootPath + "/src/index.html" }),
    new VueLoaderPlugin()
  ]
};
