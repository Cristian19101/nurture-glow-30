import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/ToastContainer";
import { ScrollManager } from "@/components/ScrollManager";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ObesityIdentifier from "./pages/ObesityIdentifier";
import AdaptiveTrainer from "./pages/AdaptiveTrainer";
import VirtualCoach from "./pages/VirtualCoach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollManager />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/obesity-identifier" element={<ObesityIdentifier />} />
            <Route path="/adaptive-trainer" element={<AdaptiveTrainer />} />
            <Route path="/virtual-coach" element={<VirtualCoach />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
