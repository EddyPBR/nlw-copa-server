import { prisma } from "../lib/prisma";
import type { FastifyInstance } from "fastify";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/users/count", async () => {
    const count = await prisma.user.count();

    return { count };
  });
};
