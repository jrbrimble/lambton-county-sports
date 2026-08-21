import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, Info } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SPORT_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  "Ice Hockey": { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-700", light: "bg-blue-50" },
  "Ball Hockey": { bg: "bg-sky-500", border: "border-sky-500", text: "text-sky-700", light: "bg-sky-50" },
  "Soccer": { bg: "bg-green-600", border: "border-green-600", text: "text-green-700", light: "bg-green-50" },
  "Lacrosse": { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-700", light: "bg-orange-50" },
  "Baseball": { bg: "bg-red-600", border: "border-red-600", text: "text-red-700", light: "bg-red-50" },
  "Softball": { bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-700", light: "bg-pink-50" },
  "Gymnastics": { bg: "bg-purple-600", border: "border-purple-600", text: "text-purple-700", light: "bg-purple-50" },
  "Football": { bg: "bg-amber-700", border: "border-amber-700", text: "text-amber-800", light: "bg-amber-50" },
  "Basketball": { bg: "bg-orange-600", border: "border-orange-600", text: "text-orange-700", light: "bg-orange-50" },
  "Tennis": { bg: "bg-lime-600", border: "border-lime-600", text: "text-lime-700", light: "bg-lime-50" },
  "Golf": { bg: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-700", light: "bg-emerald-50" },
  "Swimming": { bg: "bg-cyan-600", border: "border-cyan-600", text: "text-cyan-700", light: "bg-cyan-50" },
  "Ringette": { bg: "bg-violet-500", border: "border-violet-500", text: "text-violet-700", light: "bg-violet-50" },
  "Volleyball": { bg: "bg-yellow-600", border: "border-yellow-600", text: "text-yellow-700", light: "bg-yellow-50" },
  "Curling": { bg: "bg-teal-600", border: "border-teal-600", text: "text-teal-700", light: "bg-teal-50" },
  "Figure Skating": { bg: "bg-indigo-500", border: "border-indigo-500", text: "text-indigo-700", light: "bg-indigo-50" },
  "Power Skating": { bg: "bg-indigo-600", border: "border-indigo-600", text: "text-indigo-700", light: "bg-indigo-50" },
  "Dance": { bg: "bg-fuchsia-500", border: "border-fuchsia-500", text: "text-fuchsia-700", light: "bg-fuchsia-50" },
  "Martial Arts": { bg: "bg-slate-700", border: "border-slate-700", text: "text-slate-700", light: "bg-slate-100" },
  "Cheerleading": { bg: "bg-rose-500", border: "border-rose-500", text: "text-rose-700", light: "bg-rose-50" },
  "Camps": { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-700", light: "bg-emerald-50" },
};

const DEFAULT_COLOR = { bg: "bg-slate-500", border: "border-slate-500", text: "text-slate-700", light: "bg-slate-50" };

function getColor(sport: string) {
  return SPORT_COLORS[sport] || DEFAULT_COLOR;
}

export default function SeasonCalendar() {
  const [, navigate] = useLocation();
  const { data: programs, isLoading } = trpc.programs.list.useQuery({});
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  
  // Default to current year, allow toggling
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [year, setYear] = useState(currentYear);

  // Group programs by sport
  const sportGroups = useMemo(() => {
    if (!programs) return [];
    
    const groups: Record<string, any[]> = {};
    for (const p of programs) {
      const sport = p.sportName || "Other";
      if (!groups[sport]) groups[sport] = [];
      groups[sport].push(p);
    }
    
    // Sort sports alphabetically, then programs within each sport by org name
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sport, progs]) => ({
        sport,
        programs: progs.sort((a: any, b: any) => (a.organization || "").localeCompare(b.organization || "")),
      }));
  }, [programs]);

  // Calculate bar position as percentage across 12 months
  const getBarStyle = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Only show bars that overlap with the displayed year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    if (end < yearStart || start > yearEnd) return null;
    
    const clampedStart = start < yearStart ? yearStart : start;
    const clampedEnd = end > yearEnd ? yearEnd : end;
    
    const totalDays = 365;
    const startDay = Math.floor((clampedStart.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDay = Math.floor((clampedEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const left = Math.max(0, (startDay / totalDays) * 100);
    const width = Math.max(1, ((endDay - startDay) / totalDays) * 100);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const todayPosition = useMemo(() => {
    if (year !== currentYear) return null;
    const yearStart = new Date(year, 0, 1);
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    return `${(dayOfYear / 365) * 100}%`;
  }, [year, currentYear]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Navigation */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img src="/lambton-county-sports-logo.png" alt="Lambton County Sports" className="h-10 w-auto" />
              <span className="font-display font-bold text-xl text-slate-800 hidden sm:block tracking-tight group-hover:text-blue-600 transition-colors">Lambton County Sports</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Directory
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#12284D] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold mb-4 backdrop-blur-md">
                <Calendar className="w-4 h-4" />
                Season Planner
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Season Calendar
              </h1>
              <p className="text-blue-200 text-lg font-medium max-w-xl">
                See every sport's registration windows and seasons at a glance. Plan your year without the guesswork.
              </p>
            </div>
            
            {/* Year Selector */}
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 border border-white/20 backdrop-blur-md">
              <button onClick={() => setYear(y => y - 1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-display font-bold text-2xl min-w-[80px] text-center">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 text-sm">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-sm bg-green-500 opacity-90"></div>
            <span className="text-slate-600 font-medium">Registration Window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded-sm bg-blue-500 opacity-50"></div>
            <span className="text-slate-600 font-medium">Season / Program Dates</span>
          </div>
          {todayPosition && (
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-red-500"></div>
              <span className="text-slate-600 font-medium">Today</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Timeline */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : sportGroups.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-slate-400">No programs found</h3>
            <p className="text-slate-400 mt-2">Check back later or try a different year.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sportGroups.map(({ sport, programs: progs }) => {
              const color = getColor(sport);
              return (
                <div key={sport} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Sport Header */}
                  <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-3 ${color.light}`}>
                    <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                    <h3 className={`font-display font-bold text-lg ${color.text}`}>{sport}</h3>
                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {progs.length} {progs.length === 1 ? "program" : "programs"}
                    </span>
                  </div>
                  
                  {/* Timeline Grid */}
                  <div className="relative">
                    {/* Month Headers */}
                    <div className="flex border-b border-slate-100">
                      <div className="w-48 shrink-0 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100">
                        Organization
                      </div>
                      <div className="flex-1 flex">
                        {MONTH_NAMES.map((m, i) => (
                          <div 
                            key={m} 
                            className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider border-r border-slate-50 last:border-r-0 ${
                              year === currentYear && i === currentMonth ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'
                            }`}
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Program Rows */}
                    {progs.map((prog: any) => {
                      const regBar = getBarStyle(prog.registrationOpenDate, prog.registrationCloseDate);
                      const seasonBar = getBarStyle(prog.programStartDate, prog.programEndDate);
                      
                      return (
                        <div 
                          key={prog.id} 
                          className="flex border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          onClick={() => setSelectedProgram(prog)}
                        >
                          <div className="w-48 shrink-0 px-4 py-3 border-r border-slate-100 flex items-center">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors" title={prog.organization}>
                              {prog.organization}
                            </p>
                          </div>
                          <div className="flex-1 relative h-12 flex items-center">
                            {/* Month grid lines */}
                            <div className="absolute inset-0 flex">
                              {MONTH_NAMES.map((m, i) => (
                                <div key={m} className={`flex-1 border-r border-slate-50 last:border-r-0 ${
                                  year === currentYear && i === currentMonth ? 'bg-blue-50/30' : ''
                                }`}></div>
                              ))}
                            </div>
                            
                            {/* Today marker */}
                            {todayPosition && (
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 opacity-60"
                                style={{ left: todayPosition }}
                              ></div>
                            )}
                            
                            {/* Season bar (behind, lighter) */}
                            {seasonBar && (
                              <div 
                                className={`absolute h-5 rounded-sm ${color.bg} opacity-25 z-10`}
                                style={seasonBar}
                                title={`Season: ${formatDate(prog.programStartDate)} - ${formatDate(prog.programEndDate)}`}
                              ></div>
                            )}
                            
                            {/* Registration bar (front, solid) */}
                            {regBar && (
                              <div 
                                className="absolute h-5 rounded-sm bg-green-500 opacity-90 z-10 shadow-sm"
                                style={regBar}
                                title={`Registration: ${formatDate(prog.registrationOpenDate)} - ${formatDate(prog.registrationCloseDate)}`}
                              ></div>
                            )}
                            
                            {/* No dates indicator */}
                            {!regBar && !seasonBar && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-slate-300 italic">No dates set</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Program Details Modal */}
      <Dialog.Root open={!!selectedProgram} onOpenChange={(open) => !open && setSelectedProgram(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-0 w-[95vw] max-w-lg z-50 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {selectedProgram && (
              <>
                <div className="bg-[#1B3A6B] p-6 text-white relative">
                  <Dialog.Title className="font-display text-2xl font-bold mb-1 pr-8">
                    {selectedProgram.sportName}
                  </Dialog.Title>
                  <p className="text-blue-200 font-medium">{selectedProgram.organization}</p>
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Registration Opens</p>
                      <p className="font-semibold text-slate-800">{formatDate(selectedProgram.registrationOpenDate)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Registration Closes</p>
                      <p className="font-semibold text-slate-800">{formatDate(selectedProgram.registrationCloseDate)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Season Start</p>
                      <p className="font-semibold text-slate-800">{formatDate(selectedProgram.programStartDate)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Season End</p>
                      <p className="font-semibold text-slate-800">{formatDate(selectedProgram.programEndDate)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {selectedProgram.townArea && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{selectedProgram.townArea}</span>
                      </div>
                    )}
                    {selectedProgram.ageGroups && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{selectedProgram.ageGroups}</span>
                      </div>
                    )}
                  </div>
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
                    <p className="text-center text-sm text-slate-500 italic">No registration link available.</p>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
