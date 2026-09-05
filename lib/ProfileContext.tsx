"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
    firstName: string;
    lastName: string;
    location: string;
    bio: string;
    businessName: string;
    education: string;
    experience: string;
    phone: string;
}

export const EMPTY_PROFILE: UserProfile = {
    firstName: "",
    lastName: "",
    location: "",
    bio: "",
    businessName: "",
    education: "",
    experience: "",
    phone: "",
};

interface ProfileContextValue {
    profile: UserProfile;
    setProfile: (p: UserProfile) => void;
    hydrated: boolean;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = "aspire_user_profile";

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfileState] = useState<UserProfile>(EMPTY_PROFILE);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) setProfileState({ ...EMPTY_PROFILE, ...JSON.parse(raw) });
        } catch (err) {
            console.error("[ProfileContext] failed to load profile:", err);
        } finally {
            setHydrated(true);
        }
    }, []);

    const setProfile = (p: UserProfile) => {
        setProfileState(p);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
        } catch (err) {
            console.error("[ProfileContext] failed to save profile:", err);
        }
    };

    return (
        <ProfileContext.Provider value={{ profile, setProfile, hydrated }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
    return ctx;
}
