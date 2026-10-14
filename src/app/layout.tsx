import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"VENZARO | Marketplace de veículos",description:"Marketplace de carros e motos"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
