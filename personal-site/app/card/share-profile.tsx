"use client";

import { useState } from "react";
import { CardIcon } from "./card-icon";
import styles from "./card.module.css";

export function ShareProfile() {
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function share() {
    const url = new URL("/card", window.location.origin).href;
    setBusy(true);
    setMessage("");
    setManualUrl("");
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: "Sicheng Ouyang", url });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(url);
      setMessage("Profile link copied.");
    } catch {
      setManualUrl(url);
      setMessage("Select and copy the link below.");
    } finally {
      setBusy(false);
    }
  }

  return <div className={styles.shareWrap}>
    <button className={styles.share} type="button" onClick={share} disabled={busy} aria-label="Share profile"><CardIcon name="share" /></button>
    <div className={styles.shareFeedback} role="status">{message}</div>
    {manualUrl && <input className={styles.manualUrl} aria-label="Profile link to copy" readOnly value={manualUrl} onFocus={(event) => event.target.select()} />}
  </div>;
}
