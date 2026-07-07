"use client";

import { useState } from "react";

// Static-export friendly demo form: validates locally and shows a
// confirmation. Wire `onSubmit` to your form backend (e.g. a serverless
// endpoint or a service like Formspree) when going live.
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="contact-form">
        <div className="form-ok">
          Request received — we&apos;ll reply within one business day to set
          up your demo.
        </div>
      </div>
    );
  }

  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required placeholder="Ada Lovelace" />
      </div>
      <div className="field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="ada@company.com"
        />
      </div>
      <div className="field">
        <label htmlFor="repo">GitHub org / repo (optional)</label>
        <input id="repo" name="repo" placeholder="acme/taskboard" />
      </div>
      <div className="field">
        <label htmlFor="interest">I&apos;m interested in</label>
        <select id="interest" name="interest" defaultValue="demo">
          <option value="demo">A live demo</option>
          <option value="pilot">Starting a pilot</option>
          <option value="enterprise">Enterprise / self-hosted</option>
          <option value="security">Security review</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="msg">Anything we should know?</label>
        <textarea
          id="msg"
          name="msg"
          rows={4}
          placeholder="Stack, team size, the bug that made you look for this…"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-lg">
        Request demo
      </button>
    </form>
  );
}
