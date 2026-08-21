import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "./_core/trpc.js";
import { getSessionCookieOptions } from "./_core/auth.js";
import {
  listPrograms,
  listAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  listPendingChanges,
  countPendingChanges,
  approveChange,
  dismissChange,
  listActiveAdSlots,
  listAllAdSlots,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
  getCronConfig,
  updateCronLastRun,
  listActiveSwapListings,
  createSwapListing,
  deleteSwapListing,
  listAllSwapListings,
} from "./db.js";
import { ENV } from "./_core/env.js";

const COOKIE_NAME = "lcs_session";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req as any);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  programs: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          sport: z.string().optional(),
          townArea: z.string().optional(),
          status: z.enum(["open", "upcoming", "closed"]).optional(),
          ageMin: z.number().optional(),
          ageMax: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        let filtered = await listPrograms();
        if (input?.search) {
          const q = input.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.sportName.toLowerCase().includes(q) ||
              p.organization.toLowerCase().includes(q) ||
              p.townArea?.toLowerCase().includes(q)
          );
        }
        if (input?.sport) {
          filtered = filtered.filter((p) => p.sportName === input.sport);
        }
        if (input?.townArea) {
          filtered = filtered.filter((p) => p.townArea === input.townArea);
        }
        if (input?.ageMin !== undefined && input?.ageMax !== undefined) {
          filtered = filtered.filter((p) => {
            if (p.ageMin === null || p.ageMax === null) return true;
            return p.ageMax >= input.ageMin! && p.ageMin <= input.ageMax!;
          });
        }
        if (input?.status) {
          const now = new Date();
          filtered = filtered.filter((p) => {
            const open = p.registrationOpenDate ? new Date(p.registrationOpenDate) : null;
            const close = p.registrationCloseDate ? new Date(p.registrationCloseDate) : null;
            if (input.status === "open") return open && close && open <= now && now <= close;
            if (input.status === "upcoming") return open && open > now;
            if (input.status === "closed") return !open || (close && now > close);
            return true;
          });
        }
        return filtered;
      }),
    listAll: adminProcedure.query(async () => await listAllPrograms()),
    create: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        ["registrationOpenDate", "registrationCloseDate", "programStartDate", "programEndDate"].forEach((f) => {
          if (data[f]) data[f] = new Date(data[f]);
          else data[f] = null;
        });
        return await createProgram(data);
      }),
    update: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        ["registrationOpenDate", "registrationCloseDate", "programStartDate", "programEndDate"].forEach((f) => {
          if (data[f] !== undefined) {
            if (data[f]) data[f] = new Date(data[f]);
            else data[f] = null;
          }
        });
        return await updateProgram(input.id, data);
      }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteProgram(input.id);
        return { success: true };
      }),
  }),

  changes: router({
    listPending: adminProcedure.query(async () => await listPendingChanges()),
    pendingCount: adminProcedure.query(async () => ({ count: await countPendingChanges() })),
    approve: adminProcedure
      .input(z.object({ changeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await approveChange(input.changeId, ctx.user!.id);
        return { success: true };
      }),
    dismiss: adminProcedure
      .input(z.object({ changeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await dismissChange(input.changeId, ctx.user!.id);
        return { success: true };
      }),
  }),

  ads: router({
    listActive: publicProcedure
      .input(z.object({ position: z.enum(["banner_top", "banner_bottom", "sidebar_card", "inline_card"]) }))
      .query(async ({ input }) => await listActiveAdSlots(input.position)),
    listAll: adminProcedure.query(async () => await listAllAdSlots()),
    create: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => await createAdSlot(input)),
    update: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => await updateAdSlot(input.id, input)),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteAdSlot(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(z.any())
      .mutation(async () => {
        return { url: "/placeholder-ad.png", key: "placeholder" };
      })
  }),

  cron: router({
    run: adminProcedure.mutation(async () => {
      const url = `http://127.0.0.1:${ENV.port}/api/cron/monthly-url-check`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-cron-secret': ENV.cronSecret }
      });
      if (!res.ok) throw new Error('Cron execution failed: ' + await res.text());
      return res.json();
    }),
    status: adminProcedure.query(async () => {
      return (await getCronConfig("monthly-url-check")) ?? null;
    }),
    updateLastRun: adminProcedure
      .input(z.object({ status: z.string() }))
      .mutation(async ({ input }) => {
        await updateCronLastRun("monthly-url-check", input.status);
        return { success: true };
      }),
  }),

  // ── Swap Listings ────────────────────────────────────────────────────────────
  swap: router({
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

    create: publicProcedure
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
          posterName: z.string().min(1).max(128),
          posterEmail: z.string().email().max(320),
          posterPhone: z.string().max(32).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const id = await createSwapListing({ ...input, expiresAt });
        return { id };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSwapListing(input.id);
        return { success: true };
      }),

    listAll: adminProcedure.query(() => listAllSwapListings()),
  }),
});

export type AppRouter = typeof appRouter;
