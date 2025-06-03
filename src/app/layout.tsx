import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Wizard 0x65",
    description: "A software-themed autobattler!",
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="">
            <link
                rel="icon"
                type="image/png"
                href="/favicon-96x96.png"
                sizes="96x96"
            />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
            />

            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#000000" />

            <body>{children}</body>
        </html>
    );
}
