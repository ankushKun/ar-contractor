import { Editor } from "@monaco-editor/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CodeArea({ value, setValue, language }: { value: string, setValue: any, language: string }) {
    return <Editor
        className="h-[95vh] w-full"
        width="100%"
        language={language}
        value={value}
        theme="custom"
        defaultValue={value}
        onChange={e => setValue(e)}
    />
}