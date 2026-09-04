import { z } from "zod";
import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "./_core/trpc.js";
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
  listActiveSportSponsors,
  listAllSportSponsors,
  getSportSponsorByName,
  createSportSponsor,
  updateSportSponsor,
  deleteSportSponsor,
  getCronConfig,
  updateCronLastRun,
  listActiveSwapListings,
  listUserSwapListings,
  updateSwapListingStatus,
  createSwapListing,
  deleteSwapListing,
  listAllSwapListings,
  listAlertSubscribers,
  deleteAlertSubscriber,
  countAlertSubscribers,
  listSponsorshipInquiries,
  updateSponsorshipInquiryStatus,
  deleteSponsorshipInquiry,
  countSponsorshipInquiries,
} from "./db.js";
import { ENV } from "./_core/env.js";

const COOKIE_NAME = "lcs_session";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req as any);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  programs: router({
    list: publicProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            sport: z.string().optional(),
            townArea: z.string().optional(),
            status: z.enum(["open", "upcoming", "closed"]).optional(),
            ageMin: z.number().optional(),
            ageMax: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        let filtered = await listPrograms();
        if (input?.search) {
          const q = input.search.toLowerCase();
          filtered = filtered.filter(
            p =>
              p.sportName.toLowerCase().includes(q) ||
              p.organization.toLowerCase().includes(q) ||
              p.townArea?.toLowerCase().includes(q)
          );
        }
        if (input?.sport) {
          filtered = filtered.filter(p => p.sportName === input.sport);
        }
        if (input?.townArea) {
          filtered = filtered.filter(p => p.townArea === input.townArea);
        }
        if (input?.ageMin !== undefined && input?.ageMax !== undefined) {
          filtered = filtered.filter(p => {
            if (p.ageMin === null || p.ageMax === null) return true;
            return p.ageMax >= input.ageMin! && p.ageMin <= input.ageMax!;
          });
        }
        if (input?.status) {
          const now = new Date();
          filtered = filtered.filter(p => {
            const open = p.registrationOpenDate
              ? new Date(p.registrationOpenDate)
              : null;
            const close = p.registrationCloseDate
              ? new Date(p.registrationCloseDate)
              : null;
            if (input.status === "open")
              return open && close && open <= now && now <= close;
            if (input.status === "upcoming") return open && open > now;
            if (input.status === "closed")
              return !open || (close && now > close);
            return true;
          });
        }
        return filtered;
      }),
    listAll: adminProcedure.query(async () => await listAllPrograms()),
    create: adminProcedure.input(z.any()).mutation(async ({ input }) => {
      const data: any = { ...input };
      [
        "registrationOpenDate",
        "registrationCloseDate",
        "programStartDate",
        "programEndDate",
      ].forEach(f => {
        if (data[f]) data[f] = new Date(data[f]);
        else data[f] = null;
      });
      return await createProgram(data);
    }),
    update: adminProcedure.input(z.any()).mutation(async ({ input }) => {
      const data: any = { ...input };
      [
        "registrationOpenDate",
        "registrationCloseDate",
        "programStartDate",
        "programEndDate",
      ].forEach(f => {
        if (data[f] !== undefined) {
          if (data[f]) data[f] = new Date(data[f]);
          else data[f] = null;
        }
      });
      return await updateProgram(input.id, data);
    }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProgram(input.id);
        return { success: true };
      }),
  }),

  changes: router({
    listPending: adminProcedure.query(async () => await listPendingChanges()),
    pendingCount: adminProcedure.query(async () => ({
      count: await countPendingChanges(),
    })),
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
      .input(
        z.object({
          position: z.enum([
            "banner_top",
            "banner_bottom",
            "sidebar_card",
            "inline_card",
          ]),
        })
      )
      .query(async ({ input }) => await listActiveAdSlots(input.position)),
    listAll: adminProcedure.query(async () => await listAllAdSlots()),
    create: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => await createAdSlot(input)),
    update: adminProcedure
      .input(z.any())
      .mutation(async ({ input }) => await updateAdSlot(input.id, input)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAdSlot(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          filename: z.string(),
          adId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { storagePut } = await import("./storage.js");
          const buffer = Buffer.from(input.base64, "base64");
          const safeFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
          const res = await storagePut(
            `ads/${Date.now()}_${safeFilename}`,
            buffer,
            input.mimeType
          );
          if (input.adId) {
            await updateAdSlot(input.adId, {
              imageUrl: res.url,
              imageKey: res.key,
            });
          }
          return { url: res.url, key: res.key };
        } catch (err: any) {
          console.error("Storage upload fallback:", err);
          const dataUrl = `data:${input.mimeType};base64,${input.base64}`;
          if (input.adId) {
            await updateAdSlot(input.adId, {
              imageUrl: dataUrl,
              imageKey: "fallback",
            });
          }
          return { url: dataUrl, key: "fallback" };
        }
      }),
  }),

  sportSponsors: router({
    listActive: publicProcedure.query(
      async () => await listActiveSportSponsors()
    ),
    getForSport: publicProcedure
      .input(z.object({ sport: z.string() }))
      .query(async ({ input }) => await getSportSponsorByName(input.sport)),
    listAll: adminProcedure.query(async () => await listAllSportSponsors()),
    create: adminProcedure
      .input(
        z.object({
          sportName: z.string().min(1),
          sponsorName: z.string().min(1),
          imageUrl: z.string().min(1),
          imageKey: z.string().optional(),
          destinationUrl: z.string().min(1),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => await createSportSponsor(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          sportName: z.string().optional(),
          sponsorName: z.string().optional(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          destinationUrl: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSportSponsor(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSportSponsor(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          filename: z.string(),
          sponsorId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { storagePut } = await import("./storage.js");
          const buffer = Buffer.from(input.base64, "base64");
          const safeFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
          const res = await storagePut(
            `sport-sponsors/${Date.now()}_${safeFilename}`,
            buffer,
            input.mimeType
          );
          if (input.sponsorId) {
            await updateSportSponsor(input.sponsorId, {
              imageUrl: res.url,
              imageKey: res.key,
            });
          }
          return { url: res.url, key: res.key };
        } catch (err: any) {
          console.error("Storage upload fallback:", err);
          const dataUrl = `data:${input.mimeType};base64,${input.base64}`;
          if (input.sponsorId) {
            await updateSportSponsor(input.sponsorId, {
              imageUrl: dataUrl,
              imageKey: "fallback",
            });
          }
          return { url: dataUrl, key: "fallback" };
        }
      }),
  }),

  cron: router({
    run: adminProcedure.mutation(async () => {
      const { runMonthlyUrlCheck } = await import("./cronHandler.js");
      try {
        const result = await runMonthlyUrlCheck();
        return { ok: true, ...result };
      } catch (err: any) {
        throw new Error("Cron execution failed: " + err.message);
      }
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

  //  Swap Listings
  swap: router({
    list: publicProcedure
      .input(
        z
          .object({
            sport: z.string().optional(),
            townArea: z.string().optional(),
            condition: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const rows = await listActiveSwapListings(input ?? {});
        if (!ctx.user) {
          return rows.map(r => ({
            ...r,
            user: {
              ...r.user,
              email: null,
              phone: null,
            },
          }));
        }
        return rows;
      }),

    myListings: protectedProcedure.query(({ ctx }) =>
      listUserSwapListings(ctx.user.id)
    ),

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
          expiresAt,
        });
        return { id };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["active", "completed", "archived"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateSwapListingStatus(input.id, ctx.user.id, input.status);
        return { success: true };
      }),

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
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSwapListing(input.id);
        return { success: true };
      }),

    listAll: adminProcedure.query(() => listAllSwapListings()),
  }),

  //  Users Management (Admin)
  users: router({
    list: adminProcedure.query(async () => {
      const { getDb } = await import("./db.js");
      const { users } = await import("../drizzle/schema.js");
      const { desc } = await import("drizzle-orm");
      return (await getDb())
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
    }),
    updateRole: adminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db.js");
        const { users } = await import("../drizzle/schema.js");
        const { eq } = await import("drizzle-orm");
        await (await getDb())
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.id));
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

  // ── Alert Subscribers (Admin) ───────────────────────────────────────────────
  subscribers: router({
    list: adminProcedure.query(async () => {
      return await listAlertSubscribers();
    }),
    count: adminProcedure.query(async () => {
      return { count: await countAlertSubscribers() };
    }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAlertSubscriber(input.id);
        return { success: true };
      }),
  }),

  // ── Sponsorship Inquiries (Admin) ──────────────────────────────────────────
  sponsors: router({
    list: adminProcedure.query(async () => {
      return await listSponsorshipInquiries();
    }),
    count: adminProcedure.query(async () => {
      return { count: await countSponsorshipInquiries() };
    }),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await updateSponsorshipInquiryStatus(input.id, input.status);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSponsorshipInquiry(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
