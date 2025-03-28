import { Tabs } from 'antd';
import ChatText from './components/chatText'
import ChatImage from './components/chatImage'
import { useState } from 'react';

export default function Home() {

    const tabItems = [
        { key: 'image', label: '图片' },
        { key: 'text', label: '文字' },
    ];
    const [activeKey, setActiveKey] = useState('image');
    return (
        <>
            <Tabs
                defaultActiveKey={activeKey}
                tabPosition="left"
                items={tabItems}
                className='fixed top-0 bottom-0 left-0'
                onChange={tab => {setActiveKey(tab)}}
            />

            {activeKey === 'text' ? <ChatText /> : <ChatImage />}
        </>
    );
}
