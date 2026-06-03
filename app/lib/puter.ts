import { useEffect, useState } from "react";

declare global {
    interface Window {
        puter?: any;
    }
}

export function usePuterStore() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                if (typeof window === "undefined") {
                    if (mounted) setIsLoading(false);
                    return;
                }

                if (!window.puter || !window.puter.auth) {
                    if (mounted) setIsLoading(false);
                    return;
                }

                const signedIn = await window.puter.auth.isSignedIn();

                if (!mounted) return;

                setIsAuthenticated(!!signedIn);

                if (signedIn) {
                    const currentUser = await window.puter.auth.getUser();
                    if (!mounted) return;
                    setUser(currentUser ?? null);
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (!mounted) return;
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            initAuth();
        }, 300);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, []);

    const signIn = async () => {
        try {
            setIsLoading(true);

            if (!window.puter || !window.puter.auth) {
                setIsLoading(false);
                return;
            }

            await window.puter.auth.signIn();

            const signedIn = await window.puter.auth.isSignedIn();
            setIsAuthenticated(!!signedIn);

            if (signedIn) {
                const currentUser = await window.puter.auth.getUser();
                setUser(currentUser ?? null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);

            if (!window.puter || !window.puter.auth) {
                setIsLoading(false);
                return;
            }

            await window.puter.auth.signOut();
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        auth: {
            isAuthenticated,
            user,
            signIn,
            signOut,
        },
    };
}