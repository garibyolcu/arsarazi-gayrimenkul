import { z } from "zod";
import bcryptjs from "bcryptjs";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { createLocalSessionToken, LOCAL_COOKIE_NAME } from "./local-auth";
import { getSessionCookieOptions } from "./lib/cookies";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createRouter({
  me: publicQuery.query(async (opts) => {
    if (!opts.ctx.user) return null;
    const u = opts.ctx.user;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      phone: u.phone,
      isActive: u.isActive,
    };
  }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const rows = await getDb()
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      const user = rows.at(0);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const valid = await bcryptjs.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = await createLocalSessionToken(user.id);
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(LOCAL_COOKIE_NAME, token, {
          httpOnly: true,
          path: "/",
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: 7 * 24 * 60 * 60,
        }),
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(LOCAL_COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  register: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"]).default("AGENT"),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getDb()
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await bcryptjs.hash(input.password, 10);
      await getDb().insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        phone: input.phone,
        isActive: true,
      });

      return { success: true };
    }),
});
