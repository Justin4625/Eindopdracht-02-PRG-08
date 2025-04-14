import {Link, Outlet} from "react-router";

function Layout() {
    return (
        <>
            <nav>
                <Link to={"/"}>
                    Home
                </Link>
            </nav>
            <main>
                <Outlet/>
            </main>
        </>
    );
}

export default Layout;