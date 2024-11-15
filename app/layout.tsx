import "./globals.css";
import { ReactNode } from "react";
import SessionProviderWrapper from "./SessionProviderWrapper";

export const metadata = {
  title: "REIA",
  description: "A tool to evaluate resumes based on ATS compatibility.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-100 text-gray-900">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
