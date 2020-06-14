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
                    // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true, // 允许自定义目录
                    // 安装图标
                    installerIcon: 'build/icons/logo_256.ico',
                    // 卸载图标
                    uninstallerIcon: 'build/icons/logo_256.ico',
                    // 安装时头部图标
                    installerHeaderIcon: 'build/icons/logo_256.ico',
                    // 创建桌面图标
                    createDesktopShortcut: true,
                    // 创建开始菜单图标
                    createStartMenuShortcut: true
                },
                win: {
                    icon: 'build/icons/logo_256.ico',
                    target: 'nsis'
                },
                productName: "Conte Reader", // 产品名称
                appId: "com.isconte.contereader", // windows平台appId
                copyright: "Copyright © 2020 ConteMan", // 版权
            }
        }
    }
}