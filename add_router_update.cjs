const fs = require('fs');
let content = fs.readFileSync('server/routers.ts', 'utf8');

if (!content.includes('adminUpdate: adminProcedure')) {
  const routerStr = `
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
  
  content = content.replace(
    'delete: adminProcedure',
    routerStr + '\n    delete: adminProcedure'
  );
  fs.writeFileSync('server/routers.ts', content);
  console.log('Added adminUpdate to swap router');
}
