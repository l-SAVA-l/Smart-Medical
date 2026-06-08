import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                login: { label: "Логин", type: "text" },
                password: { label: "Пароль", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.login || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.patient.findFirst({
                        where: { login: credentials.login },
                    });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.avatar_url,
                    };
                } catch (error) {
                    return null;
                }
            }
        }),
    ],
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const email = user.email ?? (token.email as string | undefined);
                if (email) {
                    try {
                        const patient = await prisma.patient.findUnique({
                            where: { email },
                            select: { id: true },
                        });
                        if (patient) {
                            token.id = patient.id.toString();
                        } else {
                            token.id = user.id;
                        }
                    } catch {
                        token.id = user.id;
                    }
                } else {
                    token.id = user.id;
                }
                token.role = user.role;
                token.picture = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.image = token.picture as string | null | undefined;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };