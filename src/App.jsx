import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Schemes from "./pages/Schemes";
import Sentiment from "./pages/Sentiment";
import Complaints from "./pages/Complaints";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import Upload from "./pages/Upload";
import Regions from "./pages/Regions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="civlens-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/schemes" element={<Schemes />} />
                  <Route path="/sentiment" element={<Sentiment />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/regions" element={<Regions />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
