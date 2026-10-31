import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { FinTrackProvider } from "@/context/FinTrackContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rupee Radar - UPI & Payment Gateway Financial Platform",
  description: "One Stop Finance Platform with 3D Ledger Analytics and Razorpay Payment Gateway",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <FinTrackProvider>
            {/* Main Navigation Header */}
            <Header />
            <main className="min-h-screen">{children}</main>
            {/* Footer */}
            <footer className="bg-blue-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800 py-10 transition-colors">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-slate-400 text-sm font-medium">
                <p>© Rupee Radar — 3D Financial & UPI Payment Platform</p>
              </div>
            </footer>
          </FinTrackProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
