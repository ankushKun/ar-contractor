import { useState } from "react"

export default function Tab({ tab }: { tab: string }) {
    const [loading, setLoading] = useState(true)

    return <>
        {loading && <div className="text-center">Opening...</div>}
        <iframe onLoad={() => setLoading(false)} src={`/ar-contractor/?tab=${tab}`} className="w-full h-full border border-white/10"></iframe>
    </>
}