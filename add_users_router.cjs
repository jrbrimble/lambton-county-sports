const fs = require("fs");

let content = fs.readFileSync("server/routers.ts", "utf8");

// Ensure db functions for users exist. We can just add them inline or use db queries.
// Wait, we don't have listUsers in db.ts. It's fine, we can use `db.select().from(users)` inside the router since we import it.
// Actually, `server/db.ts` has `users` exported. But let's check.

const usersRouterStr = `
  // ── Users Management (Admin) ─────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(async () => {
      const { getDb } = await import("./db.js");
      const { users } = await import("../drizzle/schema.js");
      const { desc } = await import("drizzle-orm");
      return (await getDb()).select().from(users).orderBy(desc(users.createdAt));
    }),
    updateRole: adminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db.js");
        const { users } = await import("../drizzle/schema.js");
        const { eq } = await import("drizzle-orm");
        await (await getDb()).update(users).set({ role: input.role }).where(eq(users.id, input.id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db.js");
        const { users, swapListings } = await import("../drizzle/schema.js");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        // Delete user's listings first
        await db.delete(swapListings).where(eq(swapListings.userId, input.id));
        await db.delete(users).where(eq(users.id, input.id));
        return { success: true };
      }),
  }),
`;

if (!content.includes("users: router({")) {
  content = content.replace(
    "export type AppRouter = typeof appRouter;",
    usersRouterStr + "\nexport type AppRouter = typeof appRouter;"
  );
  fs.writeFileSync("server/routers.ts", content);
  console.log("routers.ts updated with users router!");
}
