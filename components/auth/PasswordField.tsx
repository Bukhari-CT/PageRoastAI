// /home/bukhari/work/PageRoastAI/components/auth/PasswordField.tsx

"use client";

import React, { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PasswordFieldProps {
    label: string;
    name: string;
    placeholder?: string;
    error?: string;
    register: UseFormRegisterReturn;
    hint?: React.ReactNode;
}

/**
 * Enhanced FormField with show/hide password toggle.
 */
export function PasswordField({ label, name, placeholder, error, register, hint }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor={name} className="text-sm font-medium text-zinc-300">
                {label}
            </label>
            <div className="relative group">
                <input
                    {...register}
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    className={`flex w-full h-10 pl-3 pr-10 py-2 text-sm transition-all border rounded-md bg-zinc-800 border-zinc-700 text-zinc-100 ring-offset-zinc-950 placeholder:text-zinc-500 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 ${
                        error ? "border-red-500/50 ring-2 ring-red-500/20 focus:ring-red-500/50" : ""
                    }`}
                />
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 transition-colors hover:text-zinc-200 focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                </button>
            </div>
            {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            {hint && !error && <div className="text-xs mt-0.5 text-zinc-500">{hint}</div>}
        </div>
    );
}
