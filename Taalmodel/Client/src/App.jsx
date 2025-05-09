import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./Home.jsx";

const router = createBrowserRouter([{
    children: [
        {
            path: "/",
            element: <Home />
        },
    ]
}]);

function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;
