import {Button, Input, Space} from 'antd';
import {useRef, useState, useEffect} from "react";
import {v4} from 'uuid';
import {base64toBlob, clipboardCopy} from '../utils';
import {uploadImg} from '../api';
import { debounce } from 'lodash-es';
import {ClipboardImgPrefix, ClipboardImgSuffix} from "../constant";
const { ipcRenderer } = require('electron');

export default function Screenshot() {

    const [searchStyle, setSearchStyle] = useState({
        display: 'none',
        top: -99999,
        left: -99999
    });
    const [searchContent, setSearchContent] = useState('')
    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [screenData, setScreenData] = useState('')

    const bgCanvas = useRef(null as unknown as HTMLCanvasElement);
    const selectCanvas = useRef(null as unknown as HTMLCanvasElement);

    const mouseStatus = useRef('' as 'down' | 'up' | 'downMove');
    const mouseStartX = useRef(0);
    const mouseStartY = useRef(0);
    const mouseEndX = useRef(0);
    const mouseEndY = useRef(0);

    ipcRenderer.on("initScreenshot", debounce((event: Recordable, data :{ screenData: string, width: number, height: number }) => {
        setWindowWidth(data.width);
        setWindowHeight(data.height);
        setScreenData(data.screenData);
    }, 500))

    useEffect(() => {
        bgHandler(screenData)
        selectHandler()
    }, [screenData])


    const bgHandler = (screenData: string) => {
        const bgCanvas = document.querySelector('#bg') as HTMLCanvasElement;
        if (bgCanvas) {
            const ctx = bgCanvas.getContext('2d');

            if (ctx) {
                const img = new Image();
                img.src = screenData;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                }
            }
        }
    }

    const selectHandler = () => {
        const selectCanvas = document.querySelector('#select') as HTMLCanvasElement;
        if (selectCanvas) {
            const ctx = selectCanvas.getContext('2d');

            if (ctx) {
                selectCanvas.addEventListener('mousedown', (event) => {
                    mouseStatus.current = 'down';
                    mouseStartX.current = event.clientX;
                    mouseStartY.current = event.clientY;
                })

                selectCanvas.addEventListener('mousemove', (event) => {
                    if (mouseStatus.current === 'down' || mouseStatus.current === 'downMove') {
                        mouseStatus.current = 'downMove';
                        mouseEndX.current = event.clientX;
                        mouseEndY.current = event.clientY;
                        drawRect()
                    }
                })

                selectCanvas.addEventListener('mouseup', (event) => {
                    if (mouseStatus.current === 'downMove') {
                        setSearchStyle({
                            display: 'block',
                            top: event.clientY + 20,
                            left: event.clientX - 540
                        })
                    }
                    mouseStatus.current = 'up';
                    mouseEndX.current = event.clientX;
                    mouseEndY.current = event.clientY;
                })

                // 创建 drawRect 函数，根据 mouseStatus 和 mouseX、mouseY 计算矩形的位置和尺寸，并绘制矩形
                function drawRect() {
                    if (mouseStatus.current === 'downMove') {
                        ctx!.clearRect(0, 0, selectCanvas.width, selectCanvas.height);

                        // 画遮罩层
                        ctx!.fillStyle = 'rgba(0, 0, 0, 0.6)';
                        ctx!.fillRect(0, 0, selectCanvas.width, selectCanvas.height);

                        // 镂空选中区域
                        ctx!.clearRect(mouseStartX.current, mouseStartY.current, mouseEndX.current - mouseStartX.current, mouseEndY.current - mouseStartY.current);
                    }
                }
            }
        }
    }

    const searchHandler = async () => {
        const bgContext = bgCanvas.current.getContext('2d');
        if (bgContext) {
            const imageData = bgContext.getImageData(mouseStartX.current, mouseStartY.current, mouseEndX.current - mouseStartX.current, mouseEndY.current - mouseStartY.current);
            // 创建一个临时 canvas 元素
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = mouseEndX.current - mouseStartX.current;
            tempCanvas.height = mouseEndY.current - mouseStartY.current;
            if (tempCtx) {
                tempCtx.putImageData(imageData, 0, 0);
                const dataURL = tempCanvas.toDataURL('image/png');
                const blob = base64toBlob(dataURL);
                const formData = new FormData();
                formData.append('file', blob);

                const res = await uploadImg(formData)
                ipcRenderer.invoke("openChat", {
                    message: searchContent,
                    imgUrl: res.data,
                    uuid: v4()
                })
            }
        }
    }

    const closeHandler = () => {
        ipcRenderer.invoke("closeScreenshot")
    }

    const copyHandler = () => {
        const bgContext = bgCanvas.current.getContext('2d');
        if (bgContext) {
            const imageData = bgContext.getImageData(mouseStartX.current, mouseStartY.current, mouseEndX.current - mouseStartX.current, mouseEndY.current - mouseStartY.current);
            // 创建一个临时 canvas 元素
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = mouseEndX.current - mouseStartX.current;
            tempCanvas.height = mouseEndY.current - mouseStartY.current;
            if (tempCtx) {
                tempCtx.putImageData(imageData, 0, 0);
                const dataURL = tempCanvas.toDataURL('image/png');

                clipboardCopy(ClipboardImgPrefix + dataURL + ClipboardImgSuffix);
                ipcRenderer.invoke("closeScreenshot")
            }
        }
    }

    return (
        <>
            <div className={'fixed z-40'} style={{...searchStyle}}>
                <Space.Compact>
                    <Input
                        placeholder="请输入描述" className={'w-[350px]'}
                        value={searchContent}
                        onChange={evt => setSearchContent(evt.target.value)}
                        onPressEnter={searchHandler}
                    />
                    <Button onClick={searchHandler}>搜索</Button>
                    <Button onClick={copyHandler}>复制</Button>
                    <Button onClick={closeHandler}>关闭</Button>
                </Space.Compact>
            </div>

            <canvas id="bg" ref={bgCanvas}
                    className={'fixed z-10 top-0 left-0'}
                    width={windowWidth} height={windowHeight}/>

            <div className={'fixed z-20 left-0 top-0 w-full h-full border border-red-500'}></div>

            <canvas id="select" ref={selectCanvas}
                    className={'fixed z-30 top-0 left-0'}
                    width={windowWidth} height={windowHeight}/>
        </>
    );
}
