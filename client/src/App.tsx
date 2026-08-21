import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Directory from "./pages/Directory";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import Swap from "./pages/Swap";
import Navbar from "./components/Navbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Directory} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/swap" component={Swap} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Navbar />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
