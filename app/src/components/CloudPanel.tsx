import { useState } from "react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { signIn, signUp, signOut, describeCloudError, SETUP_SQL } from "../lib/cloud";
import { track } from "../lib/analytics";

type Props = {
  client: SupabaseClient | null;
  session: Session | null;
  onSync: () => Promise<string>;
  onConfigure: () => void;
};

export function CloudPanel({ client, session, onSync, onConfigure }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  if (!client) {
    return (
      <div className="cloud-panel">
        <p className="settings-hint">
          La sincronización en la nube usa <strong>tu propio</strong> proyecto de Supabase (gratis).
          Configurá la URL y la anon key en Configuración para activarla.
        </p>
        <button className="button-primary" onClick={onConfigure}>Ir a Configuración</button>
      </div>
    );
  }

  const auth = async (mode: "in" | "up") => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "up") {
        await signUp(client, email.trim(), password);
        setInfo("Cuenta creada. Si tu proyecto pide confirmación por email, revisá tu casilla; si no, ya podés iniciar sesión.");
      } else {
        await signIn(client, email.trim(), password);
        track("cloud_login");
        setInfo("Sesión iniciada. Sincronizando…");
      }
      setPassword("");
    } catch (e) {
      setError(describeCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    await signOut(client);
    setBusy(false);
  };

  const sync = async () => {
    setBusy(true);
    setError(null);
    try {
      const msg = await onSync();
      setInfo(msg);
    } catch (e) {
      setError(describeCloudError(e));
    } finally {
      setBusy(false);
    }
  };

  if (session) {
    return (
      <div className="cloud-panel">
        <div className="cloud-status">
          <span className="cloud-dot online" /> Conectado como <strong>{session.user.email}</strong>
        </div>
        <p className="settings-hint">Tus viajes se sincronizan con tu proyecto de Supabase (last-write-wins).</p>
        <div className="form-actions">
          <button className="button-secondary" onClick={logout} disabled={busy}>Cerrar sesión</button>
          <button className="button-primary" onClick={sync} disabled={busy}>{busy ? "Sincronizando…" : "Sincronizar ahora"}</button>
        </div>
        {error && <p className="form-error">{error}</p>}
        {info && <p className="form-info">{info}</p>}
      </div>
    );
  }

  return (
    <div className="cloud-panel">
      <p className="settings-hint">
        Iniciá sesión para sincronizar tus viajes entre dispositivos. Primera vez:
        creá una cuenta. Antes, asegurate de haber creado la tabla con el SQL de setup.
      </p>
      <button className="link-button" onClick={() => setShowSql((v) => !v)}>
        {showSql ? "Ocultar" : "Ver"} SQL de setup
      </button>
      {showSql && <pre className="sql-block">{SETUP_SQL}</pre>}

      <label className="field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </label>

      {error && <p className="form-error">{error}</p>}
      {info && <p className="form-info">{info}</p>}

      <div className="form-actions">
        <button className="button-secondary" onClick={() => auth("up")} disabled={busy || !email || !password}>Crear cuenta</button>
        <button className="button-primary" onClick={() => auth("in")} disabled={busy || !email || !password}>Iniciar sesión</button>
      </div>
    </div>
  );
}
