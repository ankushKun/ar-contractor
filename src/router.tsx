import DeployPage from "./deploy";
import App from "./App";

export default function Router() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    if (tab == 'deploy') {
        console.log("deploying")
        return <DeployPage />
    }
    else {
        return <App />
    }
}