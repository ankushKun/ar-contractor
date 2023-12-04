import { createTransaction } from "arweavekit"
import { writeContract, viewContractState } from "arweavekit/contract"
import JSZip from "jszip"
import { useEffect, useState } from "react"
import { v4 } from "uuid"
import { useConnection, useActiveAddress } from "arweave-wallet-kit"

type cdata = {
    [key: string]: {
        [key: string]: string
    }
}

export default function Cloud() {
    const [contracts, setContracts] = useState<cdata>({})
    const [repositories, setRepositories] = useState<object[]>([])
    const [repoNames, setRepoNames] = useState<string[]>([])
    const { connected, connect, disconnect } = useConnection()
    const activeAddress = useActiveAddress()

    useEffect(() => {
        const c = localStorage.getItem("contracts")
        if (c) {
            const parsed = JSON.parse(c)
            setContracts(parsed)
        }
    }, [])

    async function fetchUserRepos() {
        console.log(activeAddress)
        const txn = await viewContractState({
            environment: "local",
            contractTxId: "ezLF9nMIBWSc_5iv2HI5IJwEsY8K6OgbzONMEx82-Nc",
            strategy: "arweave",
            options: {
                function: "getRepositoriesByOwner",
                payload: {
                    owner: activeAddress
                }
            }
        })
        console.log(txn)
        if (txn.result.status == 200) {
            const repos = txn.viewContract.result
            console.log("repos", repos)
            setRepositories(repos)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setRepoNames(repos.map((repo: any) => repo.name))
        }
    }

    useEffect(() => {
        if (connected)
            fetchUserRepos()
    }, [activeAddress, connected])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function newRepo(e: any, file: string) {
        e.stopPropagation()
        const zip = new JSZip()
        // zip.file("contract.js", contracts[file]["contract.js"])
        // zip.file("state.json", contracts[file]["state.json"])
        for (const key in contracts[file]) {
            zip.file(key, contracts[file][key])
        }
        zip.generateAsync({ type: "arraybuffer" }).then(async function (content) {
            // file upload txn
            const txn = await createTransaction({
                data: content,
                type: "data",
                environment: "local",
                options: { signAndPost: true }
            })
            console.log(txn)
            if (txn.postedTransaction.status == 200) {
                // update protocol land create repo
                const createRepoTxn = await writeContract({
                    wallet: "use_wallet",
                    environment: "local",
                    contractTxId: "ezLF9nMIBWSc_5iv2HI5IJwEsY8K6OgbzONMEx82-Nc",
                    options: {
                        function: "initialize",
                        payload: {
                            name: file,
                            description: "sample desc",
                            dataTxId: txn.transaction.id,
                            id: v4(),
                        }
                    }
                })
                console.log(createRepoTxn)
                fetchUserRepos()
            }
        })
    }

    async function importRepo(id: string) {
        if (id in contracts) return alert("repo already imported")
        if (!(id in repositories)) return alert("repo not found")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const repo = repositories.find((repo: object) => repo.id == id)
        console.log(repo)
        if (!repo) return alert("repo not found")

        const dataTxId = repo.dataTxId
        fetch(`http://localhost:1984/tx/${dataTxId}`).then(async (res) => {
            const data = await res.json()
            console.log(data)
            const zip = new JSZip()
            zip.loadAsync(data.data).then(async (zip) => {
                const files = zip.files
                const contract = await files["contract.js"].async("string")
                const state = await files["state.json"].async("string")
                setContracts({
                    ...contracts, [repo.name]: {
                        "contract.js": contract,
                        "state.json": state
                    }
                })
            })
        })
    }

    async function updateData(name: string, id: string) {


    }

    function auth() {
        if (connected)
            disconnect()
        else
            connect()
    }

    return (
        <div>
            <div>Cloud Storage Tab</div>
            <button onClick={auth}>{connected ? "disconnect" : "connect"}</button>
            {connected && <div>{activeAddress}</div>}
            <div className="flex flex-col gap-2">
                {/* {
                    Object.keys(contracts).map((contract, i) => {
                        return (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p>{contract}</p>
                                </div>
                                <div className="flex items-center">
                                    <button onClick={e => newRepo(e, contract)} className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded-md">Upload</button>
                                </div>
                            </div>
                        )
                    })
                } */}
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    repositories.map((repo: any, i) => {
                        return (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p>{repo.name}</p>
                                </div>
                                <div className="flex items-center">
                                    {repo.name in contracts ? <button className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded-md">Push Updates</button> : <button className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded-md" onClick={() => importRepo(repo.id)}>Import</button>}
                                </div>
                            </div>
                        )
                    })
                }
                {
                    Object.keys(contracts).map((contract, i) => {
                        if (!repoNames.includes(contract)) return (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <p>{contract}</p>
                                </div>
                                <div className="flex items-center">
                                    <button className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded-md" onClick={(e) => newRepo(e, contract)}>Create Repo</button>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}