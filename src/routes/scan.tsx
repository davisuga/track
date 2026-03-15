import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/scan")({
  component: ScanLayoutRoute,
})

function ScanLayoutRoute() {
  return <Outlet />
}
