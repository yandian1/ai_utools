import { useState, KeyboardEvent } from "react";
import { Input, Button, Space, Spin, Flex } from 'antd';
import { HeaderHeight } from "@/constant";
const { ipcRenderer } = require('electron');

const { TextArea } = Input;

export default function ChatImage() {
    const [imgUrl, setImgUrl] = useState('')
    const [message, setMessage] = useState('')
    const [genLoading, setGenLoading] = useState(false)
    const [imgStatus, setImgStatus] = useState<'default' | 'genLoading' | 'genSuccess' | 'genFailed' | ''>('default')

    const genImage = async () => {
        setGenLoading(true)
        setImgStatus('genLoading')
        const res1 = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sk-24d18ac2212447469aa30f217945ef86",
                "X-DashScope-Async": "enable"
            },
            body: JSON.stringify({
                "model": "wanx2.1-t2i-turbo",
                "input": {
                    "prompt": message
                },
                "parameters": {
                    "size": "1024*1024",
                    "n": 1
                }
            }),
        })
        .then(response => response.json())

      console.log("res1", res1)
      const tast_id = res1.output.task_id
      console.log("tast_id", tast_id)

      const intervalId = setInterval(async () => {
        const res2 = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${tast_id}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer sk-24d18ac2212447469aa30f217945ef86",
            },
          }).then(response => response.json())
        console.log("res2", res2)
        const { task_status, results } = res2.output
        if (task_status === 'SUCCEEDED') {
            setImgUrl(results[0].url)
            clearInterval(intervalId)
            setGenLoading(false)
            setImgStatus('genSuccess')
        } else if (task_status === 'FAILED') {
            clearInterval(intervalId)
            setGenLoading(false)
            setImgStatus('genFailed')
        } else if (task_status === 'UNKNOWN') {
            clearInterval(intervalId)
            setGenLoading(false)
            setImgStatus('genFailed')
        } else if (task_status === 'SUSPENDED') {
            setImgStatus('genLoading')
        } else if (task_status === 'RUNNING') {
            setImgStatus('genLoading')
        } else if (task_status === 'PENDING') {
            setImgStatus('genLoading')
        } else {
            setImgStatus('genFailed')
            clearInterval(intervalId)
            setGenLoading(false)
        }
      }, 1000) 
    }

    const setDesktop = async () => {
        ipcRenderer.invoke("setDesktop", {
            imgUrl: imgUrl,
        })
    }

    const enterHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        genImage()
    }

    const genHandler = () => {
        genImage()
    }

    const cancelHandler = () => {
    }

    const pasteHandler = async (event: Recordable) => {
    }

    const imgRender = () => {
        if (imgStatus === 'default') {
           return (
            <>
                <div className="flex flex-1 justify-center items-center">
                    <div className='w-[200px] h-[200px] bg-gray-200 rounded-[20px]'></div>
                </div>
            </>
           )
        }

        if (imgStatus === 'genLoading') {
            return (
                <>
                    <div className="flex flex-1 justify-center items-center">
                        <Spin spinning={true}>
                            <div className='w-[200px] h-[200px] bg-gray-200 rounded-[20px]'></div>
                        </Spin>
                    </div>
                </>
            )
        }

        if (imgStatus === 'genSuccess') {
            return (
                <>
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <div className="flex flex-col flex-1 overflow-y-scroll">
                            <img src={imgUrl} alt="" />
                        </div>
                        <div className="text-center pt-[20px]">
                            <Button type="primary" onClick={setDesktop}>设为桌面</Button>
                        </div>
                    </div>
                </>
            )

         }

         return null
    }

    return (
        <>
            <div className={`flex flex-col h-[calc(100vh-${HeaderHeight})]`}>

                {imgRender()}

                <div className='pt-[100px] pb-[150px]'>
                    <Space.Compact className={'w-full pl-[calc(15vw+42px)] pr-[calc(15vw+42px)] mt-[16px]'}>
                        <TextArea className={'!resize-none'} placeholder="请输入描述" autoSize={{ minRows: 1, maxRows: 4 }} value={message} onChange={evt => setMessage(evt.target.value)}
                            onPressEnter={enterHandler} onPaste={pasteHandler} disabled={genLoading} />
                        {
                            genLoading
                                ? <Button onClick={cancelHandler}>取消</Button>
                                : <Button onClick={genHandler}>生成</Button>
                        }
                    </Space.Compact>
                </div>
            </div>
        </>
    );
}
