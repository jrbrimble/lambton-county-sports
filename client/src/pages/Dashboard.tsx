import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Package, CheckCircle, Clock, Search, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: isUserLoading } = trpc.auth.me.useQuery();
  const { data: listings, isLoading: isListingsLoading } = trpc.swap.myListings.useQuery(undefined, {
    enabled: !!user,
  });
  
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.swap.updateStatus.useMutation({
    onSuccess: () => {
      utils.swap.myListings.invalidate();
      utils.swap.list.invalidate();
    },
  });

  if (isUserLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) {
    navigate("/login");
    return null;
  }

  const activeListings = listings?.filter((l) => l.status === 'active') || [];
  const completedListings = listings?.filter((l) => l.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-[#1B3A6B] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            My Dashboard
          </h1>
          <p className="text-blue-200 text-lg font-medium">
            Manage your equipment swap listings and profile.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Active Listings ({activeListings.length})</h2>
          <button
            onClick={() => navigate("/swap")}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Go to Swap Board &rarr;
          </button>
        </div>

        {isListingsLoading ? (
          <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/4"></div>
          </div>
        ) : activeListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-500 mb-2">No active listings</h3>
            <p className="text-sm text-slate-400">Items you post on the Equipment Swap board will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h3 className="font-bold text-lg">{listing.itemName}</h3>
                  <p className="text-sm text-slate-500">{listing.sportCategory} • ${listing.price / 100}</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Expires on {new Date(listing.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: listing.id, status: "completed" })}
                    disabled={updateStatusMutation.isPending}
                    className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Sold / Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-display text-xl font-bold mt-12 mb-6 text-slate-500">Past Listings ({completedListings.length})</h2>
        {completedListings.length > 0 && (
          <div className="space-y-3 opacity-60">
            {completedListings.map((listing) => (
              <div key={listing.id} className="bg-slate-100 rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-600 line-through">{listing.itemName}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">COMPLETED</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
