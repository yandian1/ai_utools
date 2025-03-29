import logo from '@/assets/img/logo.png';
import { CloseOutlined, MinusOutlined, BorderOutlined } from '@ant-design/icons';
import { Space, Button, Modal } from 'antd';
import { ReactNode, useState, useRef, useEffect } from 'react';
const { ipcRenderer } = require('electron');

export default function App({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}

App.Header = () => {
    const [isMaximized, setIsMaximized] = useState(false)
    const appStatus = useRef(1) // 1 打开 2 进入托盘 3 关闭

    // 最小化
    const minimize = async () => {
        await ipcRenderer.invoke("minimize")
    }

    // 最大化
    const maximize = async () => {
        if(isMaximized) {
            await ipcRenderer.invoke("exitMaximize")
            setIsMaximized(false);
        } else{
            await ipcRenderer.invoke("maximize")
            setIsMaximized(true);
        }
    }

    // 关闭窗口
    const close = () => {
        Modal.confirm({
            centered: true,
            title: '提示',
            content: '是否退出应用？',
            okText: '最小化到托盘',
            cancelText: '是',
            onOk() {
                appStatus.current = 2
            },
            onCancel() {
                appStatus.current = 3
            },
            afterClose() {
                if(appStatus.current === 2) {
                    ipcRenderer.invoke("enterTray")
                } else if(appStatus.current === 3) {
                    ipcRenderer.invoke("exitApp")
                }
            }
        });
    }

    // 判断窗口是否最大化
    const getIsMaximized = async () => {
        const isMaximized = await ipcRenderer.invoke("getIsMaximized")
        setIsMaximized(isMaximized);
    }
    useEffect(() => {
        getIsMaximized();
    }, [])

    return (
        <>
            <div className={`flex items-center pl-[20px] pr-[10px] h-[72px]`}>
                <div className='flex justify-between w-full'>
                    <div className='flex'>
                        <img src={logo} className='w-10 h-10 rounded-lg' />
                    </div>
                    <div>
                        <Space>
                            <Button type="text" icon={<MinusOutlined className='cursor-pointer' />} onClick={minimize} />
                            <Button type="text" icon={<BorderOutlined className='cursor-pointer' />} onClick={maximize} />
                            <Button type="text" icon={<CloseOutlined className='cursor-pointer' />} onClick={close} />
                        </Space>
                    </div>
                </div>
            </div>
        </>
    )
}

App.Body = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <div className={`h-[calc(100vh-72px)]`}>
                {children}
            </div>
        </>
    )
}