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
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 blur-[120px] -z-10 rounded-full" />

            <div className="w-full max-w-md p-8 border rounded-xl bg-card/50 backdrop-blur-sm border-border shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-3xl font-bold text-foreground">
                        🔥 PageRoast
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold text-foreground">{title}</h1>
                    <p className="mt-2 text-sm text-center text-muted-foreground">{description}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
