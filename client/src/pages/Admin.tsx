import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ExternalLink,
  LogOut,
  Shield,
  Building2,
  Calendar,
  Clock,
  RefreshCw,
  Loader2,
  UsersIcon,
  Package,
  Download,
  BellRing,
  Mail,
} from "lucide-react";
import type {
  SportsProgram,
  AdSlot,
  ProgramChange,
} from "../../../drizzle/schema";

//  Helpers

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toInputDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

//  Program Form

type ProgramFormData = {
  sportName: string;
  organization: string;
  ageGroups: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  programStartDate: string;
  registrationUrl: string;
  notes: string;
  isActive: boolean;
};

const emptyProgram: ProgramFormData = {
  sportName: "",
  organization: "",
  ageGroups: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  programStartDate: "",
  registrationUrl: "",
  notes: "",
  isActive: true,
};

function ProgramDialog({
  open,
  onClose,
  program,
}: {
  open: boolean;
  onClose: () => void;
  program?: SportsProgram;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ProgramFormData>(emptyProgram);

  useEffect(() => {
    if (program) {
      setForm({
        sportName: program.sportName || "",
        organization: program.organization || "",
        ageGroups: program.ageGroups || "",
        registrationOpenDate: toInputDate(program.registrationOpenDate),
        registrationCloseDate: toInputDate(program.registrationCloseDate),
        programStartDate: toInputDate(program.programStartDate),
        registrationUrl: program.registrationUrl || "",
        notes: program.notes ?? "",
        isActive: program.isActive,
      });
    } else {
      setForm(emptyProgram);
    }
  }, [program, open]);

  const createMut = trpc.programs.create.useMutation({
    onSuccess: () => {
      utils.programs.listAll.invalidate();
      toast.success("Program created");
      onClose();
    },
    onError: e => toast.error(e.message),
  });
  const updateMut = trpc.programs.update.useMutation({
    onSuccess: () => {
      utils.programs.listAll.invalidate();
      toast.success("Program updated");
      onClose();
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      sportName: form.sportName,
      organization: form.organization,
      ageGroups: form.ageGroups,
      registrationOpenDate: form.registrationOpenDate || null,
      registrationCloseDate: form.registrationCloseDate || null,
      programStartDate: form.programStartDate || null,
      registrationUrl: form.registrationUrl,
      notes: form.notes || null,
      isActive: form.isActive,
    };
    if (program) {
      updateMut.mutate({ id: program.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {program ? "Edit Program" : "Add New Program"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sport Name *</Label>
              <Input
                value={form.sportName}
                onChange={e => setForm({ ...form, sportName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Organization *</Label>
              <Input
                value={form.organization}
                onChange={e =>
                  setForm({ ...form, organization: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>
              Age Groups *{" "}
              <span className="text-muted-foreground font-normal">
                (e.g. U6, U8, U10)
              </span>
            </Label>
            <Input
              value={form.ageGroups}
              onChange={e => setForm({ ...form, ageGroups: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Registration Opens</Label>
              <Input
                type="date"
                value={form.registrationOpenDate}
                onChange={e =>
                  setForm({ ...form, registrationOpenDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Closes</Label>
              <Input
                type="date"
                value={form.registrationCloseDate}
                onChange={e =>
                  setForm({ ...form, registrationCloseDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Program Start</Label>
              <Input
                type="date"
                value={form.programStartDate}
                onChange={e =>
                  setForm({ ...form, programStartDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Registration URL *</Label>
            <Input
              type="url"
              value={form.registrationUrl}
              onChange={e =>
                setForm({ ...form, registrationUrl: e.target.value })
              }
              required
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Optional notes or submission details"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
            <Switch
              checked={form.isActive}
              onCheckedChange={v => setForm({ ...form, isActive: v })}
            />
            <div>
              <Label className="font-semibold cursor-pointer">
                {form.isActive ? "Active (Live on public directory)" : "Inactive / Pending Review"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {form.isActive
                  ? "This program is published and viewable by all website visitors."
                  : "This program is hidden from the public directory until you activate it."}
              </p>
            </div>
          </div>

          {(program?.submitterName || program?.submitterEmail || program?.submitterPhone) && (
            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-sm mb-2 text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4" /> Submitter Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                <div>
                  <span className="text-muted-foreground text-xs block">Name</span>
                  <span className="font-medium">{program.submitterName || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Phone</span>
                  <span className="font-medium">{program.submitterPhone || "Not provided"}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-muted-foreground text-xs block">Email</span>
                  <span className="font-medium">{program.submitterEmail || "Not provided"}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {program ? "Save Changes" : "Create Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

//  Programs Tab

function ProgramsTab() {
  const utils = trpc.useUtils();
  const { data: programs, isLoading } = trpc.programs.listAll.useQuery();
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const deleteMut = trpc.programs.delete.useMutation({
    onSuccess: () => {
      utils.programs.listAll.invalidate();
      toast.success("Program deleted");
    },
    onError: e => toast.error(e.message),
  });

  const approveMut = trpc.programs.update.useMutation({
    onSuccess: () => {
      utils.programs.listAll.invalidate();
      toast.success("Program approved and published to the live directory!");
    },
    onError: e => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<SportsProgram | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function openCreate() {
    setEditProgram(undefined);
    setDialogOpen(true);
  }
  function openEdit(p: SportsProgram) {
    setEditProgram(p);
    setDialogOpen(true);
  }

  const pendingPrograms = programs?.filter(p => !p.isActive) || [];
  const activePrograms = programs?.filter(p => p.isActive) || [];

  const filteredPrograms = programs?.filter(p => {
    if (filterStatus === "active" && !p.isActive) return false;
    if (filterStatus === "pending" && p.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSport = p.sportName?.toLowerCase().includes(q);
      const matchOrg = p.organization?.toLowerCase().includes(q);
      const matchTown = p.townArea?.toLowerCase().includes(q);
      const matchSubmitter = p.submitterName?.toLowerCase().includes(q) || p.submitterEmail?.toLowerCase().includes(q);
      return matchSport || matchOrg || matchTown || matchSubmitter;
    }
    return true;
  }) || [];

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Programs Management</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {programs?.length ?? 0} total programs ({activePrograms.length} active, {pendingPrograms.length} pending review)
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* PENDING SUBMISSIONS ALERT BANNER */}
      {pendingPrograms.length > 0 && (
        <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                New User Submissions Waiting for Review ({pendingPrograms.length})
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200">
              Not Live Yet
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            These programs were submitted via the "Submit A Program" form. Review their details, then click <strong>Approve & Make Live</strong> to publish them to the directory!
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingPrograms.map(p => (
              <div
                key={p.id}
                className="p-4 bg-card rounded-xl border border-amber-500/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-foreground text-base">
                      {p.sportName}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary mb-2">
                    {p.organization}
                  </p>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {p.townArea && (
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Town:</span> {p.townArea}
                      </p>
                    )}
                    {p.ageGroups && (
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Ages:</span> {p.ageGroups}
                      </p>
                    )}
                    {p.registrationUrl && (
                      <p className="truncate flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Reg Link:</span>{" "}
                        <a
                          href={p.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          Visit Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    )}
                  </div>

                  {(p.submitterName || p.submitterEmail || p.submitterPhone) && (
                    <div className="pt-2.5 pb-1 border-t border-border text-xs">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Submitted By:
                      </p>
                      {p.submitterName && <p className="font-medium text-foreground">👤 {p.submitterName}</p>}
                      {p.submitterEmail && <p className="text-muted-foreground">✉️ {p.submitterEmail}</p>}
                      {p.submitterPhone && <p className="text-muted-foreground">📞 {p.submitterPhone}</p>}
                    </div>
                  )}

                  {p.notes && (
                    <div className="mt-2 p-2 bg-muted/40 rounded text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground text-[10px] uppercase">Notes / Raw Data:</p>
                      <p className="line-clamp-2">{p.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-sm"
                    onClick={() => approveMut.mutate({ id: p.id, isActive: true })}
                    disabled={approveMut.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve & Make Live
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => openEdit(p)}
                    title="Review & Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(p.id)}
                    title="Reject & Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border self-start">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Programs ({programs?.length ?? 0})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === "active"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active ({activePrograms.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterStatus === "pending"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Review
            {pendingPrograms.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === "pending" ? "bg-white text-amber-600" : "bg-amber-500/20 text-amber-600"
              }`}>
                {pendingPrograms.length}
              </span>
            )}
          </button>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search programs or submitters..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Sport / Organization
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Age Groups
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Reg. Open
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Reg. Close
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPrograms.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.sportName}</p>
                    <p className="text-xs text-muted-foreground">{p.organization}</p>
                    {p.submitterName && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        👤 Submitted by {p.submitterName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {p.ageGroups}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(p.registrationOpenDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(p.registrationCloseDate)}
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {!p.isActive && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5"
                          onClick={() => approveMut.mutate({ id: p.id, isActive: true })}
                          disabled={approveMut.isPending}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                        title="Edit program"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(p.id)}
                        title="Delete program"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPrograms.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No programs match your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProgramDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        program={editProgram}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={o => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing will be permanently
              removed from the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteMut.mutate({ id: deleteId });
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


// ── Changes Tab ──────────────────────────────────────────────────────────────

function ChangesTab() {
  const utils = trpc.useUtils();
  const { data: changes, isLoading } = trpc.changes.listPending.useQuery();
  const approveMut = trpc.changes.approve.useMutation({
    onSuccess: () => {
      utils.changes.listPending.invalidate();
      utils.changes.pendingCount.invalidate();
      toast.success("Change approved and applied");
    },
    onError: e => toast.error(e.message),
  });
  const dismissMut = trpc.changes.dismiss.useMutation({
    onSuccess: () => {
      utils.changes.listPending.invalidate();
      utils.changes.pendingCount.invalidate();
      toast.success("Change dismissed");
    },
    onError: e => toast.error(e.message),
  });

  const FIELD_LABELS: Record<string, string> = {
    registrationOpenDate: "Registration Opens",
    registrationCloseDate: "Registration Closes",
    programStartDate: "Program Start",
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Pending Changes</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Auto-detected date changes from the monthly URL check. Review and
          approve or dismiss each one.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : changes?.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold">All caught up!</h3>
          <p className="text-muted-foreground mt-1">
            No pending changes to review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {changes?.map(change => (
            <div
              key={change.id}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="font-medium text-foreground">
                      {change.programName} / {change.organization}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Field:{" "}
                    <span className="font-medium text-foreground">
                      {FIELD_LABELS[change.fieldName] ?? change.fieldName}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-red-500 font-medium mb-0.5">
                        Current
                      </p>
                      <p className="text-red-700">
                        {change.oldValue || "Not set"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                      <p className="text-xs text-emerald-600 font-medium mb-0.5">
                        Detected
                      </p>
                      <p className="text-emerald-700">
                        {change.newValue || "Not set"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Detected{" "}
                    {new Date(change.detectedAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => approveMut.mutate({ changeId: change.id })}
                    disabled={approveMut.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissMut.mutate({ changeId: change.id })}
                    disabled={dismissMut.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


//  Ad Slot Form

type AdFormData = {
  title: string;
  destinationUrl: string;
  position: "banner_top" | "banner_bottom" | "sidebar_card" | "inline_card";
  sortOrder: number;
  isActive: boolean;
};

const emptyAd: AdFormData = {
  title: "",
  destinationUrl: "",
  position: "sidebar_card",
  sortOrder: 0,
  isActive: true,
};

const POSITION_LABELS: Record<string, string> = {
  banner_top: "Banner (Top of Directory)",
  banner_bottom: "Banner (Bottom of Directory)",
  sidebar_card: "Sidebar Card",
  inline_card: "Inline Card (between listings)",
};

function AdDialog({
  open,
  onClose,
  ad,
}: {
  open: boolean;
  onClose: () => void;
  ad?: AdSlot;
}) {
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AdFormData>(
    ad
      ? {
          title: ad.title,
          destinationUrl: ad.destinationUrl,
          position: ad.position,
          sortOrder: ad.sortOrder,
          isActive: ad.isActive,
        }
      : emptyAd
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    ad?.imageUrl ?? null
  );
  const [pendingFile, setPendingFile] = useState<{
    base64: string;
    mimeType: string;
    filename: string;
  } | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(ad?.id ?? null);

  const createMut = trpc.ads.create.useMutation({
    onSuccess: data => {
      setCreatedId(data);
    },
    onError: e => toast.error(e.message),
  });
  const updateMut = trpc.ads.update.useMutation({
    onSuccess: () => {
      utils.ads.listAll.invalidate();
      toast.success("Ad updated");
      onClose();
    },
    onError: e => toast.error(e.message),
  });
  const uploadMut = trpc.ads.uploadImage.useMutation({
    onSuccess: data => {
      setImagePreview(data.url);
      utils.ads.listAll.invalidate();
      toast.success("Image uploaded");
    },
    onError: e => toast.error(e.message),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setPendingFile({ base64, mimeType: file.type, filename: file.name });
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form };

    if (ad) {
      // Update existing
      updateMut.mutate({ id: ad.id, ...payload });
      if (pendingFile && ad.id) {
        uploadMut.mutate({ adId: ad.id, ...pendingFile });
      }
    } else {
      // Create then optionally upload
      const result = await createMut.mutateAsync(payload);
      if (pendingFile && result) {
        await uploadMut.mutateAsync({ adId: result, ...pendingFile });
      }
      utils.ads.listAll.invalidate();
      toast.success("Ad created");
      onClose();
    }
  }

  const isPending =
    createMut.isPending || updateMut.isPending || uploadMut.isPending;

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {ad ? "Edit Ad Slot" : "New Ad Slot"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Business / Ad Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Destination URL *</Label>
            <Input
              type="url"
              value={form.destinationUrl}
              onChange={e =>
                setForm({ ...form, destinationUrl: e.target.value })
              }
              required
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Position *</Label>
            <Select
              value={form.position}
              onValueChange={v =>
                setForm({ ...form, position: v as AdFormData["position"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POSITION_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>
              Sort Order{" "}
              <span className="text-muted-foreground font-normal">
                (lower = first)
              </span>
            </Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={e =>
                setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ad Image</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 mx-auto rounded-lg object-cover"
                />
              ) : (
                <div className="py-4">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP recommended
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={v => setForm({ ...form, isActive: v })}
            />
            <Label>Active (visible on directory)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {ad ? "Save Changes" : "Create Ad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

//  Ads Tab

function AdsTab() {
  const utils = trpc.useUtils();
  const { data: ads, isLoading } = trpc.ads.listAll.useQuery();
  const deleteMut = trpc.ads.delete.useMutation({
    onSuccess: () => {
      utils.ads.listAll.invalidate();
      toast.success("Ad deleted");
    },
    onError: e => toast.error(e.message),
  });
  const toggleMut = trpc.ads.update.useMutation({
    onSuccess: () => utils.ads.listAll.invalidate(),
    onError: e => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAd, setEditAd] = useState<AdSlot | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ad Slots</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage business advertising placements on the directory.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditAd(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ad Slot
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads?.map(ad => (
            <div
              key={ad.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {ad.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {POSITION_LABELS[ad.position]}
                    </p>
                  </div>
                  <Switch
                    checked={ad.isActive}
                    onCheckedChange={v =>
                      toggleMut.mutate({ id: ad.id, isActive: v })
                    }
                  />
                </div>
                <a
                  href={ad.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mb-3 truncate"
                >
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  {ad.destinationUrl}
                </a>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditAd(ad);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(ad.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {ads?.length === 0 && (
            <div className="col-span-full text-center py-16 bg-card rounded-xl border border-border">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold">
                No ad slots yet
              </h3>
              <p className="text-muted-foreground mt-1">
                Create your first ad slot to start monetizing the directory.
              </p>
            </div>
          )}
        </div>
      )}

      <AdDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        ad={editAd}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={o => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ad slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the ad from the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteMut.mutate({ id: deleteId });
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

//  Cron Status Tab

function CronTab() {
  const { data: cronStatus, isLoading, refetch } = trpc.cron.status.useQuery();
  const runCron = trpc.cron.run.useMutation({
    onSuccess: data => {
      toast.success(
        `Scraping complete! ${data.programsChecked} programs checked, ${data.changesDetected} changes found.`
      );
      refetch();
    },
    onError: err => {
      toast.error(`Failed to run scraper: ${err.message}`);
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">
          Web Scraper (CRON)
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage the automated web scraper that visits all program URLs to find
          updated registration dates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg mb-1">Manual Execution</h3>
              <p className="text-xs text-muted-foreground">
                Trigger the web scraper to run immediately.
              </p>
            </div>
            <div
              className={`p-2 rounded-full ${runCron.isPending ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}
            >
              {runCron.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </div>
          </div>

          <p className="text-sm text-foreground mb-6">
            Pressing this button will dispatch the bot to visit the registration
            websites of all active programs in the directory. It will use AI to
            read the text on their websites, look for new registration dates,
            and queue them in the <strong>Pending Changes</strong> tab for your
            review.
          </p>

          <Button
            onClick={() => runCron.mutate()}
            disabled={runCron.isPending}
            className="w-full bg-[#1B3A6B] hover:bg-blue-900 font-bold"
          >
            {runCron.isPending ? "Scraping Websites..." : "Run Web Scraper Now"}
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Scheduler & Status</h3>

          {isLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading status...
            </div>
          ) : (
            <div className="space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Last Run
                  </p>
                  <p className="text-slate-800 font-medium">
                    {formatDate(cronStatus?.lastRunAt) || "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Last Status
                  </p>
                  <p
                    className={
                      cronStatus?.lastRunStatus === "success"
                        ? "text-emerald-600 font-bold"
                        : "text-amber-600 font-bold"
                    }
                  >
                    {cronStatus?.lastRunStatus
                      ? cronStatus.lastRunStatus.toUpperCase()
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-[#1B3A6B]">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold text-sm uppercase tracking-wider">
                    Next Scheduled Run
                  </span>
                </div>
                <p className="font-medium text-slate-700">
                  1st of the month at 9:00 AM
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  The automated schedule is hardcoded into the Vercel serverless
                  deployment config. If you need to change this cadence (e.g. to
                  run weekly), please request a code update to{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded">
                    vercel.json
                  </code>
                  .
                </p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-6 self-start font-medium"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}

//  Users Tab

function UsersTab() {
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.users.list.invalidate();
    },
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted");
      utils.users.list.invalidate();
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading users...</div>
    );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium">{u.name || "N/A"}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.phone || "N/A"}</td>
                <td className="px-6 py-4">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Select
                    value={u.role}
                    onValueChange={(val: "admin" | "user") =>
                      updateRole.mutate({ id: u.id, role: val })
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs inline-flex mr-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this user and all their listings?"
                        )
                      ) {
                        deleteUser.mutate({ id: u.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

//  Marketplace Tab

function MarketplaceTab() {
  const { data: listings, isLoading } = trpc.swap.listAll.useQuery();
  const utils = trpc.useUtils();

  const [editingListing, setEditingListing] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const deleteListing = trpc.swap.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted");
      utils.swap.listAll.invalidate();
      utils.swap.list.invalidate();
    },
  });

  const updateListing = trpc.swap.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Listing updated successfully");
      setEditingListing(null);
      utils.swap.listAll.invalidate();
      utils.swap.list.invalidate();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update listing");
    },
  });

  const exportCSV = () => {
    if (!listings) return;
    const header = [
      "ID,Item,Sport,Price,Condition,Status,Seller Name,Seller Email,Created,Expires",
    ];
    const rows = listings.map(l => {
      return [
        l.listing.id,
        `"${l.listing.itemName.replace(/"/g, '""')}"`,
        `"${l.listing.sportCategory}"`,
        l.listing.price / 100,
        l.listing.condition,
        l.listing.status,
        `"${l.user?.name || ""}"`,
        `"${l.user?.email || ""}"`,
        new Date(l.listing.createdAt).toISOString().split("T")[0],
        new Date(l.listing.expiresAt).toISOString().split("T")[0],
      ].join(",");
    });
    const csv = header.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "swap_listings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (l: any) => {
    setEditingListing(l);
    setEditForm({
      id: l.listing.id,
      itemName: l.listing.itemName,
      sportCategory: l.listing.sportCategory,
      price: (l.listing.price / 100).toString(),
      condition: l.listing.condition,
      status: l.listing.status,
      sizeInfo: l.listing.sizeInfo || "",
      description: l.listing.description || "",
      townArea: l.listing.townArea || "",
    });
  };

  const submitEdit = () => {
    updateListing.mutate({
      ...editForm,
      price: Math.round(parseFloat(editForm.price || "0") * 100),
    });
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading listings...</div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings?.map(l => (
                <tr key={l.listing.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold">{l.listing.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {l.listing.sportCategory}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        l.listing.status === "active" ? "default" : "secondary"
                      }
                    >
                      {l.listing.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ${l.listing.price / 100}
                  </td>
                  <td className="px-6 py-4">
                    <p>{l.user?.name}</p>
                    <p className="text-xs text-slate-500">{l.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(l.listing.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                      onClick={() => handleEditClick(l)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (
                          window.confirm("Delete this listing permanently?")
                        ) {
                          deleteListing.mutate({ id: l.listing.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={!!editingListing}
        onOpenChange={open => !open && setEditingListing(null)}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={editForm.itemName}
                  onChange={e =>
                    setEditForm({ ...editForm, itemName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Sport Category</Label>
                <Input
                  value={editForm.sportCategory}
                  onChange={e =>
                    setEditForm({ ...editForm, sportCategory: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={e =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={editForm.condition}
                  onValueChange={val =>
                    setEditForm({ ...editForm, condition: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="worn">Well Worn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={val =>
                    setEditForm({ ...editForm, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={e =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Size Info</Label>
                <Input
                  value={editForm.sizeInfo}
                  onChange={e =>
                    setEditForm({ ...editForm, sizeInfo: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Town / Area</Label>
                <Input
                  value={editForm.townArea}
                  onChange={e =>
                    setEditForm({ ...editForm, townArea: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListing(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={updateListing.isPending}>
              {updateListing.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ── Subscribers Tab ──────────────────────────────────────────────────────────

function SubscribersTab() {
  const utils = trpc.useUtils();
  const { data: subscribers, isLoading } = trpc.subscribers.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMut = trpc.subscribers.delete.useMutation({
    onSuccess: () => {
      utils.subscribers.list.invalidate();
      utils.subscribers.count.invalidate();
      toast.success("Subscriber removed");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });

  const allSports = Array.from(
    new Set(
      (subscribers || [])
        .flatMap(s => (s.sports ? s.sports.split(",").map(sp => sp.trim()) : []))
        .filter(Boolean)
    )
  ).sort();

  const filteredSubscribers = (subscribers || []).filter(s => {
    if (selectedSport !== "all") {
      if (!s.sports || !s.sports.toLowerCase().includes(selectedSport.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      const matchSports = s.sports?.toLowerCase().includes(q);
      const matchTown = s.townArea?.toLowerCase().includes(q);
      return matchName || matchEmail || matchSports || matchTown;
    }
    return true;
  });

  const exportToCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast.error("No subscribers to export");
      return;
    }
    const headers = ["ID", "Name", "Email", "Sports Interested In", "Town/Area", "Subscribed At"];
    const rows = filteredSubscribers.map(s => [
      s.id,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.sports || "").replace(/"/g, '""')}"`,
      `"${(s.townArea || "").replace(/"/g, '""')}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `alert_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Registration Alert Subscribers</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {subscribers?.length ?? 0} parents & community members subscribed to registration alerts
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="Filter by Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports ({subscribers?.length ?? 0})</SelectItem>
              {allSports.map(sport => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Search by name, email, or sport..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subscriber</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sports of Interest</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Town / Area</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date Subscribed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubscribers.map(s => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{s.name || "No name provided"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.sports ? (
                      <div className="flex flex-wrap gap-1">
                        {s.sports.split(",").map((sport, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                          >
                            {sport.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">All Sports / General</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {s.townArea || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {new Date(s.createdAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(s.id)}
                        title="Remove subscriber"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    {subscribers?.length === 0
                      ? "No subscribers yet. Once users sign up via the 'Never Miss A Signup' form, they will appear here!"
                      : "No subscribers match your search or filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer receive alerts and will be removed from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMut.mutate({ id: deleteId });
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


//  Main Admin Page

// Need ChevronRight import
import { ChevronRight } from "lucide-react";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: allPrograms } = trpc.programs.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const pendingProgramsCount = allPrograms?.filter(p => !p.isActive).length ?? 0;
  const { data: subscriberCount } = trpc.subscribers.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: pendingCount } = trpc.changes.pendingCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isOwnerOrAdmin = isAuthenticated && user?.role === "admin";

  if (!isAuthenticated || !isOwnerOrAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Owner Access Required
          </h1>
          <p className="text-muted-foreground mb-6">
            {isAuthenticated
              ? "Your account does not have admin privileges for this directory."
              : "You must be signed in as the site owner to access the admin panel."}
          </p>
          <Button onClick={() => navigate("/")}>Return to Directory</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground border-b border-primary/20">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60 uppercase tracking-widest">
                Admin Panel
              </p>
              <h1 className="font-display font-semibold leading-tight">
                Lambton Youth Sports Directory
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              View Directory
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="programs">
          <TabsList className="mb-8 bg-card border border-border">
            <TabsTrigger value="programs" className="gap-2 relative">
              <Calendar className="h-4 w-4" />
              Programs
              {pendingProgramsCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5 leading-none">
                  {pendingProgramsCount} new
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-2 relative">
              <AlertTriangle className="h-4 w-4" />
              Pending Changes
              {(pendingCount?.count ?? 0) > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {pendingCount?.count}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <Building2 className="h-4 w-4" />
              Ad Slots
            </TabsTrigger>
            <TabsTrigger value="cron" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Web Scraper
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <UsersIcon className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Package className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <BellRing className="h-4 w-4" />
              Alert Subscribers
              {(subscriberCount?.count ?? 0) > 0 && (
                <span className="ml-1 bg-muted-foreground/20 text-foreground text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {subscriberCount?.count}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs">
            <ProgramsTab />
          </TabsContent>
          <TabsContent value="changes">
            <ChangesTab />
          </TabsContent>
          <TabsContent value="ads">
            <AdsTab />
          </TabsContent>
          <TabsContent value="cron">
            <CronTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="marketplace">
            <MarketplaceTab />
          </TabsContent>
          <TabsContent value="subscribers">
            <SubscribersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
