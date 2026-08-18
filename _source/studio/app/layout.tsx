import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

// NOTE: the original template built this with headers() to detect the host.
// That is a DYNAMIC function and breaks `output: "export"`, so the origin is
// hardcoded. Keep it hardcoded — see _source/studio/README.md.
export const metadata: Metadata = (() => {
  const origin = "https://tinyobjects.studio";
  const title = "Tiny Objects — Joyful software.";
  const description = "Tiny Objects makes joyful software.";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      type: "website", url: origin, siteName: "Tiny Objects", title, description,
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
})();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
