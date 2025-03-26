declare type ResData<D = any> = {
    msg: string
    code: number
    data: D
}

declare type Recordable<V = any> = Record<string, V>;

declare module 'electron' {
    export namespace ipcRenderer {
      export function on(channel: string, listener: (event: any, ...args: any[]) => void): void;
      // 其他需要的类型声明
    }
  }