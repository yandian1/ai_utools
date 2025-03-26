import express from 'express'
import path from 'path'
import {getDirname} from './utils/index.js'
import {logger} from './utils/log.js'

const app = express()

const dirname = getDirname(import.meta.url)

// 静态资源
app
    .use(express.static(path.join(dirname, 'dist')))
    .on('error', (err) => {
        console.log('err', err)
    })

// 如果你想为所有未匹配到静态资源的请求返回一个特定页面（例如 index.html）
app.get('*', (req, res) => {
    const indexPath = path.join(dirname, 'dist', 'index.html');
    res.sendFile(indexPath);
});

app.listen(5000, (err) => {
    if (err) throw err;
    console.log('Ready on http://127.0.0.1:5000');
})

app.on('error', (err) => {
    console.log('errorerror', err)
})

// 监听进程终止信号
process.on('SIGTERM', () => {
    logger.info('收到 SIGTERM 信号，服务正在优雅关闭...');
    app.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('收到 SIGINT 信号，服务正在优雅关闭...');
    app.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
    });
});

// 处理未捕获的 Promise 异常
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的 Promise 拒绝:', {
        reason: reason,
        stack: reason.stack
    });
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', {
        error: error.message,
        stack: error.stack
    });

    // 给进程一点时间来记录日志
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});