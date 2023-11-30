import { useEffect, useState } from "react"
// import { ArweaveWebWallet, type State, type AppInfo } from 'arweave-wallet-connector'
import { createContract } from "arweavekit/contract"

// const state: State = { url: 'arweave.app', showIframe: false, usePopup: false, requirePopup: false, keepPopup: false, connected: false }
// const appInfo: AppInfo = {
//     name: "AR Contractor",
//     logo: 'https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg'
// }

// const wallet = new ArweaveWebWallet(appInfo, { state })

export default function DeployPage() {
    const [src, setSrc] = useState<string>("")
    const [state, setState] = useState<string>("")
    const [availableContracts, setAvailableContracts] = useState<string[]>([])
    const [contractTarget, setContractTarget] = useState<string>("")
    const [deployTarget, setDeployTarget] = useState("")
    const [fileName, setFileName] = useState("")
    const [walletUploaded, setWalletUploaded] = useState(false)
    const [walletJWK, setWalletJWK] = useState<string>()
    const [useWallet, setUseWallet] = useState(false)
    // const [connected, setConnected] = useState(false)
    const [error, setError] = useState("")
    // const urlSearchParams = new URLSearchParams(window.location.search)
    // const src = urlSearchParams.get("src")
    // const state = urlSearchParams.get("state")

    useEffect(() => {
        const contracts = localStorage.getItem("contracts")
        if (!contracts) return
        const parsed = JSON.parse(contracts)
        const keys = Object.keys(parsed)
        setAvailableContracts(keys)
    }, [])

    useEffect(() => {
        if (!contractTarget) return
        const contracts = localStorage.getItem("contracts")
        if (!contracts) return
        const parsed = JSON.parse(contracts)
        const contract = parsed[contractTarget]
        if (!contract) return
        const src = contract["contract.js"]
        const state = contract["state.json"]
        if (!src || !state) return
        setSrc(src)
        setState(state)
    }, [contractTarget])

    // if (!src || !state) return <div>please provide src and state</div>

    // wallet.on("connect", () => {
    //     setConnected(true)
    // })

    // wallet.on("disconnect", () => {
    //     setConnected(false)
    // })

    async function deploy() {
        if (!walletUploaded && !useWallet) return alert("please upload a wallet")
        if (deployTarget == "local") {
            console.log("deploying to localhost")
            console.log(src)
            console.log(state)
            try {
                const contract = await createContract({
                    wallet: useWallet ? "use_wallet" : walletJWK!,
                    contractSource: src!,
                    initialState: state!,
                    environment: "local",
                    strategy: "both",
                })
                console.log(contract)
            }
            catch (e) {
                console.log(e)
                setError(`${e} [See the console for more details]`)
            }
        } else if (deployTarget == "mainnet") {
            alert("mainnet deployment is not yet supported")
        } else {
            alert("invalid deployment target")
        }
    }

    function fileUploaded(e: FileList) {
        const file = e[0]
        console.log(file)
        if (!file) return
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result
            if (!text) return
            const walletStr = JSON.parse(text.toString())
            setWalletUploaded(true)
            setWalletJWK(walletStr.toString())
            setUseWallet(false)
        }
        reader.readAsText(file)
    }

    return <div className="w-full h-full p-1 flex flex-col gap-2 text-white/80">
        <div className="text-2xl border-b pb-2 border-white/20">Deploy Contracts</div>
        <select className="bg-transparent" defaultValue="" onChange={(e) => setContractTarget(e.target.value)}>
            <option value="" disabled>select contract to deploy</option>
            {availableContracts.map((contract) => {
                return <option value={contract}>{contract}</option>
            })}
        </select>
        {contractTarget &&
            <select className="bg-transparent" defaultValue="" onChange={(e) => setDeployTarget(e.target.value)}>
                <option value="" disabled>select deployment target</option>
                <option value="local">Localhost (npx arlocal)</option>
                <option value="mainnet">Mainnet</option>
            </select>}
        {deployTarget && <>
            <label htmlFor="wallet" className="p-2 cursor-pointer bg-green-500/10 text-center">{!walletUploaded ? "Import a wallet.json file" : `Imported: ${fileName}`}</label>
            <input type="file" accept="application/JSON" id="wallet" className="hidden" onChange={(e) => fileUploaded(e.target.files!)} />
            or
            <button className="p-2 bg-green-500/10" onClick={() => { setUseWallet(true); setWalletUploaded(false) }}>Use Wallet Connector</button>
        </>}
        {(walletUploaded || useWallet) && <div><button className="p-2 bg-green-500/10" onClick={deploy}>Deploy</button></div>}
        {error && <div className="text-red-500/80 bg-black/40 p-2 text-lg">{error}</div>}
    </div>
}