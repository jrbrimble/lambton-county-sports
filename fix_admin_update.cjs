const fs = require("fs");
let content = fs.readFileSync("server/routers.ts", "utf8");

const adminUpdateStr = `
    adminUpdate: adminProcedure
      .input(
        z.object({
          id: z.number(),
          sportCategory: z.string().min(1),
          itemName: z.string().min(1).max(256),
          description: z.string().max(2000).optional(),
          sizeInfo: z.string().max(128).optional(),
          condition: z.enum(["like_new", "good", "fair", "worn"]),
          price: z.number().int().min(0),
          townArea: z.string().max(128).optional(),
          status: z.enum(["active", "completed", "archived"]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateSwapListingAsAdmin } = await import("./db.js");
        await updateSwapListingAsAdmin(id, data);
        return { success: true };
      }),
`;

// Remove from programs router
content = content.replace(adminUpdateStr, ""); // Hopefully it matches exactly
// If it doesn't match exactly because of formatting, we can use a regex:
content = content.replace(
  /\s*adminUpdate: adminProcedure[\s\S]*?updateSwapListingAsAdmin\(id, data\);\s*return \{ success: true \};\s*}\),\s*/,
  "\n"
);

// Add to swap router before `delete: adminProcedure`
// Let's find the swap block
const swapBlockRegex = /swap: router\({[\s\S]*?delete: adminProcedure/g;
let match;
while ((match = swapBlockRegex.exec(content)) !== null) {
  // We found the delete: adminProcedure inside swap: router({
  const beforeDelete = content.slice(
    0,
    match.index + match[0].length - "delete: adminProcedure".length
  );
  const afterDelete = content.slice(
    match.index + match[0].length - "delete: adminProcedure".length
  );
  content = beforeDelete + adminUpdateStr.trim() + ",\n    " + afterDelete;
  break; // Only apply to the first match
}

fs.writeFileSync("server/routers.ts", content);
console.log("Fixed adminUpdate in routers.ts");
