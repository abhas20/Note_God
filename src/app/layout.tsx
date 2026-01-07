import type { Metadata } from "next";
import "../style/globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSideBar";
import NoteProvider from "@/providers/NoteProvider";
import { SocketProvider } from "@/providers/SocketProvider";

export const metadata: Metadata = {
  title: "Note_God",
  description: "Full stack notes app ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <NoteProvider>
              <SidebarProvider>
                <AppSidebar />
                <div className="flex min-h-screen w-full flex-col">
                  <Header />
                  <main className="flex flex-col p-4 pt-10"> {children}</main>
                </div>
                <Toaster />
              </SidebarProvider>
            </NoteProvider>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
