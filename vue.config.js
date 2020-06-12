const path = require('path');

function resolve (dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src/renderer'))
            .set('~', resolve('src'))
            .set('root', resolve('./'))
            .set('#', resolve('src/universal'))
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            chainWebpackMainProcess: config => {
                config.resolve.alias
                    .set('@', resolve('src/renderer'))
                    .set('~', resolve('src'))
                    .set('root', resolve('./'))
                    .set('#', resolve('src/universal'))
            },
            builderOptions: {
                nsis: {
                    oneClick:false, // 一键安装
                    allowToChangeInstallationDirectory: true, // 允许自定义目录
                },
                productName: "Conte Reader", // 产品名称
                appId: "com.isconte.cr", // windows平台appId
                copyright: "Copyright © 2012 ConteMan", // 版权
            }
        },
        // win: {
        //     icon: 'build/icons/icon.ico',
        //     target: 'nsis'
        // },
        // nsis: {
        //     oneClick:false, // 一键安装
        //     allowToChangeInstallationDirectory: true // 允许自定义目录
        // }
    }
}