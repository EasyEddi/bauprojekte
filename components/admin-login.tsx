"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: data.get("password") }),
    });
    const result = await response.json() as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error ?? "Anmeldung fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <label className="field">
        <span>Admin-Passwort</span>
        <input name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Anmelden …" : "Anmelden"}</button>
    </form>
  );
}
