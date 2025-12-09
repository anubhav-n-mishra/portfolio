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
  metadataBase: new URL("https://mishraanubhav.me"),
  title: "Anubhav Mishra | Portfolio",
  description: "Full-Stack Developer & Systems Engineer | AI/ML • Cloud Computing • DBMS • SQL • Cybersecurity",
  keywords: ["Anubhav Mishra", "Portfolio", "Developer", "Full-Stack", "Systems Engineer", "React", "Next.js", "AI/ML", "Cloud Computing", "Cybersecurity"],
  authors: [{ name: "Anubhav Mishra" }],
  icons: {
    icon: "/profile.png",
    apple: "/profile.png",
  },
  openGraph: {
    title: "Anubhav Mishra | Portfolio",
    description: "Full-Stack Developer & Systems Engineer | AI/ML • Cloud Computing • DBMS • SQL • Cybersecurity",
    url: "https://mishraanubhav.me",
    siteName: "Anubhav Mishra Portfolio",
    type: "website",
    images: [
      {
        url: "/profile.png",
        width: 400,
        height: 400,
        alt: "Anubhav Mishra Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anubhav Mishra | Portfolio",
    description: "Full-Stack Developer & Systems Engineer | AI/ML • Cloud Computing • DBMS • SQL • Cybersecurity",
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
