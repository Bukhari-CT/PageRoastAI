import { auth } from "./lib/auth";

console.log("Password hash function:", auth.options.emailAndPassword?.password?.hash?.toString());
console.log("Password verify function:", auth.options.emailAndPassword?.password?.verify?.toString());
