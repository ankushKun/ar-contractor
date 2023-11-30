export default function DeployTab({ src, state }: { src: string, state: string }) {

    if (!state || !src) return <div className="w-full h-full p-1 flex flex-col gap-2">
        <div className="text-2xl border-b pb-2 border-white/20">Deploy Contracts</div>
        <div className="text-xl">Please select a contract first</div>
    </div>

    return <iframe src={`/ar-contractor/deploy?src=${src}&state=${state}`} className="w-full h-full border border-white/10"></iframe>

}