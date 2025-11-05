import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HabitTracker from "./pages/HabitTracker";
import AddHabit from "./pages/AddHabit";
import Summary from "./pages/Summary";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import { Layout } from "@/components/Layout";
import { HabitProvider } from "@/contexts/HabitContext";
import { UserProvider } from "@/contexts/UserContext";
import PrivateRoute from "@/components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HabitProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />
            <Route path="/habits" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <HabitTracker />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />
            <Route path="/add-habit" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <AddHabit />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />
            <Route path="/summary" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <Summary />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <Settings />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />
            <Route path="/account" element={
              <PrivateRoute>
                <UserProvider>
                  <Layout>
                    <Account />
                  </Layout>
                </UserProvider>
              </PrivateRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </HabitProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
