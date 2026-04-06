// /home/bukhari/work/PageRoastAI/components/auth/FormField.tsx

import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    error?: string;
    register: UseFormRegisterReturn;
}

/**
 * Reusable controlled input component with error messaging.
 */
export function FormField({ label, name, type = "text", placeholder, error, register }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor={name} className="text-sm font-medium text-zinc-300">
                {label}
            </label>
            <input
                {...register}
                id={name}
                type={type}
                placeholder={placeholder}
                className={`flex w-full h-10 px-3 py-2 text-sm transition-colors border rounded-md bg-zinc-800 border-zinc-700 text-zinc-100 ring-offset-zinc-950 placeholder:text-zinc-500 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 ${
                    error ? "border-red-500/50 ring-2 ring-red-500/20 focus:ring-red-500/50" : ""
                }`}
            />
            {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        </div>
    );
}
