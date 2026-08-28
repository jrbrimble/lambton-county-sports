import React, { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Search,
  X,
  Info,
  Filter,
  ArrowUp,
  ArrowUpDown,
  BellRing,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

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
  "Sailing",
  "Wrestling",
  "Martial Arts",
  "Dance",
  "Cheerleading",
  "Figure Skating",
  "Power Skating",
  "Camps",
];

const emojiMap: Record<string, string> = {
  "Ice Hockey": "🏒",
  "Ball Hockey": "🏑",
  Soccer: "⚽",
  Lacrosse: "🥍",
  Baseball: "⚾",
  Softball: "🥎",
  Gymnastics: "🤸",
  Football: "🏈",
  Basketball: "🏀",
  Tennis: "🎾",
  Golf: "⛳",
  Swimming: "🏊",
  Ringette: "💍",
  Volleyball: "🏐",
  Curling: "🥌",
  Sailing: "⛵",
  Wrestling: "🤼",
  "Martial Arts": "🥋",
  Dance: "💃",
  Cheerleading: "📣",
  "Figure Skating": "⛸️",
  "Power Skating": "⛸️",
  Camps: "🏕️",
};

const HERO_IMAGES = [
  "/hero-basketball.png",
  "/hero-soccer.jpg",
  "/hero-hockey.jpg",
  "/hero-baseball.jpg",
  "/hero-tennis.jpg",
];

