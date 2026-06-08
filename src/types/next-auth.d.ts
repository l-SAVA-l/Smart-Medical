import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: "USER" | "ADMIN" | "CHIEF_DOCTOR" | "OPERATOR";
    };
  }

  interface User {
    id: string;
    role?: "USER" | "ADMIN" | "CHIEF_DOCTOR" | "OPERATOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN" | "CHIEF_DOCTOR" | "OPERATOR";
  }
}

