// /home/bukhari/work/PageRoastAI/components/auth/AuthAlert.tsx

import React from "react";

interface AuthAlertProps {
    type: "error" | "success";
    message: string | React.ReactNode | null | undefined;
}

/**
 * Styled alert for authentication result messages.
 */
export function AuthAlert({ type, message }: AuthAlertProps) {
    if (!message) return null;

    const isError = type === "error";

    return (
        <div
            className={`p-4 mt-2 text-sm border rounded-lg animate-in fade-in slide-in-from-top-1 ${
                isError
                    ? "bg-red-500/10 border-red-500/50 text-red-500"
                    : "bg-green-500/10 border-green-500/50 text-green-500"
            }`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {isError ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    )}
                </div>
                <div className="flex-1 overflow-hidden break-words">{message}</div>
            </div>
        </div>
    );
}
