import type { Metadata } from "next";
import "./globals.css";
import FloatingMenu from "@/components/FloatingMenu";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderBar from "@/components/HeaderBar";
import CustomCursor from "@/components/CustomCursor";
import FirstLoadLoader from "@/components/FirstLoadLoader";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: {
    default: "Jesse Peters — A Visual & Digital Designer",
    template: "%s — Jesse Peters",
  },
  description:
    "Jesse Peters is a Visual & Digital Designer creating brand identities and digital experiences.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jessepeters.nl",
    siteName: "Jesse Peters",
    title: "Jesse Peters — A Visual & Digital Designer",
    description:
      "Jesse Peters is a Visual & Digital Designer creating brand identities and digital experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jesse Peters — A Visual & Digital Designer",
    description:
      "Jesse Peters is a Visual & Digital Designer creating brand identities and digital experiences.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Runs synchronously before React hydration so usePageReady() sees
            __pageTransitionActive=true on hard loads — items wait for
            FirstLoadLoader to fire page-transition-complete.
            scrollRestoration=manual stops the browser from restoring the previous
            scroll position on refresh — every reload starts at the top. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__pageTransitionActive=true;if('scrollRestoration' in history){history.scrollRestoration='manual';}",
          }}
        />
        <ThemeProvider>
          <SmoothScroll />
          <FirstLoadLoader />
          <PageTransition />
          <CustomCursor />
          <HeaderBar />
          <main className="relative">{children}</main>
          <div
            className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2"
            style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <FloatingMenu />
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
