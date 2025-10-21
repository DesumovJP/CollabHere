import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/theme-provider";
import ApolloProviderClient from "@/providers/apollo-provider";
import { AuthProvider } from "@/providers/auth-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ScrollManager from "@/components/scroll-manager";
import { Box } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaDi Blog & Catalog",
  description: "Next.js + Strapi GraphQL demo with MUI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ApolloProviderClient>
            <ThemeProvider>
            <Box 
              component="div"
              suppressHydrationWarning
              sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: [
                  'radial-gradient(1200px circle at 26% 12%, rgba(144,156,194,0.40), transparent 58%)',
                  'radial-gradient(1000px circle at 78% 88%, rgba(118,129,179,0.30), transparent 70%)',
                  'linear-gradient(135deg, rgba(144,156,194,0.70) 0%, rgba(118,129,179,0.65) 40%, rgba(64,77,117,0.62) 70%, rgba(24,29,39,0.60) 100%)'
                ].join(', ')
              }}
            >
              <ScrollManager />
              <Navbar />
              <Box 
                component="main"
                className="page-transition"
                sx={{ 
                  flex: "1 0 auto", 
                  minHeight: "calc(100vh - 95vh)" 
                }}
              >
                {children}
              </Box>
              <Footer />
            </Box>
            </ThemeProvider>
          </ApolloProviderClient>
        </AuthProvider>
      </body>
    </html>
  );
}
