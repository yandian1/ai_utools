import {HomeWin} from "../windows/home/index.js";
import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {ipcMain, app} from "electron";
import {getWallpaper, setWallpaper} from 'wallpaper';
import {closeScreenshotHandler, downloadFile, getFileUrlExt} from "../utils/index.js";
import path from "path";
import { randomUUID } from "crypto";

export function ipcHandler() {
    // 打开聊天窗口
    ipcMain.handle('openChat', (event, data) => {
        openChatHandler(data);
        CaptureScreenWin.createInstance();
    })
    // 关闭截屏窗口
    ipcMain.handle('closeScreenshot', (event, data) => {
        closeScreenshotHandler();
        CaptureScreenWin.createInstance();
    })
    // 设置桌面壁纸
    ipcMain.handle('setDesktop', async (event, data) => {
        const ext = getFileUrlExt(data.imgUrl);
        const filename = `${randomUUID()}.${ext}`;
        const filePath = path.join(app.getAppPath(), '/src/static/img/desktop', filename);
        await downloadFile(data.imgUrl, filePath);
        await setWallpaper(filePath);
    })
    // 最小化
    ipcMain.handle('minimize', async (event, data) => {
        const homeWin = HomeWin.getInstance();
        if (homeWin) {
            if (!homeWin.isMinimized()) {
                homeWin.minimize()
            }
        }
    })
    // 最大化
    ipcMain.handle('maximize', async (event, data) => {
        const homeWin = HomeWin.getInstance();
        if (homeWin) {
            if (!homeWin.isMaximized()) {
                homeWin.maximize()
            }
        }
    })
    // 退出最大化
    ipcMain.handle('exitMaximize', async (event, data) => {
        const homeWin = HomeWin.getInstance();
        if (homeWin) {
            if (homeWin.isMaximized()) {
                homeWin.unmaximize()
            }
        }
    })
    // 退出应用
    ipcMain.handle('exitApp', async (event, data) => {
        app.exit();
    })
    // 进入托盘
    ipcMain.handle('enterTray', async (event, data) => {
        const homeWin = HomeWin.getInstance();
        if (homeWin) {
            homeWin.setSkipTaskbar(true);
            homeWin.hide();
        }
    })
    // 判断窗口是否最大化
    ipcMain.handle('getIsMaximized', async (event, data) => {
        const homeWin = HomeWin.getInstance();
        if (homeWin) {
            return homeWin.isMaximized();
        }
    })
}

function openChatHandler(data) {
    const instance = CaptureScreenWin.getInstance()
    if (instance) {
        // 关闭截屏窗口
        instance.close()
    }

    const homeWin = HomeWin.getInstance()
    if (homeWin) {
        // 打开聊天窗口
        homeWin.show()
        homeWin.webContents.send("sendImageText", data)
    }
}