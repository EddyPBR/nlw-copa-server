import { prisma } from "../lib/prisma";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../plugins/authenticate";

type GenerateTokenParams = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    "/me",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      await request.jwtVerify();

      return { user: request.user };
    }
  );

  fastify.post("/users", async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });

    const { access_token } = createUserBody.parse(request.body);

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userData);

    const user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });

    const generateToken = ({ id, name, avatarUrl }: GenerateTokenParams) =>
      fastify.jwt.sign(
        {
          name,
          avatarUrl,
        },
        {
          sub: id,
          expiresIn: "1d",
        }
      );

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      });

      const token = generateToken({
        id: newUser.id,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
      });

      return { token };
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });

    return { token };
  });
};
