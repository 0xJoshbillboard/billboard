const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@monorepo/hooks": path.resolve(__dirname, "../hooks/build"),
    },
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
    library: {
      type: "umd",
      name: "BillboardSDK",
    },
    globalObject: "this",
  },
  externals: {
    firebase: "firebase",
  },
};