const TOP_SPORTS = [
  "Ice Hockey",
  "Soccer",
  "Baseball",
  "Basketball",
  "Figure Skating",
  "Gymnastics",
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

const AGE_RANGES = [
  { label: "Ages 3-5 (Pre-K to SK)", min: 3, max: 5 },
  { label: "Ages 6-8 (Grades 1-3)", min: 6, max: 8 },
  { label: "Ages 9-11 (Grades 4-6)", min: 9, max: 11 },
  { label: "Ages 12-14 (Grades 7-8)", min: 12, max: 14 },
  { label: "Ages 15-17 (Grades 9-11)", min: 15, max: 17 },
  { label: "Ages 18+ (Senior)", min: 18, max: 99 },
];

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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full min-h-[500px] bg-slate-50/50">
            <iframe
              src={`https://link.convertmorebusiness.com/widget/form/${formId}`}
              style={{ width: "100%", height: "100%", minHeight: "600px", border: "none", borderRadius: "8px" }}
              id={`inline-${formId}`}
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name={title}
              data-height="1169"
              data-layout-iframe-id={`inline-${formId}`}
              data-form-id={formId}
              data-cookie-consent="true"
              data-cookie-consent-provider="auto"
              title={title}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Directory() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [selectedAge, setSelectedAge] = useState("");
  const [sortBy, setSortBy] = useState("closing_soon");

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx(prev => (prev + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ageRange = useMemo(() => {
    if (!selectedAge) return undefined;
    const range = AGE_RANGES.find(r => r.label === selectedAge);
    return range ? { min: range.min, max: range.max } : undefined;
  }, [selectedAge]);

  const { data: allProgramsForStats } = trpc.programs.list.useQuery({});
  const { data: programs, isLoading } = trpc.programs.list.useQuery({
    search: search || undefined,
    sport: selectedSport || undefined,
    townArea: selectedTown || undefined,
    status: (selectedStatus as any) || undefined,
    ageMin: ageRange?.min,
    ageMax: ageRange?.max,
  });

  const { data: topAds } = trpc.ads.listActive.useQuery({
    position: "banner_top",
  });
  const { data: bottomAds } = trpc.ads.listActive.useQuery({
    position: "banner_bottom",
  });
  const { data: sidebarAds } = trpc.ads.listActive.useQuery({
    position: "sidebar_card",
  });
  const { data: inlineAds } = trpc.ads.listActive.useQuery({
    position: "inline_card",
  });

  const activeFilters = [
    selectedSport && {
      type: "sport",
      label: selectedSport,
      value: selectedSport,
    },
    selectedTown && { type: "town", label: selectedTown, value: selectedTown },
    selectedStatus && {
      type: "status",
      label: selectedStatus,
      value: selectedStatus,
    },
    selectedAge && { type: "age", label: selectedAge, value: selectedAge },
  ].filter(Boolean) as Array<{ type: string; label: string; value: string }>;

  const clearFilter = (type: string) => {
    if (type === "sport") setSelectedSport("");
    if (type === "town") setSelectedTown("");
    if (type === "status") setSelectedStatus("");
    if (type === "age") setSelectedAge("");
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedSport("");
    setSelectedTown("");
    setSelectedStatus("");
    setSelectedAge("");
  };

  const handleScrollToDirectory = () => {
    const el = document.getElementById("directory-start");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Sorting logic
  const displayPrograms = useMemo(() => {
    if (!programs) return [];
    let sorted = [...programs];

    if (sortBy === "closing_soon") {
      sorted.sort((a, b) => {
        if (!a.registrationCloseDate) return 1;
        if (!b.registrationCloseDate) return -1;
        return (
          new Date(a.registrationCloseDate).getTime() -
          new Date(b.registrationCloseDate).getTime()
        );
      });
    } else if (sortBy === "a_z") {
      sorted.sort((a, b) => a.sportName.localeCompare(b.sportName));
    } else if (sortBy === "recent") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [programs, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Sport
        </label>
        <Select
          value={selectedSport || "all"}
          onValueChange={v => setSelectedSport(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-slate-500">
              All Sports
            </SelectItem>
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
          Location
        </label>
        <Select
          value={selectedTown || "all"}
          onValueChange={v => setSelectedTown(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
            <SelectValue placeholder="All Towns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-slate-500">
              All Towns
            </SelectItem>
            {TOWNS.map(town => (
              <SelectItem key={town} value={town}>
                {town}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Status
        </label>
        <Select
          value={selectedStatus || "all"}
          onValueChange={v => setSelectedStatus(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-slate-500">
              All Statuses
            </SelectItem>
            <SelectItem value="open">🟢 Open</SelectItem>
            <SelectItem value="upcoming">🟡 Upcoming</SelectItem>
            <SelectItem value="closed">⚪ Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Age Group
        </label>
        <Select
          value={selectedAge || "all"}
          onValueChange={v => setSelectedAge(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm">
            <SelectValue placeholder="All Ages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-slate-500">
              All Ages
            </SelectItem>
            {AGE_RANGES.map(range => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 bg-[#4A8C2A] text-white p-3 rounded-full shadow-2xl hover:bg-[#3A7A1A] transition-colors border-2 border-white/20"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-[#1B3A6B] text-white px-8 py-3.5 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20 text-sm tracking-wide"
        >
          <Filter className="w-4 h-4" /> Filters
          {activeFilters.length > 0 && (
            <span className="ml-1 bg-white text-[#1B3A6B] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-xl text-slate-800">
                Refine Search
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <FilterPanel />
            <div className="mt-8 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-[#4A8C2A] text-white font-bold rounded-xl shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      <Dialog.Root
        open={!!selectedProgram}
        onOpenChange={open => !open && setSelectedProgram(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-0 w-[95vw] max-w-lg z-50 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {selectedProgram && (
              <>
                <div className="bg-[#1B3A6B] p-6 text-white relative">
                  <Dialog.Title className="font-display text-2xl font-bold mb-1 pr-8">
                    {selectedProgram.sportName}
                  </Dialog.Title>
                  <p className="text-blue-200 font-medium">
                    {selectedProgram.organization}
                  </p>
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Status Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                        Registration
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedProgram.registrationOpenDate
                          ? new Date(
                              selectedProgram.registrationOpenDate
                            ).toLocaleDateString()
                          : "TBD"}
                        {" - "}
                        {selectedProgram.registrationCloseDate
                          ? new Date(
                              selectedProgram.registrationCloseDate
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                    <div className="flex-1 border-l border-slate-200 pl-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                        Season Starts
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedProgram.programStartDate
                          ? new Date(
                              selectedProgram.programStartDate
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                  </div>

                  {/* Info List */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Location
                        </p>
                        <p className="font-medium text-slate-800">
                          {selectedProgram.townArea}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Age Groups
                        </p>
                        <p className="font-medium text-slate-800">
                          {selectedProgram.ageGroups}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedProgram.notes && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-[#1B3A6B]">
                        <Info className="w-4 h-4" />
                        <span className="font-bold text-sm uppercase tracking-wider">
                          Details & Notes
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedProgram.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  {selectedProgram.registrationUrl ? (
                    <a
                      href={selectedProgram.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white shadow-md bg-[#4A8C2A] hover:bg-[#3A7A1A] transition-all"
                    >
                      Visit Website / Register
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-center text-sm text-slate-500 italic">
                      No registration link available.
                    </p>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Top Navigation Bar */}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#12284D] text-white pt-12 lg:pt-16 pb-16 md:pb-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1.5px, transparent 1.5px)`,
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch min-h-[450px]">
            {/* Text Column - Increased width and font size */}
            <div className="lg:col-span-7 flex flex-col justify-center py-8 lg:pr-4 text-center lg:text-left items-center lg:items-start">
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold mb-6 leading-[1.1] tracking-tight text-white drop-shadow-md">
                Find Every Kids Sport Signup in Lambton County
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 font-medium leading-relaxed max-w-2xl">
                Registration dates, age groups, and sign-up links for all youth
                sports programs. All in one place.
              </p>
              <div>
                <button
                  onClick={handleScrollToDirectory}
                  className="bg-[#4A8C2A] text-white px-10 py-5 rounded-xl font-extrabold hover:bg-[#3A7A1A] transition-all transform hover:-translate-y-1 hover:shadow-lg uppercase tracking-wider text-base"
                >
                  Browse Programs
                </button>
              </div>
            </div>

            {/* Image Column - Increased width from 4 to 5 columns on XL */}
            <div className="hidden lg:flex lg:col-span-5 relative">
              <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500 bg-slate-100">
                {HERO_IMAGES.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt="Kids playing sports"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIdx ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A6B]/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur text-[#1B3A6B] px-4 py-3 rounded-xl shadow-lg inline-flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A8C2A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4A8C2A]"></span>
                    </span>
                    <span className="font-bold text-sm">
                      60+ Local Programs Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      {topAds && topAds.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-200 shadow-sm relative z-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex justify-center">
            {topAds.map((ad: any) => (
              <a
                key={ad.id}
                href={ad.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative w-full"
              >
                <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Sponsor
                </div>
                <img
                  src={ad.imageUrl || undefined}
                  alt={ad.title || "Advertisement"}
                  className="w-full h-auto object-contain transition-transform group-hover:scale-[1.01]"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        id="directory-start"
        className="max-w-6xl mx-auto px-6 lg:px-8 py-12 scroll-mt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Main Directory Area (Left Side) */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-bold text-[#1B3A6B] tracking-tight">
                Browse Directory
              </h2>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sort:
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-0 bg-transparent h-8 shadow-none focus:ring-0 px-1 text-sm font-semibold w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closing_soon">
                        Closing Soonest
                      </SelectItem>
                      <SelectItem value="a_z">A - Z</SelectItem>
                      <SelectItem value="recent">Recently Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <span className="hidden sm:inline-block text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm text-sm border border-slate-200">
                  {displayPrograms.length} Found
                </span>
              </div>
            </div>

            {/* Primary Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for a sport, club, or town..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 pl-12 pr-4 py-6 text-lg text-slate-800 placeholder-slate-400 rounded-xl focus-visible:ring-2 focus-visible:ring-[#4A8C2A] shadow-inner"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 pt-4">
                <span className="text-sm font-semibold text-slate-500 py-1.5 pr-2">
                  Popular:
                </span>
                {TOP_SPORTS.map(sport => (
                  <button
                    key={sport}
                    onClick={() =>
                      setSelectedSport(selectedSport === sport ? "" : sport)
                    }
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      selectedSport === sport
                        ? "bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              {/* Dropdown Grid (Added to Main Body as requested) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100 hidden md:grid">
                <Select
                  value={selectedSport || "all"}
                  onValueChange={v => setSelectedSport(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="font-semibold text-slate-500"
                    >
                      All Sports
                    </SelectItem>
                    {SPORTS.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTown || "all"}
                  onValueChange={v => setSelectedTown(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="All Towns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="font-semibold text-slate-500"
                    >
                      All Towns
                    </SelectItem>
                    {TOWNS.map(town => (
                      <SelectItem key={town} value={town}>
                        {town}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus || "all"}
                  onValueChange={v => setSelectedStatus(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="font-semibold text-slate-500"
                    >
                      All Statuses
                    </SelectItem>
                    <SelectItem value="open">🟢 Open</SelectItem>
                    <SelectItem value="upcoming">🟡 Upcoming</SelectItem>
                    <SelectItem value="closed">⚪ Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedAge || "all"}
                  onValueChange={v => setSelectedAge(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-lg">
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="font-semibold text-slate-500"
                    >
                      All Ages
                    </SelectItem>
                    {AGE_RANGES.map(range => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <span className="text-sm font-semibold text-slate-500 mr-1">
                  Active Filters:
                </span>
                {activeFilters.map(filter => (
                  <button
                    key={`${filter.type}-${filter.value}`}
                    onClick={() => clearFilter(filter.type)}
                    className="bg-white text-[#1B3A6B] px-3 py-1.5 text-sm font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {filter.label}
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-slate-500 hover:text-slate-800 underline text-sm font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Programs 2-Column Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                  >
                    <Skeleton className="h-6 w-1/2 mb-4 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 mb-6 rounded-lg" />
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full rounded-lg" />
                      <Skeleton className="h-6 w-full rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayPrograms.map((program, idx) => (
                  <React.Fragment key={program.id}>
                    <ProgramCard
                      program={program}
                      onMoreInfo={() => setSelectedProgram(program)}
                    />

                    {/* Inline Ad injected cleanly across both columns every 8 items (Alternating) */}
                    {inlineAds &&
                      inlineAds.length > 0 &&
                      (idx + 1) % 8 === 0 &&
                      (() => {
                        const blockIndex = Math.floor((idx + 1) / 8) - 1;
                        const ad = inlineAds[blockIndex % inlineAds.length];
                        return (
                          <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center relative shadow-inner mt-2 mb-2">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                              Community Sponsor
                            </div>
                            <div className="flex justify-center mt-2">
                              <a
                                href={ad.destinationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                              >
                                <img
                                  src={ad.imageUrl || undefined}
                                  alt={ad.title || "Advertisement"}
                                  className="h-24 w-auto object-contain rounded-lg transition-transform group-hover:scale-105 drop-shadow-sm"
                                />
                              </a>
                            </div>
                          </div>
                        );
                      })()}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No programs found
                </h3>
                <p className="text-slate-500 mb-6">
                  We couldn't find any programs matching your current filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Area (Right Side) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Refined Sidebar Filters */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-display font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                  Refine Search
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </h3>
                <FilterPanel />
              </div>

              {/* Sidebar Ads */}
              {sidebarAds && sidebarAds.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Proudly Supported By
                    </span>
                  </div>
                  <div className="p-4 space-y-6">
                    {sidebarAds.map((ad: any) => (
                      <a
                        key={ad.id}
                        href={ad.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <img
                          src={ad.imageUrl || undefined}
                          alt={ad.title || "Advertisement"}
                          className="w-full h-auto rounded-lg shadow-sm border border-slate-100 transition-all group-hover:shadow-md group-hover:-translate-y-0.5"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-slate-400 font-bold text-lg">$</span>
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2">
                    Advertise Here
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Support local youth sports and reach thousands of parents.
                  </p>
                  <a
                    href="https://link.convertmorebusiness.com/widget/form/1CCxDZ3WadfM9IbjIZCk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1B3A6B] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner Ad */}
      {bottomAds && bottomAds.length > 0 && (
        <div className="bg-white border-t border-slate-200 shadow-sm mt-12 py-6">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 flex justify-center relative">
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm z-10">
              Community Sponsor
            </div>
            {bottomAds.map((ad: any) => (
              <a
                key={ad.id}
                href={ad.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block group w-full"
              >
                <img
                  src={ad.imageUrl || undefined}
                  alt={ad.title || "Advertisement"}
                  className="w-full h-auto max-h-32 object-cover rounded-lg shadow-sm transition-transform group-hover:scale-[1.01]"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Browse By Sport Section */}
      <section className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-slate-800 mb-4">
              Browse by Sport
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Find exactly what you're looking for by filtering our directory by
              your favorite local sports and activities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SPORTS.map(sport => {
              const emoji = emojiMap[sport] || "🏅";
              const count =
                allProgramsForStats?.filter(
                  p => p.isActive && p.sportName === sport
                ).length || 0;

              return (
                <button
                  key={sport}
                  onClick={() => {
                    setSelectedSport(sport);
                    setSelectedStatus(""); // Clear the open/closed filter so they can see all programs for this sport!
                    window.scrollTo({
                      top:
                        document.getElementById("directory-content")
                          ?.offsetTop || 500,
                      behavior: "smooth",
                    });
                  }}
                  className="bg-slate-50 hover:bg-[#1B3A6B] hover:text-white group border border-slate-200 hover:border-[#1B3A6B] transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm hover:shadow-md"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {emoji}
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-sm text-slate-800 group-hover:text-white transition-colors">
                      {sport}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-blue-200 mt-1">
                      {count} Program{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscribe CTA Section */}
      <section
        id="alerts"
        className="bg-slate-900 py-20 px-6 lg:px-8 relative overflow-hidden border-t border-slate-800"
      >
        {/* Decorative glowing background orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:max-w-2xl text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Registration Alerts
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
              Never miss a deadline again.
            </h2>

            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
              Get early alerts directly to your inbox when local sports programs
              open for registration. Select only the sports your kids actually
              play!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 text-blue-200 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                100% Free
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                No Spam
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                Cancel Anytime
              </div>
            </div>
          </div>

          {/* Inline Form Container */}
          <div className="w-full max-w-lg lg:w-[480px] shrink-0 relative z-20">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-full border-t-4 border-[#4A8C2A] overflow-hidden">
              <iframe
                src="https://link.convertmorebusiness.com/widget/form/ly6veWDO6ycXFqgRSlzP"
                style={{ width: "100%", height: "100%", minHeight: "485px", border: "none", borderRadius: "8px" }}
                id="inline-ly6veWDO6ycXFqgRSlzP"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Never Miss A Signup"
                data-height="485"
                data-layout-iframe-id="inline-ly6veWDO6ycXFqgRSlzP"
                data-form-id="ly6veWDO6ycXFqgRSlzP"
                data-cookie-consent="true"
                data-cookie-consent-provider="auto"
                title="Never Miss A Signup"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#12284D] text-white border-t-4 border-[#4A8C2A] mt-auto">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <img
                src="/lambton-county-sports-logo.png"
                alt="Lambton County Sports"
                className="h-24 w-auto mb-6 bg-white/95 p-3.5 rounded-xl shadow-sm"
              />
              <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
                The most complete directory of youth sports programs in Lambton
                County. Giving local kids more opportunities to play.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-lg mb-6 tracking-wide">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li>
                  <button
                    onClick={handleScrollToDirectory}
                    className="hover:text-white hover:underline transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3" /> Browse Directory
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3" /> About Us
                  </a>
                </li>
                <li>
                  <a
                    href="https://link.convertmorebusiness.com/widget/form/1CCxDZ3WadfM9IbjIZCk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3" /> Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-lg mb-6 tracking-wide">
                For Local Businesses
              </h4>
              <p className="text-blue-200 text-sm mb-6 leading-relaxed">
                Connect with thousands of local parents by advertising your
                business directly in our directory.
              </p>
              <HighLevelModal
                formId="03pw73IXAfBolrbEW1rO"
                title="Enquire About Sponsorship"
                trigger={
                  <button className="inline-block bg-[#4A8C2A] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#3A7A1A] transition-colors shadow-md w-full sm:w-auto text-center">
                    Become a Sponsor
                  </button>
                }
              />
            </div>
          </div>
          <div className="border-t border-blue-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-blue-300 text-sm">
            <p>
              © {new Date().getFullYear()} Lambton County Sports Directory. All
              rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Single-column stacked data ProgramCard
function ProgramCard({
  program,
  onMoreInfo,
}: {
  program: any;
  onMoreInfo: () => void;
}) {
  const getStatus = (p: any) => {
    const now = new Date();
    const open = p.registrationOpenDate
      ? new Date(p.registrationOpenDate)
      : null;
    const close = p.registrationCloseDate
      ? new Date(p.registrationCloseDate)
      : null;
    if (open && close && open <= now && now <= close) return "open";
    if (open && open > now) return "upcoming";
    return "closed";
  };

  const status = getStatus(program);

  const StatusBadge = () => {
    if (status === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
          Open
        </span>
      );
    }
    if (status === "upcoming") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Closed
      </span>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCountdown = () => {
    const now = new Date();
    const open = program.registrationOpenDate
      ? new Date(program.registrationOpenDate)
      : null;
    const close = program.registrationCloseDate
      ? new Date(program.registrationCloseDate)
      : null;

    if (status === "open" && close) {
      const diff = close.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return null;
      if (days === 1) return { text: "Closes tomorrow", urgent: true };
      if (days <= 7) return { text: `Closes in ${days} days`, urgent: true };
      if (days <= 30) return { text: `Closes in ${days} days`, urgent: false };
      return null;
    }

    if (status === "upcoming" && open) {
      const diff = open.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return null;
      if (days === 1) return { text: "Opens tomorrow", urgent: false };
      if (days <= 14) return { text: `Opens in ${days} days`, urgent: false };
      return null;
    }

    return null;
  };

  const countdown = getCountdown();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 flex flex-col group relative h-full">
      {/* Visual Accent Line */}
      <div
        className={`h-1.5 w-full rounded-t-2xl ${
          status === "open"
            ? "bg-green-500"
            : status === "upcoming"
              ? "bg-amber-400"
              : "bg-slate-300"
        }`}
      ></div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-[#1B3A6B] transition-colors leading-tight">
              {program.sportName}
            </h3>
            <StatusBadge />
          </div>
          <p className="text-sm font-medium text-slate-600 line-clamp-1">
            {program.organization}
          </p>
        </div>

        {/* Stacked Data List */}
        <div className="space-y-3 mb-5 py-4 border-y border-slate-100 flex-1">
          <div className="flex gap-2.5 items-center">
            <div className="text-blue-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-800 line-clamp-1">
              <span className="text-slate-500 font-normal mr-1">Location:</span>
              {program.townArea}
            </p>
          </div>

          <div className="flex gap-2.5 items-center">
            <div className="text-green-500 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-800">
              <span className="text-slate-500 font-normal mr-1">
                Reg Window:
              </span>
              {formatDate(program.registrationOpenDate)} -{" "}
              {formatDate(program.registrationCloseDate)}
            </p>
          </div>

          <div className="flex gap-2.5 items-center">
            <div className="text-purple-500 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-800 line-clamp-1">
              <span className="text-slate-500 font-normal mr-1">
                Season Starts:
              </span>
              {formatDate(program.programStartDate)}
            </p>
          </div>

          <div className="flex gap-2.5 items-center">
            <div className="text-amber-500 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-800 line-clamp-1">
              <span className="text-slate-500 font-normal mr-1">Ages:</span>
              {program.ageGroups}
            </p>
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div
            className={`flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2 mb-3 ${
              countdown.urgent
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {countdown.text}
          </div>
        )}

        {/* Footer Area */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={onMoreInfo}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            More Info
          </button>

          {program.registrationUrl && (
            <a
              href={program.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1 flex-1 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
                status === "open"
                  ? "bg-[#4A8C2A] text-white hover:bg-[#3A7A1A] hover:shadow-md"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {status === "open" ? "Register" : "Website"}
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
