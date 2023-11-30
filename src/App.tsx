import { useEffect, useState } from "react"
import { useMonaco } from "@monaco-editor/react"
import theme from "monaco-themes/themes/Nord.json"
import { defaultContract, defaultState } from "./default/name"
import { editor } from "monaco-editor"
import DeployTab from "./components/deployTab"
import CodeArea from "./components/codeArea"

type tabs = "" | "settings" | "contract" | "state" | "deploy" | "reset"

type files = {
  [key: string]: {
    "contract.js": string
    "state.json": string
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<tabs>("")
  const [contracts, setContracts] = useState<files>({})
  const [activeContract, setActiveContract] = useState<string>("")
  const monaco = useMonaco()
  monaco?.editor.defineTheme("nord", theme as editor.IStandaloneThemeData)


  useEffect(() => {
    const c = localStorage.getItem("contracts")
    if (c) {
      const parsed = JSON.parse(c)
      setContracts(parsed)
    } else {
      const c = {
        hello: {
          "contract.js": defaultContract,
          "state.json": defaultState,
        },
      }
      localStorage.setItem(
        "contracts",
        JSON.stringify(c),
      )
      setContracts(c)
    }
  }, [])




  const LeftTabButton = ({ text, id }: { text: string, id: tabs }) => {
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`${activeTab == id ? "bg-black/40" : ""} w-full p-3`}
      >
        {text}
      </button>
    )
  }

  const FileTab = ({
    text,
    id,
  }: {
    text: string
    id: "contract" | "state"
  }) => {
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`${activeTab == id ? "bg-black/40" : ""} p-3`}
      >
        {text}
      </button>
    )
  }

  function setCode(e: string) {
    const c = {
      ...contracts,
      [activeContract]: {
        ...contracts[activeContract],
        "contract.js": e,
      },
    }
    localStorage.setItem("contracts", JSON.stringify(c)
    )
    setContracts(c)
  }

  function setState(e: string) {
    const c = {
      ...contracts,
      [activeContract]: {
        ...contracts[activeContract],
        "state.json": e,
      },
    }
    localStorage.setItem("contracts", JSON.stringify(c))
    setContracts(c)
  }

  function newContract() {
    const name = prompt("Enter contract name")
    if (name) {
      const c = {
        ...contracts,
        [name]: {
          "contract.js": defaultContract,
          "state.json": defaultState,
        },
      }
      localStorage.setItem("contracts", JSON.stringify(c))
      setContracts(c)
      setActiveTab("contract")
      setActiveContract(name)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function delContract(e: any, file: string) {
    e.stopPropagation()
    const confirm = window.confirm("Are you sure you want to delete this contract?")
    if (!confirm) return
    const c = { ...contracts }
    delete c[file]
    localStorage.setItem("contracts", JSON.stringify(c))
    setActiveContract("")
    setContracts(c)
    setActiveTab("")
  }

  function renderSwitch(param: tabs) {
    switch (param) {
      case "deploy":
        return <DeployTab src={activeContract ? contracts[activeContract]["contract.js"] : ""} state={activeContract ? contracts[activeContract]["state.json"] : ""} />
      case "contract":
        return <CodeArea value={contracts[activeContract]["contract.js"]} setValue={setCode} language="javascript" />
      case "state":
        return <CodeArea value={contracts[activeContract]["state.json"]} setValue={setState} language="json" />
      case "settings":
        return <>
          Settings Tab
        </>
      default:
        return <>
          <div>Welcome to MixAR Studio</div>
          <div>Choose a contract from the left panel or create a new one</div>
        </>
    }
  }

  return (
    <div className="flex min-h-screen bg-[#282c34] text-white/80">
      <div className="flex flex-col">
        <div className="flex h-full  justify-evenly">
          <div className="flex flex-col border-r border-white/10">
            <LeftTabButton text="🚀" id="deploy" />
            <div className="grow"></div>
            <LeftTabButton text="⚙️" id="settings" />
          </div>
          <div className="w-[200px]">
            <div className="bg-black/10 p-0.5 px-5 break-keep">Contracts</div>
            <div className="">
              {Object.keys(contracts).map((file: string) => {
                return <button className={`flex gap-1 w-full text-left border-b border-white/10 ${activeContract == file && "bg-white/10 "}`}
                  onClick={() => { setActiveContract(file); setActiveTab("contract") }}
                ><div className="overflow-x-scroll grow p-1">{file}</div>
                  <button className=" p-1 bg-red-500/10" onClick={(e) => delContract(e, file)}>x</button>
                </button>
              })}
              <button className="p-1 w-full border-b border-white/10 px-2" onClick={newContract}>+</button>
            </div>
          </div>
        </div>
      </div>
      <div className="grow bg-slate-500/20">
        <div className="flex h-[5vh] items-center bg-[#282c34]">
          {activeContract && <>
            <FileTab id="contract" text="contract.js" />
            <FileTab id="state" text="state.json" />
          </>}
        </div>
        <div className="h-[95vh] w-full bg-blue-300/5  text-center flex flex-col items-center justify-center">
          {renderSwitch(activeTab)}
        </div>
      </div>
    </div>
  )
}

export default App
