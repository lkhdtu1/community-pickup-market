
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProducersPage from "./pages/ProducersPage";
import PickupPointsPage from "./pages/PickupPointsPage";
import CustomerAccountPage from "./pages/CustomerAccountPage";
import ProviderAccountPage from "./pages/ProviderAccountPage";
import CreateShopPage from "./pages/CreateShopPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/producers" element={<ProducersPage />} />
          <Route path="/pickup-points" element={<PickupPointsPage />} />
          <Route 
            path="/account/customer" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerAccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account/provider" 
            element={
              <ProtectedRoute allowedRoles={['producer']}>
                <ProviderAccountPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-shop" 
            element={
              <ProtectedRoute allowedRoles={['producer']}>
                <CreateShopPage />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
