module.exports = {
    entry: "./dist/index.js",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader' // compiles Less to CSS
                    }
                ]
            }
        ]
      },
    resolve: {
        extensions: [".js", ".less"]
    },
}