import SidebarProvider from "@/providers/sidebar"
import Sidebar from "@/components/Sidebar"
import clsx from "clsx"
import "../css/globals.css"

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={clsx("h-full w-full")}>
      <body
        className={clsx(
          "bg-docs-bg dark:bg-docs-bg-dark font-base text-body-regular h-full w-full",
          "text-medusa-text-subtle dark:text-medusa-text-subtle-dark"
        )}
      >
        <SidebarProvider>
          <div className="xl:min-w-xl mx-auto flex w-full max-w-xl">
            <Sidebar />
            <main className="lg:w-api-ref-main relative mt-3 w-full flex-1 px-2">
              {children}
              <div className="bg-docs-bg-surface dark:bg-docs-bg-surface w-api-ref-code absolute top-0 right-0 z-0 h-full"></div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}