import {app, BrowserWindow, globalShortcut} from "electron";
import {HomeWin} from './windows/home/index.js'
import {shortcutHandler} from './shortcut/index.js'
import {ipcHandler} from './ipcHandler/index.js'
import {CaptureScreenWin} from "./windows/captureScreen/index.js";
import {createTray} from "./assets/tray.js"



app.whenReady().then(() => {

    HomeWin.createInstance()
    CaptureScreenWin.createInstance()

    shortcutHandler()

    ipcHandler()

    createTray()



    // activate 事件是 macOS 特有的行为，在 Windows 和 Linux 上不会触发。
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            HomeWin.createInstance()
            CaptureScreenWin.createInstance()
        }
    })

    // 如果操作系统不是 macOS，则调用 app.quit() 退出应用。
    // 如果是 macOS，则应用会继续在后台运行，用户可以通过点击 Dock 图标重新激活应用。
    app.on('window-all-closed', () => {
        console.log("window-all-closed")
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('will-quit', () => {
        console.log("will-quit")
        globalShortcut.unregisterAll();
    });
})

