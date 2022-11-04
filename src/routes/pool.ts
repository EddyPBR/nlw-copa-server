import type { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export const poolRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();

    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = generate().toString().toUpperCase();

    await prisma.pool.create({
      data: {
        title,
        code,
      },
    });

    return reply.status(201).send({ code });
  });
};
