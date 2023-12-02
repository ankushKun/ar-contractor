import { useEffect, useState } from "react"
import { writeContract, viewContractState } from "arweavekit/contract"

type deployments = {
    [key: string]: {
        id: string,
        env: "local" | "mainnet"
    }
}

type ftypes = "read" | "write" | ""

export default function Test() {
    const [deployments, setDeployments] = useState<deployments>({})
    const [selectedContract, setSelectedContract] = useState<string>("")
    const [functionType, setFunctionType] = useState<ftypes>("")
    const [functionName, setFunctionName] = useState<string>("")
    const [functionArgs, setFunctionArgs] = useState<string>("")
    const [result, setResult] = useState<string>("")
    const [state, setState] = useState<string>("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const d = sessionStorage.getItem("deployments")
        if (!d) return
        setDeployments(JSON.parse(d))
    }, [])

    async function interact() {
        if (!selectedContract) setResult("please select a contract")
        else if (functionType == "") setResult("please select a function type")
        else if (!functionName) setResult("please enter a function name")

        if (functionType == "read") {
            const res = await viewContractState({
                environment: deployments[selectedContract].env,
                contractTxId: deployments[selectedContract].id,
                options: {
                    function: functionName
                },
                strategy: "arweave"
            })
            console.log(res)
            if (res.result.status == 200) {
                setSuccess(true)
                setResult(JSON.stringify({ result: res.viewContract.result }, null, 2))
            } else {
                setSuccess(false)
                setResult(`error: ${res.result.status}
                ${res.result.statusText}
                
                ${res.viewContract.errorMessage}`)
            }
            setState(JSON.stringify(res.viewContract.state, null, 2))
        }
        else if (functionType == "write") {
            const res = await writeContract({
                wallet: "use_wallet",
                environment: deployments[selectedContract].env,
                contractTxId: deployments[selectedContract].id,
                options: {
                    function: functionName,
                    ...JSON.parse(functionArgs)
                },
                strategy: "arweave"
            })
            console.log(res)
            if (res.result.status == 200) {
                setSuccess(true)
                setResult("TXN ID: " + res.writeContract.originalTxId)
            } else {
                setSuccess(false)
                setResult(`error: ${res.result.status}
${res.result.statusText}

${res.writeContract.errorMessage}`)

            }
            setState(JSON.stringify(res.state, null, 2))
        }
    }

    return (
        <div className="w-full h-full p-1 border border-white/10">
            <div className="text-2xl pb-2 border-b border-white/20 text-center">Test your contracts</div>
            <div className="py-2 text-lg">Select a contract to test</div>
            <select className="w-full bg-transparent p-0.5 px-1 border border-white/40" defaultValue="" onChange={(e) => setSelectedContract(e.target.value)}>
                <option value="" disabled>...</option>
                {Object.keys(deployments).map((name, _) => {
                    return <option key={_} value={name}>{name} ({deployments[name].id})</option>
                })}
            </select>
            {
                selectedContract &&
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex flex-col gap-2">
                        <div className="text-lg">Call a function</div>
                        <div className="flex flex-col gap-2">
                            <select className="w-full bg-transparent p-0.5 px-1 border border-white/40" defaultValue="" onChange={(e) => setFunctionType(e.target.value as ftypes)}>
                                <option value="" disabled>function type</option>
                                <option value="read">read state</option>
                                <option value="write">write state</option>
                            </select>
                            <input className="w-full bg-transparent p-0.5 px-1 border border-white/40" placeholder="function name" onChange={(e) => setFunctionName(e.target.value)} />
                            <textarea className="w-full bg-transparent p-0.5 px-1 border border-white/40" rows={10} placeholder="input json (optional)" defaultValue={JSON.stringify({ name: "ankushKun" }, undefined, 2)} onChange={(e) => setFunctionArgs(e.target.value)} />
                            <button className="bg-transparent p-0.5 px-1 border border-white/50" onClick={() => interact()}>call</button>
                        </div>
                    </div>
                    <pre className={`mt-9 bg-black/40 p-1 px-2 overflow-scroll ${success ? "text-green-200" : "text-red-200"}`}>
                        RESULT<br />
                        {result || "..."}
                        <br /><br />
                        STATE<br />
                        {state || "..."}
                    </pre>
                </div>
            }
        </div>
    )
}