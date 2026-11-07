// Errores del navegador → Jentry, el tracker de errores propio de DevCloud
// (ba5c529907b1.devcloudsoftware.com), proyecto «viajes» (#88): el mismo al
// que DeployCloud manda los del servidor. La clave pública de un DSN está hecha
// para viajar en el navegador: con ella se pueden mandar eventos, no leerlos.
//
// Qué viaja: el mensaje y el stack del error, la página (sin el viaje que un
// link de compartir lleva en el hash) y el navegador. Los viajes, que viven en
// localStorage, no salen nunca.
import { init, type JentryEventPayload } from "@jentry/sdk";

export const JENTRY_DSN = "https://71300e99846a49de351a815f7a36de4a@ba5c529907b1.devcloudsoftware.com/88";

/** Solo el build de producción servido desde un dominio de verdad: Jentry no
 *  filtra localhost, y un `vite preview` o un dev server no son errores de
 *  nadie más que de quien está programando. */
export function debeReportar(hostname: string, prod: boolean): boolean {
  if (!prod) return false;
  const host = hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
  if (host === "[::1]" || host === "::1" || host === "0.0.0.0" || /^127\./.test(host)) return false;
  return true;
}

/** La URL que se reporta. Un link de compartir codifica el viaje entero en
 *  `#share=…`: eso no se manda, solo que era un link compartido. */
export function urlReportable(href: string): string {
  return href.replace(/#share=.*$/, "#share=…");
}

export function conPagina(event: JentryEventPayload, href: string, userAgent: string): JentryEventPayload {
  // El SDK no dice desde qué página salió el error; sin esto no hay forma de
  // saber si fue en el buscador, en un viaje o en un link compartido.
  return {
    ...event,
    request: { ...event.request, url: urlReportable(href), headers: { ...event.request?.headers, "User-Agent": userAgent } },
  };
}

/** Arranca el SDK: desde acá, toda excepción no atrapada y toda promesa
 *  rechazada sin catch llegan a Jentry. Nunca tira: reportar errores no puede
 *  ser lo que rompa la app. */
export function iniciarJentry(): void {
  try {
    if (!debeReportar(window.location.hostname, import.meta.env.PROD)) return;
    init({
      dsn: JENTRY_DSN,
      environment: "production",
      beforeSend: (event) => conPagina(event, window.location.href, navigator.userAgent),
    });
  } catch {
    /* sin reporte, la app sigue igual */
  }
}
