import Deploy from "./deploy";
import Test from "./test";
import Cloud from "./cloud";
import Showcase from "./showcase";
import App from "./App";

export default function Router() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    switch (tab) {
        case "deploy":
            return <Deploy />
        case "test":
            return <Test />
        case "cloud":
            return <Cloud />
        case "showcase":
            return <Showcase />
        default:
            return <App />
    }
}