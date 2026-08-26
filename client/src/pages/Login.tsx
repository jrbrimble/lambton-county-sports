import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Trophy } from "lucide-react";

type FormMode = "login" | "register";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState("email"); // "email", "phone", "both"
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

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
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      // Check if user is admin after login, else go to dashboard
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.role === "admin") navigate("/admin");
        else navigate("/dashboard");
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
    <div className="min-h-screen bg-[#F4F5F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 shadow-sm border border-[#E0E0E0]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/lambton-county-sports-logo.png"
            alt="Lambton County Sports"
            className="h-20 w-20 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#1B3A6B] mb-1 normal-case tracking-normal">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-center text-sm text-[#666] mb-6">
          Lambton County Sports Directory
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="519-555-1234"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Public Contact Preference</Label>
                <p className="text-xs text-[#666] mb-2">
                  How should buyers contact you for Equipment Swap listings?
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="email"
                      checked={contactPref === "email"}
                      onChange={() => setContactPref("email")}
                    />{" "}
                    Email Only
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="phone"
                      checked={contactPref === "phone"}
                      onChange={() => setContactPref("phone")}
                    />{" "}
                    Phone Only
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="both"
                      checked={contactPref === "both"}
                      onChange={() => setContactPref("both")}
                    />{" "}
                    Both
                  </label>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Min. 8 characters" : ""}
              className="mt-1"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B3A6B] hover:bg-[#1E73BE] text-white font-semibold h-11"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#666] mt-4">
          {mode === "login" ? (
            <>
              Need an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-[#1E73BE] hover:underline font-medium"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[#1E73BE] hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <div className="mt-6 pt-4 border-t border-[#E0E0E0] text-center">
          <a href="/" className="text-sm text-[#666] hover:text-[#1B3A6B]">
            &larr; Back to Directory
          </a>
        </div>
      </div>
    </div>
  );
}
