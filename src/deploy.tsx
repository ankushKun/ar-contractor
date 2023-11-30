import React, { useState } from "react"
import { ArweaveWebWallet, type State, type AppInfo } from 'arweave-wallet-connector'
import { createContract } from "arweavekit/contract"

const state: State = { url: 'arweave.app', showIframe: false, usePopup: false, requirePopup: false, keepPopup: false, connected: false }
const appInfo: AppInfo = {
    name: "AR Contractor",
    logo: 'https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg'
}

const wallet = new ArweaveWebWallet(appInfo, { state })

export default function DeployPopup({ src, state, target }: { src: string, state: string, target: string }) {
    const [connected, setConnected] = useState(false)


    wallet.on("connect", () => {
        setConnected(true)
    })

    wallet.on("disconnect", () => {
        setConnected(false)
    })

    async function deploy() {
        if (target == "local") {
            console.log("deploying to localhost")
            const contract = await createContract({
                wallet: wallet,
                contractSource: src,
                initialState: state,
                environment: "local",
                strategy: "arweave",
            })
            console.log(contract)
        } else {
            alert("mainnet deployment is not yet supported")
        }
    }

    return <React.StrictMode>
        <div>
            <button onClick={() => wallet.connect()}>connect wallet</button>
            {connected && <button onClick={deploy} disabled={!connected}>deploy</button>}
        </div>
    </React.StrictMode>
}