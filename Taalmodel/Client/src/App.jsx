import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./Home.jsx";
import Layout from "./Layout.jsx";

const router = createBrowserRouter([{
    element: <Layout />,
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
