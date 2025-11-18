import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { startRealtime } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Subjects from "@/pages/subjects";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Timetable from "@/pages/timetable";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

function Protected({ children }: { children: React.ReactNode }) {
  const { userId, ready } = useAuth()
  const [, navigate] = useLocation()
  if (!ready) return null
  if (supabase && !userId) {
    navigate('/login')
    return null
  }
  return <>{children}</>
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <Protected>
          <Dashboard />
        </Protected>
      )} />
      <Route path="/calendar" component={() => (
        <Protected>
          <Calendar />
        </Protected>
      )} />
      <Route path="/subjects" component={() => (
        <Protected>
          <Subjects />
        </Protected>
      )} />
      <Route path="/timetable" component={() => (
        <Protected>
          <Timetable />
        </Protected>
      )} />
      <Route path="/reports" component={() => (
        <Protected>
          <Reports />
        </Protected>
      )} />
      <Route path="/settings" component={() => (
        <Protected>
          <Settings />
        </Protected>
      )} />
      <Route component={NotFound} />
      <Route path="/login" component={Login} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" data-testid="button-notifications">
                      <Bell className="w-5 h-5" />
                    </Button>
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  {startRealtime()}
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
