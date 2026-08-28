import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, LogIn, UserPlus, ShieldCheck, ArrowLeft, Package } from "lucide-react";

type FormMode = "login" | "register";

export default function Login() {
  const [location, navigate] = useLocation();
  
  // Detect if user navigated to /register or /login?mode=register
  const initialMode: FormMode = 
    location === "/register" || 
    (typeof window !== "undefined" && window.location.search.includes("mode=register"))
      ? "register"
      : "login";

  const [mode, setMode] = useState<FormMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState("email"); // "email", "phone", "both"
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (location === "/register") {
      setMode("register");
    }
  }, [location]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string | boolean> = { email, password };
      if (mode === "register") {
        if (name) body.name = name;
        if (phone) body.phone = phone;
        body.showEmail = contactPref === "email" || contactPref === "both";
        body.showPhone = contactPref === "phone" || contactPref === "both";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      await utils.auth.me.invalidate();
      toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");
      
      // Check if user is admin after login, else go to dashboard or swap
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/lambton-county-sports-logo.png"
            alt="Lambton County Sports"
            className="h-20 w-auto object-contain mb-3"
          />
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {mode === "login" ? "Welcome Back" : "Join the Community"}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Lambton County Sports & Equipment Swap
          </p>
        </div>

        {/* Prominent Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
              mode === "login"
                ? "bg-white text-[#1B3A6B] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
              mode === "register"
                ? "bg-[#4A8C2A] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register (Free)
          </button>
        </div>

        {/* Helpful Context Callout */}
        {mode === "register" ? (
          <div className="mb-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2.5">
            <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950 mb-0.5">Creating an account is 100% Free</p>
              <p className="text-emerald-800 leading-relaxed">
                Post your used sports equipment on the Equipment Swap Board, connect with local buyers, and manage your listings.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1B3A6B] shrink-0" />
            <span>Sign in to manage your listings and account settings.</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="mt-1 bg-slate-50/70 border-slate-200 focus:bg-white"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Phone Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 519-555-0199"
                  className="mt-1 bg-slate-50/70 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Public Contact Method for Buyers
                </Label>
                <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
                  Choose how parents contacting you about your gear can reach out:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex items-center justify-center gap-1.5 text-xs font-semibold p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                    contactPref === "email" ? "bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-xs" : "border-slate-200 text-slate-600 bg-white/50"
                  }`}>
                    <input
                      type="radio"
                      name="contactPref"
                      value="email"
                      className="sr-only"
                      checked={contactPref === "email"}
                      onChange={() => setContactPref("email")}
                    />
                    Email Only
                  </label>
                  <label className={`flex items-center justify-center gap-1.5 text-xs font-semibold p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                    contactPref === "phone" ? "bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-xs" : "border-slate-200 text-slate-600 bg-white/50"
                  }`}>
                    <input
                      type="radio"
                      name="contactPref"
                      value="phone"
                      className="sr-only"
                      checked={contactPref === "phone"}
                      onChange={() => setContactPref("phone")}
                    />
                    Phone Only
                  </label>
                  <label className={`flex items-center justify-center gap-1.5 text-xs font-semibold p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                    contactPref === "both" ? "bg-white border-[#1B3A6B] text-[#1B3A6B] shadow-xs" : "border-slate-200 text-slate-600 bg-white/50"
                  }`}>
                    <input
                      type="radio"
                      name="contactPref"
                      value="both"
                      className="sr-only"
                      checked={contactPref === "both"}
                      onChange={() => setContactPref("both")}
                    />
                    Both
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 bg-slate-50/70 border-slate-200 focus:bg-white"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
              className="mt-1 bg-slate-50/70 border-slate-200 focus:bg-white"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full font-bold h-11 text-sm shadow-md transition-all ${
              mode === "register" 
                ? "bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white" 
                : "bg-[#1B3A6B] hover:bg-[#12284D] text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In to Your Account"
            ) : (
              "Create Free Account"
            )}
          </Button>
        </form>

        {/* Bottom Switcher Callout */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          {mode === "login" ? (
            <p className="text-xs text-slate-600">
              New to Lambton County Sports?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-[#4A8C2A] hover:text-[#3A7A1A] font-bold underline ml-1 cursor-pointer"
              >
                Create a Free Account
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#1B3A6B] hover:text-[#12284D] font-bold underline ml-1 cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </a>
        </div>

      </div>
    </div>
  );
}
