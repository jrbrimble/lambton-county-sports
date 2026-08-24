import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { BellRing, X, PlusCircle, Package, Shield, LayoutDashboard, User as UserIcon } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

function HighLevelModal({
  trigger,
  title,
  formId,
}: {
  trigger: React.ReactNode;
  title: string;
  formId: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in zoom-in-95 focus:outline-none">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <Dialog.Title className="text-xl font-bold font-display text-slate-800">
              {title}
            </Dialog.Title>
            <Dialog.Close className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full min-h-[500px] flex items-center justify-center bg-slate-50/50">
            {/* PLACEHOLDER FOR HIGHLEVEL IFRAME */}
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto opacity-20"></div>
              <p className="text-slate-500 font-medium">
                Waiting for HighLevel embed code...
              </p>
              <p className="text-xs text-slate-400">Form ID: {formId}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/lambton-county-sports-logo.png"
              alt="Lambton County Sports"
              className="h-10 w-auto"
            />
            <span className="font-display font-bold text-xl text-slate-800 hidden sm:block tracking-tight">
              Lambton County Sports
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6 border-l border-slate-200 pl-4 lg:pl-8">
            <HighLevelModal
              formId="submit_registration"
              title="Submit a Registration"
              trigger={
                <button
                  className={`font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1.5 rounded-md ${
                    location === "/"
                      ? "text-slate-600 hover:text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit A Program
                </button>
              }
            />

            <button
              onClick={() => navigate("/swap")}
              className={`font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1.5 rounded-md ${
                location === "/swap"
                  ? "text-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <Package className="w-4 h-4" />
              Equipment Swap
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {user ? (
            <button
              onClick={() =>
                navigate(user.role === "admin" ? "/admin" : "/dashboard")
              }
              className={`font-semibold text-sm transition-colors px-2 lg:px-3 py-1.5 rounded-md hidden md:flex items-center gap-1.5 whitespace-nowrap ${
                location === "/admin" || location === "/dashboard"
                  ? "text-blue-600 bg-blue-50/50"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              {user.role === "admin" ? (
                <><Shield className="w-4 h-4" /> Admin</>
              ) : (
                <><LayoutDashboard className="w-4 h-4" /> Dashboard</>
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-sm transition-colors px-2 lg:px-3 py-1.5 rounded-md hidden md:flex items-center gap-1.5 whitespace-nowrap text-slate-600 hover:text-blue-600 hover:bg-slate-50"
            >
              <UserIcon className="w-4 h-4" /> Sign In
            </button>
          )}
          <button
            onClick={() => {
              if (location === "/") {
                const el = document.getElementById("alerts");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
                setTimeout(() => {
                  const el = document.getElementById("alerts");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 500);
              }
            }}
            className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-[11px] lg:text-[13px] uppercase tracking-wider px-3 lg:px-6 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 lg:gap-2 whitespace-nowrap"
          >
            <BellRing className="w-3.5 h-3.5 lg:w-4 lg:h-4 lg:mb-[2px]" />
            Never Miss A Signup
          </button>
        </div>
      </div>
    </nav>
  );
}
