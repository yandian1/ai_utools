import {post} from "../utils/request";

export function uploadImg(params: Recordable) {
    return post<string>({
        url: '/thirdpart/uploadImg',
        body: params,
        // 虽然下面这个 headers 为空对象，但不能删除，否则上传文件会失败
        headers: {}
    })
}