import {desktopCapturer, globalShortcut, screen} from "electron";
import electronLocalshortcut from 'electron-localshortcut';
import {HomeWin} from '../windows/home/index.js'
import {CaptureScreenWin} from '../windows/captureScreen/index.js'
import {closeScreenshotHandler} from "../utils/index.js";

export function shortcutHandler() {

    // 调出界面
    globalShortcut.register('CommandOrControl+Space', () => {
        const homeWin = HomeWin.getInstance()
        if (homeWin) {
            homeWin.show();
        }
    })

    globalShortcut.register('Alt+Z', async () => {
        const screenData = await getScreenData()
        const captureScreenWin = CaptureScreenWin.getInstance()
        if (captureScreenWin.isMinimized()) {
            captureScreenWin.restore();
        }
        captureScreenWin.maximize();
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.size;
        captureScreenWin.webContents.send("initScreenshot", {
            screenData, width, height
        })
        globalShortcut.register('Esc', () => {
            closeScreenshotHandler();
            CaptureScreenWin.createInstance();
        })
    });

    // 全局搜索
    const homeWin = HomeWin.getInstance();
    if (homeWin) {
        electronLocalshortcut.register(homeWin, 'Ctrl+F', () => {
            homeWin.webContents.send("openGlobalSearch")
            // ESC 关闭全局搜索
            electronLocalshortcut.register(homeWin, 'Esc', () => {
                electronLocalshortcut.unregister(homeWin, 'Esc')
                homeWin.webContents.send("closeGlobalSearch")
            })
        })
    }

}

// 获取屏幕截图
async function getScreenData() {

    const {size, scaleFactor} = screen.getPrimaryDisplay();

    const sizeInfo = {
        width: size.width * scaleFactor,
        height: size.height * scaleFactor
    };

    const sources = await desktopCapturer.getSources({
        types: ['screen'], // 设定需要捕获的是"屏幕"，还是"窗口"
        thumbnailSize: sizeInfo
    })

    // 获取第一个屏幕
    return sources[0].thumbnail.toDataURL("image/png");
}