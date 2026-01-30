'use client';

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export function GoogleSignInButton() {
    const auth = useAuth();
    
    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // The user state will be updated by the useUser hook
            // and the user will be redirected if needed.
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    return (
        <Button onClick={handleSignIn} className="w-full">
            <svg
                className="mr-2 -ml-1 w-4 h-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
                >
                <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C322 104 287.3 88 248 88c-79.5 0-144 64.5-144 144s64.5 144 144 144c88.8 0 128.3-64.2 134.8-97.4H248v-85.3h236.1c2.3 12.7 3.9 26.1 3.9 40.2z"
                ></path>
            </svg>
            Sign in with Google
        </Button>
    );
}
