import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "YetiAI",
  description: "Created by lhasang",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assests/yeti.png"></link>
      </head>
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  );
}
