import {app, BrowserWindow} from "electron";

export class CaptureScreenWin {
    static #instance = null;

    static createInstance() {
        if (CaptureScreenWin.#instance) return CaptureScreenWin.#instance

        // debug 模式
        // CaptureScreenWin.#instance = new BrowserWindow({
        //     width: 0, // 初始宽度设为 0，稍后会调整为全屏
        //     height: 0, // 初始高度设为 0
        //     frame: false, // 无边框
        //     transparent: false, // 背景透明
        //     alwaysOnTop: false, // 窗口始终置顶
        //     skipTaskbar: false, // 不显示在任务栏中
        //     resizable: false, // 禁止调整大小
        //     movable: false, // 禁止移动
        //     webPreferences: {
        //         nodeIntegration: true,
        //         contextIsolation: false,
        //         webSecurity: false,
        //     },
        // });

        CaptureScreenWin.#instance = new BrowserWindow({
            width: 0, // 初始宽度设为 0，稍后会调整为全屏
            height: 0, // 初始高度设为 0
            frame: false, // 无边框
            transparent: true, // 背景透明
            alwaysOnTop: true, // 窗口始终置顶
            skipTaskbar: true, // 不显示在任务栏中
            resizable: false, // 禁止调整大小
            movable: false, // 禁止移动
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
                devTools: !app.isPackaged,
            },
        });

        CaptureScreenWin.#instance.on('close', () => {
            CaptureScreenWin.#instance = null
        })

        // 加载一个网页或本地HTML文件
        if (app.isPackaged) {
            CaptureScreenWin.#instance.loadURL('http://124.71.130.245:5000/screenshot')
        } else {
            CaptureScreenWin.#instance.loadURL('http://localhost:3000/screenshot')
        }

        return CaptureScreenWin.#instance
    }

    static getInstance() {
        return CaptureScreenWin.#instance
    }

    static closeInstance() {
        if (CaptureScreenWin.#instance) {
            CaptureScreenWin.#instance.close()
        }
    }
}