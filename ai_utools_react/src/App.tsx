import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "@/pages/home";
import Screenshot from "@/pages/screenshot";
import '@ant-design/v5-patch-for-react-19';

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
