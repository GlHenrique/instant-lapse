import { useI18n } from "@/i18n/I18nProvider";
import { type Lang } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const LANGS: Lang[] = ["pt", "en"];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-line text-xs font-medium"
      role="group"
      aria-label={t("language")}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "px-2.5 py-1.5 uppercase transition-colors",
            lang === l
              ? "bg-amber text-ink"
              : "bg-panel2 text-muted hover:text-fg"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
