import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/lib/auth-context"
import { AdminLogin } from "@/admin/login"
import { AdminLayout } from "@/admin/layout"
import { AdminDashboard } from "@/admin/dashboard"
import { AdminBooks } from "@/admin/books"
import { AdminOrders } from "@/admin/orders"
import { AdminSettings } from "@/admin/settings"
import { AdminComments } from "@/admin/comments"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="livres" element={<AdminBooks />} />
              <Route path="commandes" element={<AdminOrders />} />
              <Route path="commentaires" element={<AdminComments />} />
              <Route path="parametres" element={<AdminSettings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
