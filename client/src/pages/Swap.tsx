import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Search,
  MapPin,
  Tag,
  X,
  Plus,
  Package,
  DollarSign,
  Mail,
  Phone,
  User,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

const SPORTS = [
  "Ice Hockey",
  "Ball Hockey",
  "Soccer",
  "Lacrosse",
  "Baseball",
  "Softball",
  "Gymnastics",
  "Football",
  "Basketball",
  "Tennis",
  "Golf",
  "Swimming",
  "Ringette",
  "Volleyball",
  "Curling",
  "Figure Skating",
  "Power Skating",
  "Dance",
  "Martial Arts",
  "Cheerleading",
  "Camps",
  "Other",
];

const TOWNS = [
  "Sarnia",
  "Wyoming",
  "Petrolia",
  "Forest",
  "Grand Bend",
  "Camlachie",
  "Port Lambton",
  "Point Edward",
  "Corunna",
  "Warwick",
  "Lambton Shores",
];

const CONDITIONS = [
  {
    value: "like_new",
    label: "Like New",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "good",
    label: "Good",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "fair",
    label: "Fair",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "worn",
    label: "Well Worn",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

function getConditionStyle(condition: string) {
  return CONDITIONS.find(c => c.value === condition) || CONDITIONS[3];
}

function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function NewListingForm({ onSuccess }: { onSuccess: () => void }) {
  const utils = trpc.useUtils();
  const createMutation = trpc.swap.create.useMutation({
    onSuccess: () => {
      toast.success("Listing posted! It will be visible for 30 days.");
      utils.swap.list.invalidate();
      onSuccess();
    },
    onError: err => {
      toast.error(err.message || "Failed to post listing");
    },
  });

  const [form, setForm] = useState({
    sportCategory: "",
    itemName: "",
    description: "",
    sizeInfo: "",
    condition: "" as string,
    priceDollars: "",
    townArea: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sportCategory || !form.itemName || !form.condition) {
      toast.error("Please fill in all required fields");
      return;
    }
    const price =
      form.priceDollars === "" || form.priceDollars === "0"
        ? 0
        : Math.round(parseFloat(form.priceDollars) * 100);
    createMutation.mutate({
      sportCategory: form.sportCategory,
      itemName: form.itemName,
      description: form.description || undefined,
      sizeInfo: form.sizeInfo || undefined,
      condition: form.condition as "like_new" | "good" | "fair" | "worn",
      price,
      townArea: form.townArea || undefined,
    });
  };

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sport Category *
          </label>
          <Select
            value={form.sportCategory}
            onValueChange={v => updateField("sportCategory", v)}
          >
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
              <SelectValue placeholder="Select sport..." />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map(sport => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Condition *
          </label>
          <Select
            value={form.condition}
            onValueChange={v => updateField("condition", v)}
          >
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Item Name *
        </label>
        <Input
          placeholder="e.g. Bauer Vapor X3.5 Skates"
          value={form.itemName}
          onChange={e => updateField("itemName", e.target.value)}
          className="bg-slate-50 border-slate-200"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Description
        </label>
        <textarea
          placeholder="Tell buyers about the item — brand, model, any damage, etc."
          value={form.description}
          onChange={e => updateField("description", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Size / Age Range
          </label>
          <Input
            placeholder="e.g. Youth Size 4"
            value={form.sizeInfo}
            onChange={e => updateField("sizeInfo", e.target.value)}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Price ($)
          </label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0 = Free"
            value={form.priceDollars}
            onChange={e => updateField("priceDollars", e.target.value)}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Town / Area
          </label>
          <Select
            value={form.townArea || "none"}
            onValueChange={v => updateField("townArea", v === "none" ? "" : v)}
          >
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
              <SelectValue placeholder="Select town..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not specified</SelectItem>
              {TOWNS.map(t => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-sm px-8 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {createMutation.isPending ? "Posting..." : "Post Listing"}
        </button>
      </div>
    </form>
  );
}

export default function EquipmentSwap() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [showNewListing, setShowNewListing] = useState(false);

  const { data: listings, isLoading } = trpc.swap.list.useQuery({
    sport: selectedSport || undefined,
    condition: selectedCondition || undefined,
    search: search || undefined,
  });

  const activeFilters = [
    selectedSport && { type: "sport", label: selectedSport },
    selectedCondition && {
      type: "condition",
      label: getConditionStyle(selectedCondition).label,
    },
  ].filter(Boolean) as Array<{ type: string; label: string }>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#12284D] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold mb-4 backdrop-blur-md">
                <Package className="w-4 h-4" />
                Community Marketplace
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Equipment Swap Board
              </h1>
              <p className="text-blue-200 text-lg font-medium max-w-xl">
                Buy, sell, or give away used sports gear. Kids outgrow equipment
                fast — save money and help other families.
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  navigate("/login?mode=register");
                } else {
                  setShowNewListing(true);
                }
              }}
              className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {user ? (
                <>
                  <Plus className="w-5 h-5" /> Post Equipment
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Sign In / Register to Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-20 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-lg"
            />
          </div>

          <Select
            value={selectedSport || "all"}
            onValueChange={v => setSelectedSport(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40 bg-slate-50 border-slate-200 rounded-lg text-sm">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {SPORTS.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCondition || "all"}
            onValueChange={v => setSelectedCondition(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40 bg-slate-50 border-slate-200 rounded-lg text-sm">
              <SelectValue placeholder="Any Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Condition</SelectItem>
              {CONDITIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilters.length > 0 && (
            <button
              onClick={() => {
                setSelectedSport("");
                setSelectedCondition("");
                setSearch("");
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="h-20 bg-slate-100 rounded mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-slate-400 mb-2">
              No equipment listed yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Be the first to post! List your used sports equipment and help
              other families in the community.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login?mode=register");
                } else {
                  setShowNewListing(true);
                }
              }}
              className="bg-[#4A8C2A] hover:bg-[#3A7A1A] text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              {user ? (
                <>
                  <Plus className="w-5 h-5" /> Post Your First Item
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Sign In / Register to Post
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-400 mb-6">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}{" "}
              available
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(({ listing, user }) => {
                const condStyle = getConditionStyle(listing.condition);
                const daysLeft = Math.ceil(
                  (new Date(listing.expiresAt).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Card Header */}
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#1B3A6B] transition-colors leading-tight truncate">
                            {listing.itemName}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium mt-0.5">
                            {listing.sportCategory}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`font-display text-xl font-extrabold ${listing.price === 0 ? "text-green-600" : "text-slate-900"}`}
                          >
                            {formatPrice(listing.price)}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${condStyle.color}`}
                        >
                          {condStyle.label}
                        </span>
                        {listing.sizeInfo && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                            {listing.sizeInfo}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {listing.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {listing.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="space-y-2 text-sm">
                        {listing.townArea && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{listing.townArea}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span>{user.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        {daysLeft > 0 ? `${daysLeft}d left` : "Expiring soon"}
                      </span>
                      <div className="flex gap-2">
                        {user.showEmail && user.email && (
                          <a
                            href={`mailto:${user.showEmail && user.email}?subject=Re: ${listing.itemName} on Lambton County Sports`}
                            className="inline-flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#12284D] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </a>
                        )}
                        {user.showPhone && user.phone && (
                          <a
                            href={`tel:${user.showPhone && user.phone}`}
                            className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* New Listing Modal */}
      <Dialog.Root open={showNewListing} onOpenChange={setShowNewListing}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-0 w-[95vw] max-w-2xl z-50 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#1B3A6B] p-6 text-white relative">
              <Dialog.Title className="font-display text-2xl font-bold mb-1 pr-8">
                Post Equipment
              </Dialog.Title>
              <p className="text-blue-200 font-medium text-sm">
                List your used sports gear for the community. Listings last 60
                days.
              </p>
              <Dialog.Close asChild>
                <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <NewListingForm onSuccess={() => setShowNewListing(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
