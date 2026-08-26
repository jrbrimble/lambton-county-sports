const fs = require("fs");
let content = fs.readFileSync("client/src/pages/Admin.tsx", "utf8");

if (!content.includes("editingListing")) {
  const newMarketplaceTab = `
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
    }
  });

  const updateListing = trpc.swap.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Listing updated successfully");
      setEditingListing(null);
      utils.swap.listAll.invalidate();
      utils.swap.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update listing");
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
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1" onClick={() => handleEditClick(l)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
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

      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Item Name</Label>
                <Input value={editForm.itemName} onChange={e => setEditForm({...editForm, itemName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sport Category</Label>
                <Input value={editForm.sportCategory} onChange={e => setEditForm({...editForm, sportCategory: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={editForm.condition} onValueChange={val => setEditForm({...editForm, condition: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={editForm.status} onValueChange={val => setEditForm({...editForm, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Size Info</Label>
                <Input value={editForm.sizeInfo} onChange={e => setEditForm({...editForm, sizeInfo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Town / Area</Label>
                <Input value={editForm.townArea} onChange={e => setEditForm({...editForm, townArea: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListing(null)}>Cancel</Button>
            <Button onClick={submitEdit} disabled={updateListing.isPending}>
              {updateListing.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}`;

  content = content.replace(
    /function MarketplaceTab\(\) \{[\s\S]*?\n\}\n/,
    newMarketplaceTab + "\n"
  );
  fs.writeFileSync("client/src/pages/Admin.tsx", content);
  console.log("Updated MarketplaceTab with edit functionality");
}
