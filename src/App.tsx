import {BrowserRouter as Router, Redirect, Route,} from "react-router-dom";
import MenuNav from "@/components/ux/menu-nav.tsx";
import Lab1 from "@/views/Lab1";

function App() {
    return (
        <Router>
            <MenuNav items={[
                {title: "Lab 1", route: "/lab1"},
            ]}/>
            <Route exact path="/lab1">
                <Lab1/>
            </Route>
            <Route exact path={"/"}>
                <Redirect to={"/lab1"}/>
            </Route>
        </Router>
    )
}

export default App
