import { auth } from "./lib/auth";

async function main() {
    console.log("Checking context password properties...");
    console.log(auth.options.emailAndPassword?.password?.verify ? "Has custom verify" : "No custom verify");
    try {
        const res = await auth.api.signInEmail({
            body: { email: "admin@pageroast.ai", password: "asdf@1234" },
            headers: new Headers()
        });
        console.log("Success:", res);
    } catch (e: any) {
        console.error("Sign in error:", e);
        if (e.message) console.error("message:", e.message);
    }
}
main();
