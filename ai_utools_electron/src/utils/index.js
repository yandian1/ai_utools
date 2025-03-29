import {CaptureScreenWin} from "../windows/captureScreen/index.js";
import {globalShortcut} from "electron";
import fs from 'fs';
import https from 'https';
import log from 'electron-log';

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
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                const error = `文件下载失败: ${response.statusCode}`;
                log.error('下载文件失败', { response });
                reject(new Error(error));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                log.info('文件下载成功');
                resolve(outputPath);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            log.error('HTTP请求错误', { err });
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            log.error('文件写入错误', { err });
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