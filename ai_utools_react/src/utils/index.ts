export function base64toBlob(base64: string) {
    const arr = base64.split(',');
    const mime = arr[0]?.match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
}

// 复制文本
export function clipboardCopy(text: string) {
    /** 创建input元素 */
    const inputEle: HTMLInputElement = document.createElement("input")
    /** 添加需要复制的内容到value属性 */
    inputEle.value = text;
    /** 向页面底部追加输入框 */
    document.body.appendChild(inputEle)
    /** 选择input元素 */
    inputEle.select()
    /** 执行复制命令 */
    document.execCommand("Copy")
    /** 删除动态创建的input元素（复制之后再删除元素，否则无法成功赋值） */
    inputEle.remove()
}