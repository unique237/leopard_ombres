import { createContext, useContext, type ReactNode } from "react";
import { useSettings, type SiteSettings } from "@/hooks/use-settings";

const SettingsContext = createContext<SiteSettings | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used inside SettingsProvider");
  return ctx;
}
