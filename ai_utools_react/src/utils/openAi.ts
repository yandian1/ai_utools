import OpenAI from "openai";

const messageList: any[] = []
const openAI = new OpenAI(
    {
        apiKey: "sk-24d18ac2212447469aa30f217945ef86",
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dangerouslyAllowBrowser: true
    }
);

export const chat = async (params: {
    message: string,
    imgUrl?: string | string[],
    signal: AbortSignal
    updateChatList: (content: string) => void
}) => {
    const {message, imgUrl, signal, updateChatList} = params

    if (Array.isArray(imgUrl)) {
        messageList.push({
            "role": "user",
            "content": [
                ...imgUrl.map(url => ({
                    "type": "image_url",
                    "image_url": {"url": url},
                })),
                {
                    "type": "text", "text": message
                }
            ]
        })
    } else if (imgUrl) {
        messageList.push({
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": imgUrl},
                },
                {
                    "type": "text", "text": message
                }
            ]
        })
    } else {
        messageList.push({role: "user", content: message})
    }

    const completion = await openAI.chat.completions.create(
        {
            model: "qwen-omni-turbo",
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                ...messageList
            ],
            stream: true,
            modalities: ["text"],
        },
        {
            signal
        }
    );


    let reply = '';

    for await (const chunk of completion) {
        const delta = chunk.choices[0].delta;
        if (delta.content) {
            reply += delta.content;
            updateChatList(reply)
        }
    }


    messageList.push({ role: "system", content: reply });
};