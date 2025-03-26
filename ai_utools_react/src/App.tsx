import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/home";
import Screenshot from "./pages/screenshot";

export default function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/screenshot" element={<Screenshot/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}
