import { useState } from "react"
import { createContract } from "arweavekit/contract"

export default function DeployTab({ src, state }: { src: string, state: string }) {
    const [deployTarget, setDeployTarget] = useState("")
    const [walletName, setWalletName] = useState("")
    const [walletUploaded, setWalletUploaded] = useState(false)
    const [wallet, setWallet] = useState<string>("")

    async function deploy() {
        if (!deployTarget) return alert("please select a deployment target")
        if (!walletUploaded) return alert("please upload a wallet")
        console.log("deploying to localhost")
        const contract = await createContract({
            wallet: wallet,
            contractSource: src,
            initialState: state,
            environment: "local",
            strategy: "arweave",
        })
        console.log(contract)
    }

    function fileUploaded(e: FileList) {
        const file = e[0]
        console.log(file)
        if (!file) return
        setWalletName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result
            if (!text) return
            const wallet = JSON.parse(text.toString())
            setWalletUploaded(true)
            setWallet(wallet.toString())
        }
        reader.readAsText(file)
    }

    if (!state || !src) return <div className="w-full h-full p-1 flex flex-col gap-2">
        <div className="text-2xl border-b pb-2 border-white/20">Deploy Contracts</div>
        <div className="text-xl">Please select a contract first</div>
    </div>

    return <div className="w-full h-full p-1 flex flex-col gap-2">
        <div className="text-2xl border-b pb-2 border-white/20">Deploy Contracts</div>
        <div>
            <select className="bg-transparent" defaultValue="" onChange={(e) => setDeployTarget(e.target.value)}>
                <option value="" disabled>select deployment target</option>
                <option value="local">Localhost (npx arlocal)</option>
                <option value="mainnet">Mainnet</option>
            </select>
        </div>
        {deployTarget && <div className="flex gap-2 items-center justify-center">
            <label htmlFor="wallet" className="p-2 cursor-pointer">{!walletUploaded ? "Import a wallet.json file" : `Imported: ${walletName}`}</label>
            <input type="file" accept="application/JSON" id="wallet" className="hidden" onChange={(e) => fileUploaded(e.target.files!)} />
        </div>}
        {walletUploaded && <div><button className="p-2 bg-green-500/10" onClick={deploy}>Deploy</button></div>}
    </div>
}