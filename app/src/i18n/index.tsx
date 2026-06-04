// API pública de i18n para componentes React.
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { getLang, persistLang, setModuleLang, t } from "./core";
import type { Lang } from "./dict";
import { LANGS } from "./dict";

export { t, getLang };
export { LANGS };
export type { Lang };

type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const I18nContext = createContext<Ctx>({ lang: getLang(), setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang());
  setModuleLang(lang); // garantiza que t() use el idioma actual en este render

  const setLang = useCallback((l: Lang) => {
    setModuleLang(l);
    persistLang(l);
    setLangState(l);
  }, []);

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

/** Idioma actual + setter. Suscribirse acá re-renderiza al cambiar de idioma. */
export function useLang(): Ctx {
  return useContext(I18nContext);
}

/** Devuelve la función de traducción y suscribe al cambio de idioma. */
export function useT(): typeof t {
  useContext(I18nContext);
  return t;
}
