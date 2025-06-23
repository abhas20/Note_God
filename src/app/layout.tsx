import type { Metadata } from "next";
import "../style/globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSideBar";
import NoteProvider from "@/providers/NoteProvider";


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
            <NoteProvider>
            <SidebarProvider>
              <AppSidebar/>
            <div className="flex flex-col min-h-screen w-full">
            <Header/>
          <main className="flex flex-col pt-10 p-4">  {children}</main>
          <SidebarTrigger />
          </div>
          <Toaster/>
          </SidebarProvider>
          </NoteProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
