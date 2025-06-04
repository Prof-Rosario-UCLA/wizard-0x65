"use client";
import { useEffect, useState } from "react";

export default function NetworkStatus() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const updateOnlineStatus = () => setOnline(navigator.onLine);

        updateOnlineStatus();

        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);

        return () => {
            window.removeEventListener("online", updateOnlineStatus);
            window.removeEventListener("offline", updateOnlineStatus);
        };
    }, []);

    if (online) return null;

    return (
        <div className="bg-yellow-500 text-black text-sm p-2 text-center absolute right-0 left-0 top-0">
            You are offline. Some features may not work.
        </div>
    );
}
