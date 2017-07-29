'use strict';

var config = require('./webpackConfig.json');

var devServerPort = config.devServerPort;
var host = `http://localhost:${devServerPort}`;

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var webpack = require('webpack');
var HtmlPlugin = require('html-webpack-plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var pxtorem = require('postcss-pxtorem');

var externalExtractor = new ExtractTextPlugin('css/external.css');
var indexExtractor = new ExtractTextPlugin('css/index.css');

var getPath = function (aPath) {
    return path.resolve(__dirname, aPath);
};

var entry = {
    external: getPath('src/entries/external.js'),
    index: getPath('src/entries/index.js')
};

var keys = _.keys(entry);

var proxy = {};
var eachFile = function (config) {
    config = config || {};
    var dirPath = config.dirPath;
    var handler = config.handler;
    var files = fs.readdirSync(dirPath);
    for (var index = 0, len = files.length; index < len; index++) {
        var fileName = files[index];
        var filePath = dirPath + '/' + fileName;
        var stat = fs.lstatSync(filePath);
        if (stat.isDirectory() == true) {
            eachFile({
                dirPath: filePath,
                handler: handler
            });
        } else {
            handler(fileName, filePath, dirPath);
        }
    }
};
eachFile({
    dirPath: 'json',
    handler: function (fileName, filePath, dirPath) {
        proxy[filePath.substr(4)] = {
            target: host,
            changeOrigin: true,
            pathRewrite: function (path, request) {
                return `/${filePath}`;
            }
        };
    }
});

var isDev = process.env.NODE_ENV !== 'production';

var nodeModulesPath = /node_modules/;
var srcPath = getPath('src');

module.exports = {
    entry: entry,
    output: {
        path: getPath('../src/main/resources/static'),
        filename: 'js/[name].js',
        publicPath: '/'
    },
    devtool: isDev ? 'source-map' : false,
    resolve: {
        extensions: ['.web.js', '.js', '.json']
    },
    module: {
        rules: [
            /*{
                test: /\.swf$/,
                include: [srcPath],
                loader: 'file-loader',
                options: {
                    name: 'swf/[name].[hash:8].[ext]'
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: [srcPath],
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    name: 'images/[name].[hash:8].[ext]'
                }
            },*/
            {
                test: /\.css$/,
                include: [nodeModulesPath],
                loader: externalExtractor.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: isDev
                            }
                        }
                    ]
                })
            },
            {
                test: /\.scss$/,
                include: [srcPath],
                loader: indexExtractor.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                localIdentName: '[name]__[local]-[hash:8]',
                                sourceMap: isDev
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: isDev
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDev
                            }
                        }
                    ]
                })
            },
            {
                test: /\.js$/,
                include: [srcPath],
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'react', 'stage-0'],
                    plugins: [
                        [
                            'import',
                            {style: 'css', libraryName: 'antd-mobile'}

                        ],
                        'transform-decorators-legacy',
                        'transform-object-assign'
                    ]
                }
            },
            {
                test: /\.svg$/,
                include: [nodeModulesPath, srcPath],
                loader: 'svg-sprite-loader'
            }
        ]
    },
    plugins: [
        new HtmlPlugin({
            hash: true,
            chunksSortMode: function (a, b) {
                var aName = a.names[0];
                var bName = b.names[0];
                var aNameIndex = _.indexOf(keys, aName);
                var bNameIndex = _.indexOf(keys, bName);
                return aNameIndex > bNameIndex ? 1 : (aNameIndex < bNameIndex ? -1 : 0);
            },
            template: getPath('src/index.html')
        }),
        new HtmlPlugin({
            inject: false,
            template: getPath('src/index-debug.html'),
            filename: 'index-debug.html'
        }),
        new OpenBrowserPlugin({url: `${host}/index-debug.html?code=123&redirectUrl=%2Flist%2FformList`}),//%3FpageType%3DmyFormList
        externalExtractor,
        indexExtractor,
        new webpack.LoaderOptionsPlugin({
            test: /\.scss$/,
            options: {
                postcss: [
                    autoprefixer(),
                    pxtorem({
                        rootValue: 100,
                        unitPrecision: 5,
                        propList: [
                            '*', '!border', '!border-top', '!border-right', '!border-bottom', '!border-left'
                        ],
                        selectorBlackList: [],
                        replace: true,
                        mediaQuery: false,
                        minPixelValue: 0
                    })
                ]
            }
        })
    ],
    devServer: {
        port: devServerPort,
        proxy: proxy,
        headers: {'Access-Control-Allow-Origin': '*'}
    }
};
