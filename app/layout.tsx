import type { Metadata } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-baloo" });

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Vidya Jyotish";

export const metadata: Metadata = {
  title: { default: `${SITE} – Astrology based Career Counselling for Students`, template: `%s | ${SITE}` },
  description:
    "Discover the right career path for your child through Vedic astrology, Prashna Kundali, palmistry and face reading. Get a 22-page personalised career report and counselling for parents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${baloo.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
