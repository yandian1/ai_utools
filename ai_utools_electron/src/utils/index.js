import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {globalShortcut} from "electron";
import fs from 'fs';
import https from 'https';

export function closeScreenshotHandler() {
    globalShortcut.unregister("Esc")

    const instance = CaptureScreenWin.getInstance()
    if (!instance) return

    // 关闭截屏窗口
    instance.close()
}

/**
 * 下载文件并保存到指定路径
 * @param {string} url - 要下载的文件URL
 * @param {string} outputPath - 文件保存的本地路径
 * @returns {Promise<string>} 返回保存文件的路径
 */
export function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        // 创建写入流
        const file = fs.createWriteStream(outputPath);
        
        // 发起 HTTPS 请求下载文件
        https.get(url, (response) => {
            // 检查响应状态码
            if (response.statusCode !== 200) {
                reject(new Error(`文件下载失败: ${response.statusCode}`));
                return;
            }

            // 将响应流通过管道传输到文件写入流
            response.pipe(file);

            // 文件写入完成时的处理
            file.on('finish', () => {
                file.close();
                resolve(outputPath);
            });
        }).on('error', (err) => {
            // 请求错误时删除未完成的文件
            fs.unlink(outputPath, () => {});
            reject(err);
        });

        // 文件写入错误时的处理
        file.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

/**
 * 从URL中提取文件后缀名
 * @param {string} url - 文件的URL地址
 * @returns {string} 返回小写的文件后缀名，如果未找到则返回空字符串
 * @example
 * getFileUrlExt('https://example.com/image.PNG') // 返回 'png'
 * getFileUrlExt('https://example.com/file') // 返回 ''
 */
export function getFileUrlExt(url) {
    const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
    return match ? match[1].toLowerCase() : '';
}