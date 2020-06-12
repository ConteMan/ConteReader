'use strict'

import { app, protocol, BrowserWindow, Menu, Tray, shell } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')

// 托盘对象
let appTray = null
// 是否可以退出
let trayClose = false
// 系统托盘右键菜单
let trayMenuTemplate
// 系统托盘图标
let iconPath
// 图标的上上下文
let contextMenu

import nedb from './universal/nedb'
let feed = require('./main/parser/feed')
const globalAny = global;
globalAny.nedb = nedb;
globalAny.feed = feed

if (!isDevelopment) {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    center: true,
    width: 1366,
    height: 768,
    minWidth: 1366,
    minHeight: 768,
    frame: false, //无框
    transparent: false, //透明
    webPreferences: {
      nodeIntegration: true,
      // devTools:false, //是否开启 DevTools
      // webSecurity: false, //是否禁用同源策略
    }
  })

  //隐藏菜单栏
  win.setMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    win.webContents.openDevTools()
    createProtocol('cr')
    // Load the index.html when not in development
    win.loadURL('cr://./index.html')
  }

  win.on('close', (event) => {
    win.hide();
    win.setSkipTaskbar(true);
    event.preventDefault();
  });

  win.on('closed', () => {
      win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
  createTray()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

/**
 * 设置系统托盘
 */
function createTray() {
  // 是否可以退出
  trayClose = false

  // eslint-disable-next-line no-undef
  iconPath = `${__static}/images/logo_32.ico`

  // 系统托盘右键菜单
  trayMenuTemplate = [
    {
      label: ' 关于项目',
      click: function () {
        // 打开外部链接
        shell.openExternal('https://github.com/contestudio')
      }
    },
    {
      label: ' 退出',
      click: function () {
        // 退出
        trayClose = true
        app.quit()
        win.destroy()
        console.log(trayClose)
      }
    }
  ]

  appTray = new Tray(iconPath)
  // 图标的上上下文
  contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('ConteReader')
  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu)
  // 主窗口显示隐藏切换
  appTray.on('click', () => {
    // 还原图标
    appTray.setImage(iconPath)
    win.isVisible() ? win.hide() : win.show()
    win.setSkipTaskbar(false);
  })
}