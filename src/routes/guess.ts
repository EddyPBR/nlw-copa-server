import { prisma } from "../lib/prisma";
import type { FastifyInstance } from "fastify";

export const guessRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });
};
