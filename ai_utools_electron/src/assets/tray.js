import path from "node:path";
import {app, Menu, Tray} from "electron";
import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {HomeWin} from "../windows/home/index.js";


let trayInstance = null

export function createTray() {

    if (trayInstance) return

    // 获取HomeWin的单例实例
    const instance = HomeWin.getInstance();

    // 构建托盘图标的文件路径
    const iconPath = path.join(app.getAppPath(), '/src/static/img/tray.png');

    // 创建系统托盘实例
    trayInstance = new Tray(iconPath);

    // 构建托盘图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出',
            click: () => {
                // 当点击退出菜单项时，
                // destoryTray();
                // HomeWin.closeInstance();
                // CaptureScreenWin.closeInstance();
                app.exit();
            }
        }
    ]);

    // 为托盘图标设置上下文菜单
    trayInstance.setContextMenu(contextMenu);

    // 设置托盘图标的工具提示文本
    trayInstance.setToolTip('helper');

    // 为托盘图标设置点击事件处理程序
    trayInstance.on('click', () => {
        // 根据HomeWin实例的可见性，决定是隐藏还是显示窗口
        if (instance.isVisible()) {
            instance.setSkipTaskbar(true);
            instance.hide();
        } else {
            // 在任务栏显示
            instance.setSkipTaskbar(false);
            instance.show();
        }
    });
}

export function destoryTray() {
    if (trayInstance) {
        trayInstance.destroy()
    }
}