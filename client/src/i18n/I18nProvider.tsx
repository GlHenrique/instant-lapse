import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dict, type Lang, type TKey } from "./translations";

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function detectLang(): Lang {
  const saved = localStorage.getItem("lang");
  if (saved === "pt" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.title = dict[lang].docTitle;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => {
        let s: string = dict[lang][key] ?? dict.pt[key] ?? key;
        if (params) {
          for (const k of Object.keys(params)) {
            s = s.split(`{${k}}`).join(String(params[k]));
          }
        }
        return s;
      },
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
