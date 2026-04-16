// /home/bukhari/work/PageRoastAI/components/auth/AuthCard.tsx

import React from "react";

interface AuthCardProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

/**
 * Centered card wrapper for auth pages.
 */
export function AuthCard({ children, title, description }: AuthCardProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-zinc-950">
            <div className="w-full max-w-md p-8 border rounded-xl bg-zinc-900 border-zinc-800 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                        PageRoastAI
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold text-zinc-100">{title}</h1>
                    <p className="mt-2 text-sm text-center text-zinc-400">{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
