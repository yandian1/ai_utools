import {useEffect, useRef, useState} from "react";
import {Input, InputRef} from "antd";
import Mark from "mark.js";
const { ipcRenderer } = require('electron');

export default function useGlobalSearch() {
    const [showSearch, setShowSearch] = useState(false)
    const [inputContent, setInputContent] = useState('')
    const inputRef = useRef(null as unknown as InputRef);
    const targetRef = useRef(null as unknown as HTMLDivElement);
    const markInstance = useRef(null as unknown as Mark);

    ipcRenderer.on("openGlobalSearch", () => {
        if (showSearch) return
        setShowSearch(true)
        setTimeout(() => {
            inputRef.current.focus()
        }, 1000);
    })

    ipcRenderer.on("closeGlobalSearch", () => {
        if (!showSearch) return
        setShowSearch(false)
        setInputContent('')
        markInstance.current.unmark()
    })

    const globalSearch = (event: Recordable) => {
        const content = event.target.value?.trim()
        if (!content) return

        markInstance.current.mark(event.target.value, {
            "element": "span",
            "className": "highlight"
        });
    }

    const searchRender = () => {
        return (
            <div className={`fixed top-[15px] right-[15px] ${showSearch ? '' : 'hidden'}`}>
                <Input value={inputContent} ref={inputRef} onChange={evt => setInputContent(evt.target.value)}
                       onPressEnter={globalSearch} allowClear/>
            </div>
        )
    }

    useEffect(() => {
        markInstance.current = new Mark(targetRef.current);
    }, []);

    return {
        targetRef,
        searchRender
    }
}