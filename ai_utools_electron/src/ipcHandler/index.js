import {HomeWin} from "../windows/home/index.js";
import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {ipcMain} from "electron";
import {closeScreenshotHandler} from "../utils/index.js";

export function ipcHandler() {
    ipcMain.handle('openChat', (event, data) => {
        openChatHandler(event, data);
        CaptureScreenWin.createInstance();
    })
    ipcMain.handle('closeScreenshot', () => {
        closeScreenshotHandler();
        CaptureScreenWin.createInstance();
    })
}

function openChatHandler(event, data) {
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