import { BrowserRouter } from "react-router-dom";
import { Layout } from "./layout/Layout";

function App() {
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
