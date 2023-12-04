import { useEffect, useState } from "react"
import { createContract } from "arweavekit/contract"

// const derivations = [
//     "not allowed",
//     "Allowed-With-Credit",
//     "Allowed-With-Indication",
//     "Allowed-With-License-Passthrough",
//     "Allowed-With-RevenueShare"
// ]

// const commercialUses = [
//     "not allowed",
//     "Allowed",
//     "Allowed-With-Credit"
// ]

function extractFunctions(src: string) {
    // const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
    const functionRegex = /case\s+"([^"]+)"/g;
    const matches = src.matchAll(functionRegex);
    const functions = [];

    for (const match of matches) {
        if (match[1] == "handle") continue
        functions.push(match[1])
    }

    return functions
}

export default function Deploy() {
    const [src, setSrc] = useState<string>("")
    const [state, setState] = useState<string>("")
    const [availableContracts, setAvailableContracts] = useState<string[]>([])
    const [contractTarget, setContractTarget] = useState<string>("")
    const [deployTarget, setDeployTarget] = useState("")
    // const [derivation, setDerivation] = useState<string>("")
    // const [commercialUse, setCommercialUse] = useState<string>("")
    const [fileName, setFileName] = useState("")
    const [walletUploaded, setWalletUploaded] = useState(false)
    const [walletJWK, setWalletJWK] = useState<string>()
    const [useWallet, setUseWallet] = useState(false)
    const [error, setError] = useState("")
    const [deploySuccess, setDeploySuccess] = useState(false)
    const [contractTxID, setContractTxID] = useState("")

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
                    tags: [
                        { name: "App-Name", value: "AR-Contractor" },
                        { name: "App-Version", value: "0.1.0" },
                    ]
                })
                console.log(contract)
                if (contract.result.status == 200) {
                    setDeploySuccess(true)
                    setError("")
                    setContractTxID(contract.contractTxId)
                    const deployments = sessionStorage.getItem("deployments")
                    if (!deployments) {
                        sessionStorage.setItem("deployments", JSON.stringify({ [contractTarget]: { id: contract.contractTxId, env: deployTarget, functions: extractFunctions(src) } }))
                    }
                    else {
                        const parsed = JSON.parse(deployments)
                        parsed[contractTarget] = { id: contract.contractTxId, env: deployTarget, functions: extractFunctions(src) }
                        sessionStorage.setItem("deployments", JSON.stringify(parsed))
                    }
                }
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
        const file = e[0];
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            setWalletUploaded(true);
            setWalletJWK(JSON.parse(text));
            setUseWallet(false);
            setFileName(file.name);
        };
        reader.readAsText(file);
    }

    return <div className="w-full h-full p-1 flex flex-col gap-2 text-white/80">
        <div className="text-2xl border-b pb-2 border-white/20 text-center">Deploy Contracts</div>
        <label htmlFor="contractSelector" className="">Select a contract to deploy</label>
        <select className="bg-transparent border p-0.5 px-1 border-white/40 " defaultValue="" onChange={(e) => setContractTarget(e.target.value)}>
            <option value="" disabled>...</option>
            {availableContracts.map((contract, _) => {
                return <option key={_} value={contract}>{contract}</option>
            })}
        </select>
        {contractTarget &&
            <>
                <label htmlFor="environmentSelector" className="">Select an environment to deploy</label>
                <select className="bg-transparent border p-0.5 px-1 border-white/40 " defaultValue="" onChange={(e) => setDeployTarget(e.target.value)}>
                    <option value="" disabled>...</option>
                    <option value="local">Localhost (npx arlocal)</option>
                    <option value="mainnet">Mainnet</option>
                </select>
            </>}
        {deployTarget && <>
            <label htmlFor="wallet" className="p-2 cursor-pointer bg-green-500/10 text-center">{!walletUploaded ? "Import a wallet.json file" : `Imported: ${fileName} ✅`}</label>
            <input type="file" accept="application/JSON" id="wallet" className="hidden" onChange={(e) => fileUploaded(e.target.files!)} />
            <div className="text-center">or</div>
            <button className="p-2 bg-green-500/10" onClick={() => { setUseWallet(true); setWalletUploaded(false) }}>Use ArConnect (wip) {useWallet && "✅"}</button>
        </>}
        {/* {(walletUploaded || useWallet) && <div>
            <div className="text-center text-xl">Universal Data Licensing v1.0
                {" "}<a className="underline text-green-100/80 text-sm" target="_blank" href="https://arweave.net/yRj4a5KMctX_uOmKWCFJIjmY8DeJcusVk6-HzLiM_t8">read more</a>
            </div>
            <div className="flex gap-2 flex-col md:flex-row justify-evenly">
                <div className="flex flex-col gap-1 p-1">
                    <label htmlFor="derivation" className="">Derivation Permission</label>
                    <select id="derivation" className="bg-transparent border p-0.5 px-1 border-white/40 " defaultValue="" onChange={(e) => setDerivation(e.target.value)}>
                        <option value="" disabled>...</option>
                        {derivations.map((derivation, _) => {
                            return <option key={_} value={derivation}>{derivation}</option>
                        })}
                    </select>
                    {(derivation == "Allowed-With-RevenueShare") && <input type="number" className="bg-transparent border-b border-white/20" disabled={derivation != "Allowed-With-RevenueShare"} placeholder="revenue share" />}
                </div>
                <div className="flex flex-col gap-1 p-1">
                    <label htmlFor="commercialUse">Commercial Use Permission</label>
                    <select className="bg-transparent border p-0.5 px-1 border-white/40 " defaultValue="" onChange={(e) => setCommercialUse(e.target.value)}>
                        <option value="" disabled>...</option>
                        {commercialUses.map((commercialUse, _) => {
                            return <option key={_} value={commercialUse}>{commercialUse}</option>
                        })}
                    </select>
                </div>
            </div>
        </div>} */}
        {/* {(derivation && commercialUse) && <div className="w-full my-5"><button className="p-2 bg-green-500/10 mx-auto block" onClick={deploy}>Deploy 🚀</button></div>} */}
        {(walletUploaded || useWallet) && <div className="w-full my-5"><button className="p-2 bg-green-500/10 mx-auto block" onClick={deploy}>Deploy 🚀</button></div>}
        {error && <div className="text-red-500/80 bg-black/40 p-2 text-lg">{error}</div>}
        {deploySuccess && <div className="text-green-500/80 bg-black/40 p-2 text-lg">
            <div>Contract deployed successfully!</div>
            <div>Contract TX ID: <span className="text-green-200">{contractTxID}</span></div>
            {deployTarget != "local" && <a href={`https://viewblock.io/arweave/tx/${contractTxID}`} target="_blank" rel="noreferrer" className="block text-green-200 underline">View on ViewBlock</a>}
        </div>}
    </div>
}