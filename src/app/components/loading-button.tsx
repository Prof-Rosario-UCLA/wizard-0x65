import { useState } from "react";
import { Button, ButtonProps } from "./button";

interface LoadingButtonProps extends ButtonProps<"button"> {
    onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => Promise<void> | void;
}

export function LoadingButton(props: LoadingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button
            {...props}
            onClick={async (event) => {
                setIsLoading(true);
                try {
                    await props.onClick(event);
                } catch (e) {
                    setIsLoading(false);
                    throw e;
                }
                setIsLoading(false);
            }}
            disabled={isLoading || props.disabled}
            className={`${isLoading ? "cursor-wait" : ""} ${props.className}`}
        />
    );
}
