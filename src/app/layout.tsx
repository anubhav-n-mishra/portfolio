import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anubhav Mishra | Portfolio IDE",
  description: "Full-Stack Developer & Systems Engineer Portfolio - Built like a code editor",
  keywords: ["Anubhav Mishra", "Portfolio", "Developer", "Full-Stack", "Systems Engineer", "React", "Next.js"],
  authors: [{ name: "Anubhav Mishra" }],
  icons: {
    icon: "/profile.png",
    apple: "/profile.png",
  },
  openGraph: {
    title: "Anubhav Mishra | Portfolio IDE",
    description: "Full-Stack Developer & Systems Engineer Portfolio",
    type: "website",
    images: ["/profile.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
