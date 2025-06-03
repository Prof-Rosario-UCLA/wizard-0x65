import { ReactNode } from "react";

type HeadingProps = {
    children: ReactNode;
};

function Heading({ children }: HeadingProps) {
    return (
        <>
            <h1 className="w-full">
                <div className="text-3xl text-white font-bold py-4 px-12 bg-linear-to-r from-primary to-secondary">
                    {children}
                </div>
            </h1>
        </>
    );
}

function SecHeading({ children }: HeadingProps) {
    return (
        <>
            <h2 className="w-full">
                <div className="text-3xl text-white font-bold py-2 text-center px-12 bg-linear-to-r from-primary to-secondary">
                    {children}
                </div>
            </h2>
        </>
    );
}

export { Heading, SecHeading };
