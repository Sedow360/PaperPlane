"use client"
import Navbar from "@/components/comp/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <Navbar/>
        {children}
      </>
  );
}
