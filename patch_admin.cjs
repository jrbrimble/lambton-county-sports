const fs = require("fs");
let content = fs.readFileSync("client/src/pages/Admin.tsx", "utf8");

// 1. Add icons to imports if they don't exist
if (!content.includes("UsersIcon")) {
  content = content.replace(
    '} from "lucide-react";',
    '  UsersIcon, Package, Download\n} from "lucide-react";'
  );
}

// 2. Add UsersTab and MarketplaceTab components
const newTabsComponents = `
// ── Users Tab ──────────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();
  
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.users.list.invalidate();
    }
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted");
      utils.users.list.invalidate();
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

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
                <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Select
                    value={u.role}
                    onValueChange={(val: "admin" | "user") => updateRole.mutate({ id: u.id, role: val })}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs inline-flex mr-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                    if (window.confirm("Delete this user and all their listings?")) {
                      deleteUser.mutate({ id: u.id });
                    }
                  }}>
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

// ── Marketplace Tab ─────────────────────────────────────────────────────────────

function MarketplaceTab() {
  const { data: listings, isLoading } = trpc.swap.listAll.useQuery();
  const utils = trpc.useUtils();
  
  const deleteListing = trpc.swap.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted");
      utils.swap.listAll.invalidate();
      utils.swap.list.invalidate();
    }
  });

  const exportCSV = () => {
    if (!listings) return;
    const header = ["ID,Item,Sport,Price,Condition,Status,Seller Name,Seller Email,Created,Expires"];
    const rows = listings.map(l => {
      return [
        l.listing.id,
        \`"\${l.listing.itemName.replace(/"/g, '""')}"\`,
        \`"\${l.listing.sportCategory}"\`,
        l.listing.price / 100,
        l.listing.condition,
        l.listing.status,
        \`"\${l.user?.name || ''}"\`,
        \`"\${l.user?.email || ''}"\`,
        new Date(l.listing.createdAt).toISOString().split('T')[0],
        new Date(l.listing.expiresAt).toISOString().split('T')[0],
      ].join(",");
    });
    const csv = header.concat(rows).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "swap_listings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading listings...</div>;

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
                    <p className="text-xs text-slate-500">{l.listing.sportCategory}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={l.listing.status === 'active' ? 'default' : 'secondary'}>
                      {l.listing.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">\${l.listing.price / 100}</td>
                  <td className="px-6 py-4">
                    <p>{l.user?.name}</p>
                    <p className="text-xs text-slate-500">{l.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(l.listing.expiresAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                      if (window.confirm("Delete this listing permanently?")) {
                        deleteListing.mutate({ id: l.listing.id });
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────────────────────────────
`;

if (!content.includes("function UsersTab()")) {
  content = content.replace("// ── Main Admin Page", newTabsComponents);
}

// 3. Add tabs to the UI
if (!content.includes('value="users"')) {
  content = content.replace(
    /<TabsTrigger value="cron" className="gap-2">\s*<RefreshCw className="h-4 w-4" \/>\s*Web Scraper\s*<\/TabsTrigger>/,
    `<TabsTrigger value="cron" className="gap-2">
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
            </TabsTrigger>`
  );

  content = content.replace(
    '<TabsContent value="cron"><CronTab /></TabsContent>',
    `<TabsContent value="cron"><CronTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="marketplace"><MarketplaceTab /></TabsContent>`
  );
}

fs.writeFileSync("client/src/pages/Admin.tsx", content);
console.log("Admin.tsx updated!");
