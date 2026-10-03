import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MALINA · Бар",
  description: "Заказы, бар и кухня, склад и контроль смены",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MALINA Бар", statusBarStyle: "black-translucent" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
