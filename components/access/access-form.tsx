"use client";

import { useActionState } from "react";

import { unlockAccess } from "@/app/actions/access";

const initialState = { ok: false as const, message: "" };

export function AccessForm() {
  const [state, formAction, pending] = useActionState(unlockAccess, initialState);

  return (
    <form action={formAction} className="form-panel">
      <label className="stack">
        <span>Clave de acceso</span>
        <input
          name="accessKey"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
          className="field"
        />
      </label>
      {state.message ? <p className="error">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Comprobando..." : "Entrar"}
      </button>
    </form>
  );
}
