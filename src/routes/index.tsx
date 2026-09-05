import { createFileRoute } from "@tanstack/react-router"

import { MakerApp } from "@/components/maker-app"

export const Route = createFileRoute("/")({ component: MakerApp })
