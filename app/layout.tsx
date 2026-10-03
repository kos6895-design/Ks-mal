import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MALINA · Бар",
  description: "Заказы, бар и кухня, склад и контроль смены",
  other: {
    "codex-preview": "development",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MALINA Бар", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
