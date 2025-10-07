import { RouterProvider } from "react-router-dom"
import { router } from "./router/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"


const queryClient = new QueryClient()

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors/>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
