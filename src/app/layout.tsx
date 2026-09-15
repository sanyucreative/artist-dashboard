import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artist Dashboard",
  description: "Track opportunities, projects, and the applications that connect them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
