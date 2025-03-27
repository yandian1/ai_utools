import {app, BrowserWindow, dialog} from "electron";
import path from "path";

export class HomeWin {
    static #instance = null;

    static createInstance() {
        if (HomeWin.#instance) return HomeWin.#instance

        HomeWin.#instance = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            icon: path.join(app.getAppPath(), '/src/static/img/tray.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
                devTools: !app.isPackaged,
            }
        });

        if (app.isPackaged) {
            // 避免点击 alt 键展示隐藏的菜单栏，但该设置会导致无法打开开发者工具，所以只在打包后生效
            HomeWin.#instance.setMenu(null);
        }

        if (app.isPackaged) {
            HomeWin.#instance.loadURL('http://124.71.130.245:5000/home')
        } else {
            HomeWin.#instance.loadURL('http://localhost:3000/home')
        }

        // 监听窗口关闭事件，实现最小化
        HomeWin.#instance.on('close', (event) => {
            const index = dialog.showMessageBoxSync({
                type: 'question',
                buttons: ['是', '否'],
                title: '提示',
                message: '是否最小化托盘？',
            })

            if (index === 0) {
                // 最小化托盘
                // 阻止默认关闭事件
                event.preventDefault();

                // 设置窗口不显示在任务栏中
                HomeWin.#instance.setSkipTaskbar(true);
                // 隐藏窗口
                HomeWin.#instance.hide();
            } else if (index === 1) {
                // 退出程序
                app.exit();
            }
        });


        return HomeWin.#instance
    }

    static getInstance() {
        return HomeWin.#instance
    }

    static closeInstance() {
        if (HomeWin.#instance) {
            HomeWin.#instance.close()
        }
    }
}