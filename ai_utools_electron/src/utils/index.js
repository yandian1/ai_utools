import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {globalShortcut} from "electron";

export function closeScreenshotHandler() {
    globalShortcut.unregister("Esc")

    const instance = CaptureScreenWin.getInstance()
    if (!instance) return

    // 关闭截屏窗口
    instance.close()
}