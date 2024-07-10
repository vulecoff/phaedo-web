import { BrowserRouter } from "react-router-dom";
import { Layout } from "./layout/Layout";

function App() {
    console.log("APP boots");
    // TODO: systemize app structure with routing, programatic routing
    return (
        <>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </>
    );
}

export default App;
