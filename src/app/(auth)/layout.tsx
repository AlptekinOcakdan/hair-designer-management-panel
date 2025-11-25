import {LayoutProps} from "@/lib/utils";

const Layout = ({children}:LayoutProps) => {
    return (
        <main className="min-h-dvh min-w-dvw">
            {children}
        </main>
    );
};

export default Layout;