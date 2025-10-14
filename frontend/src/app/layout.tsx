import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/theme-provider";
import ApolloProviderClient from "@/providers/apollo-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApolloProviderClient>
          <ThemeProvider>
            <Box 
              component="div"
              sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Navbar />
              <Box 
                component="main"
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
      </body>
    </html>
  );
}
