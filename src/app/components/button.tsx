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
            className={`bg-primary disabled:text-white/60 rounded-md px-4 py-2 not-disabled:text-white not-disabled:cursor-pointer disabled:opacity-60 ${className}`}
            {...props}
        />
    );
}

export { Button };
