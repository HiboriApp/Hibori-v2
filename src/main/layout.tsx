export default function Layout({ children }: { children: JSX.Element}) : JSX.Element {
    return (
        <div className="h-screen bg-gray-700">
            <div className="flex justify-center items-center h-full">
                {children}
            </div>
        </div>
    );
}