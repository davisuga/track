import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import appCss from "../styles.css?url"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import i18n from "@/lib/i18n"

const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: i18n.t("app.title"),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.t("app.htmlLang")}>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <SidebarProvider defaultOpen>
              <AppSidebar />
              <SidebarInset className="min-h-svh bg-bg-base">
                <SidebarTrigger
                  aria-label={i18n.t("app.sidebar.open")}
                  className="fixed top-4 left-4 z-40 rounded-full border border-border/70 bg-bg-surface shadow-floating md:hidden"
                />
                {children}
              </SidebarInset>
            </SidebarProvider>
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "TanStack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </QueryClientProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
