import { ComponentProps } from "react";

export type ButtonProps<As extends React.ElementType> = ComponentProps<As> & {
    as?: As;
};

function Button<As extends React.ElementType = "button">({
    className,
    as,
    ...props
}: ButtonProps<As>) {
    const AsComponent = as ?? "button";
    return (
        <AsComponent
            className={`border rounded-md px-4 py-2 not-disabled:cursor-pointer disabled:opacity-60 ${className}`}
            {...props}
        />
    );
}

export { Button };
