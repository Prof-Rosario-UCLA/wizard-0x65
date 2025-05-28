function Heading({ children }) {
    return (
        <>
            <h1 className="flex justify-center">
                <div className="border rounded-md px-4 py-2 text-2xl xl:text-4xl">
                    {children}
                </div>
            </h1>
        </>
    );
}

export { Heading };
