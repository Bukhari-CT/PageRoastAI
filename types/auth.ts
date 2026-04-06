// /home/bukhari/work/PageRoastAI/types/auth.ts

/**
 * Interface representing the user object returned from useSession().
 */
export interface SessionUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    isAdmin: boolean;
    package: string | null;
    image: string | null;
}

/**
 * Interface representing a complete Better Auth session.
 */
export interface AuthSession {
    user: SessionUser;
    session: {
        id: string;
        expiresAt: string | Date;
    };
}
