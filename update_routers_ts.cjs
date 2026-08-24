const fs = require('fs');
let content = fs.readFileSync('server/routers.ts', 'utf8');

// Ensure protectedProcedure is imported
if (!content.includes('protectedProcedure')) {
  content = content.replace('import { router, publicProcedure, adminProcedure }', 'import { router, publicProcedure, protectedProcedure, adminProcedure }');
}
if (!content.includes('listUserSwapListings')) {
  content = content.replace(
    /updateCronLastRun,\s*listActiveSwapListings,/,
    `updateCronLastRun,
  listActiveSwapListings,
  listUserSwapListings,
  updateSwapListingStatus,`
  );
}

const oldSwapBlockRegex = /swap: router\({[\s\S]*}\),/;
const newSwapBlock = `swap: router({
    list: publicProcedure
      .input(
        z.object({
          sport: z.string().optional(),
          townArea: z.string().optional(),
          condition: z.string().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(({ input }) => listActiveSwapListings(input ?? {})),

    myListings: protectedProcedure
      .query(({ ctx }) => listUserSwapListings(ctx.user.id)),

    create: protectedProcedure
      .input(
        z.object({
          sportCategory: z.string().min(1),
          itemName: z.string().min(1).max(256),
          description: z.string().max(2000).optional(),
          sizeInfo: z.string().max(128).optional(),
          condition: z.enum(["like_new", "good", "fair", "worn"]),
          price: z.number().int().min(0),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          townArea: z.string().max(128).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 60); // Extended to 60 days
        const id = await createSwapListing({ 
          ...input, 
          userId: ctx.user.id,
          expiresAt 
        });
        return { id };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["active", "completed", "archived"]) }))
      .mutation(async ({ input, ctx }) => {
        await updateSwapListingStatus(input.id, ctx.user.id, input.status);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSwapListing(input.id);
        return { success: true };
      }),

    listAll: adminProcedure.query(() => listAllSwapListings()),
  }),`;

content = content.replace(oldSwapBlockRegex, newSwapBlock);
fs.writeFileSync('server/routers.ts', content);
console.log('routers.ts updated successfully');
