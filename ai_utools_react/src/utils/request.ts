import {message} from "antd";
import {RCodeConstant} from "../constant/RCodeConstant";

export default function request<D>(params: {
    method: string,
    url: string,
    body?: any,
    headers?: Recordable
}) {
    const {url, method, body, headers = {"Content-Type": "application/json"}} = params;

    let baseUrl = getBaseUrl(url);

    return fetch(baseUrl + url, {
        method,
        headers,
        body,
    })
        .then(async (res) => {
            if (res.status === 200) {
                const resData = await res.json() as ResData<D>;

                if (resData.code !== RCodeConstant.SUCCESS) {
                    void message.error(resData.msg);
                    return Promise.reject(res);
                }

                return Promise.resolve(resData);
            }

            void message.error(res.statusText);
            return Promise.reject(res);
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

export function post<D>(params: {
    url: string,
    body?: Recordable
    headers?: Recordable
}) {
    const {url, body, headers} = params;
    return request<D>({
        method: "POST", url, body, headers
    });
}


function getBaseUrl(url: string) {
    if (url.startsWith("/thirdpart")) {
        return import.meta.env.VITE_THIRDPART_SERVER_BASE_URL;
    }
    return import.meta.env.VITE_SERVER_BASE_URL
}