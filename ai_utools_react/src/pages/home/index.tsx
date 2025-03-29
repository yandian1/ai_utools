import { Tabs } from 'antd';
import ChatText from './components/chatText'
import ChatImage from './components/chatImage'
import App from "@/components/app";
import { useState } from 'react';
const { ipcRenderer } = require('electron');

export default function Home() {
    const [activeTab, setActiveTab] = useState('text')
    
    const tabItems = [
        { key: 'text', label: '聊天', children: <ChatText /> },
        { key: 'image', label: '桌面', children: <ChatImage /> },
    ];

    ipcRenderer.on("sendImageText", (event: Recordable, data: Recordable) => {
        setActiveTab('text')
    })
    
    return (
        <>
            <App>
                <App.Header></App.Header>
                <App.Body>
                    <Tabs className='h-full' defaultActiveKey={activeTab} items={tabItems} tabPosition="left" />
                </App.Body>
            </App>
        </>
    );
}
