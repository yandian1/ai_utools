import { UserOutlined } from '@ant-design/icons';
import { Button, type GetProp, Image, Input, Space, Typography } from 'antd';
import { Bubble, BubbleProps } from '@ant-design/x';
import { useRef, useState } from 'react';
import useGlobalSearch from '@/hooks/useGlobalSearch.tsx';
import markdownit from 'markdown-it';
import { chat } from '@/utils/openAi.ts';
import { uploadImg } from '@/api/index.ts';
import { ClipboardImgPrefix, ClipboardImgSuffix } from "@/constant/index.ts";
import { base64toBlob } from '@/utils';
const { ipcRenderer } = require('electron');

const { TextArea } = Input;
const md = markdownit({ html: true, breaks: true });

type ChatItem = {
    role: 'system' | 'user'
    message?: string
    imgUrl?: string | string[]
    loading?: boolean
}
type ImageText = {
    message: string
    imgUrl: string
    uuid: string
}
type Attachment = {
    url: string
    type: 'image'
}
const imageTextList: ImageText[] = []

const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
        placement: 'start',
        avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
        styles: {
            avatar: {
                marginLeft: '15vw'
            },
            content: {
                width: '100%',
                marginRight: 'calc(15vw + 42px)'
            }
        }
    },
    local: {
        placement: 'end',
        avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
        styles: {
            avatar: {
                marginRight: '15vw'
            },
            content: {
                width: '100%',
                marginLeft: 'calc(15vw + 42px)'
            }
        }
    },
};

const renderMarkdown: BubbleProps['messageRender'] = (content) => (
    <Typography>
        <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
);

export default function ChatText() {
    const [message, setMessage] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [chatList, setChatList] = useState([] as ChatItem[])
    const [attachmentList, setAttachmentList] = useState([] as Attachment[])
    const abortController = useRef<AbortController>(null);
    const searchLock = useRef(false);

    ipcRenderer.on("sendImageText", (event: Recordable, data: { message: string, imgUrl: string, uuid: string }) => {
        if (imageTextList.some((item) => item.uuid === data.uuid)) return
        imageTextList.push(data)

        sendChatRequest(data.message, data.imgUrl)
    })

    const sendChatRequest = async (message: string, imgUrl?: string | string[]) => {
        if (searchLock.current) return;
        searchLock.current = true;

        setChatList(prevState => [
            ...prevState,
            { role: 'user', message, imgUrl },
            { role: 'system', loading: true }
        ])

        setSearchLoading(true)

        abortController.current = new AbortController();

        await chat({
            message,
            imgUrl,
            signal: abortController.current.signal,
            updateChatList: updateChatList,
        });

        setSearchLoading(false)
        searchLock.current = false;
    }

    const updateChatList = (content: string) => {
        setChatList(prevState => {
            const chatItem = prevState[prevState.length - 1];
            // 更新
            chatItem.message = md.render(content)
            chatItem.loading = false
            return [...prevState]
        })
    }

    const searchHandler = () => {
        if (searchLoading) return;
        if (!message.trim()) return;

        let imgUrl = undefined
        if (attachmentList.length) {
            imgUrl = attachmentList.map(item => item.url);
        }
        sendChatRequest(message, imgUrl)
        setMessage('')
        setAttachmentList([])
    }

    const cancelHandler = () => {
        if (abortController.current?.signal.aborted) return
        abortController.current?.abort();
        setSearchLoading(false)
    }

    const pasteHandler = async (event: Recordable) => {
        const items = event.clipboardData?.items
        if (items && items.length > 0) {
            const item = items[0]
            if (item.kind === 'file') {
                const file = item.getAsFile()
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await uploadImg(formData)
                    setAttachmentList(prevState => [...prevState, { url: res.data, type: 'image' }])
                }
            } else if (item.kind === 'string') {
                event.preventDefault();
                item.getAsString(async (text: string) => {
                    if (text && text.startsWith(ClipboardImgPrefix) && text.endsWith(ClipboardImgSuffix)) {
                        text = text.slice(ClipboardImgSuffix.length, -ClipboardImgSuffix.length)
                        const blob = base64toBlob(text);
                        const formData = new FormData();
                        formData.append('file', blob);
                        const res = await uploadImg(formData)
                        setAttachmentList(prevState => [...prevState, { url: res.data, type: 'image' }])
                    } else {
                        setMessage(message + text)
                    }
                });
            }
        }
    }

    const { targetRef, searchRender } = useGlobalSearch()


    return (
        <>
            {searchRender()}

            <div ref={targetRef}
                className={'flex flex-col justify-end w-screen h-screen pt-[5vh] pb-[15vh] bg-gray-100'}>
                <div className={'flex-1 overflow-y-auto'}>
                    <Bubble.List
                        roles={roles}
                        className={'h-[100%]'}
                        items={chatList.map((chat, index) => ({
                            key: index,
                            role: chat.role === 'user' ? 'local' : 'ai',
                            content: chat.message,
                            loading: chat.loading,
                            messageRender: chat.role === 'system' ? renderMarkdown : (content) => {
                                let img = null
                                if (Array.isArray(chat.imgUrl)) {
                                    img = chat.imgUrl.map((url, index) => {
                                        return <div key={index}><img src={url} style={{ maxWidth: '100%' }} alt="" /></div>
                                    })
                                } else if (chat.imgUrl) {
                                    img = <div><img src={chat.imgUrl} style={{ maxWidth: '100%' }} alt="" /></div>
                                }
                                return <>
                                    <div>{content}</div>
                                    {img}
                                </>
                            }
                        }))}
                    />
                </div>

                {
                    attachmentList.length > 0 && (
                        <Space className={'w-full pl-[calc(15vw+42px)] pr-[calc(15vw+42px)] mt-[16px]'}>
                            {
                                attachmentList.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            <Image
                                                width={100}
                                                src={item.url}
                                            />
                                        </div>
                                    )
                                })
                            }
                        </Space>
                    )

                }


                <Space.Compact className={'w-full pl-[calc(15vw+42px)] pr-[calc(15vw+42px)] mt-[16px]'}>
                    <TextArea className={'!resize-none'} placeholder="请输入描述" autoSize={{ minRows: 1 }} value={message} onChange={evt => setMessage(evt.target.value)}
                        onPressEnter={searchHandler} onPaste={pasteHandler} disabled={searchLoading} />
                    {
                        searchLoading
                            ? <Button onClick={cancelHandler} className={'h-full'}>取消</Button>
                            : <Button onClick={searchHandler} className={'h-full'}>搜索</Button>
                    }
                </Space.Compact>
            </div>
        </>
    );
}
