import type {
  ConnectedGitHubIssue,
  ConnectedRepository,
  GitHubInstallation,
} from "./types";

/* ------------------------------------------------------------------
   MOCK DATA — UI-only phase. Deleted wholesale once `github-service.ts`
   talks to the real Sherlock backend. Avatar URLs stay null so the UI
   renders its placeholder circles instead of fetching remote images.
------------------------------------------------------------------- */

export const MOCK_INSTALLATIONS: GitHubInstallation[] = [
  {
    id: 1,
    accountLogin: "acme",
    accountType: "Organization",
    manageUrl: "https://github.com/settings/installations",
  },
];

export const MOCK_REPOSITORIES: ConnectedRepository[] = [
  {
    id: 101,
    fullName: "acme/checkout-web",
    htmlUrl: "https://github.com/acme/checkout-web",
    private: true,
    ownerAvatarUrl: null,
    installationId: 1,
  },
  {
    id: 102,
    fullName: "acme/payments-api",
    htmlUrl: "https://github.com/acme/payments-api",
    private: true,
    ownerAvatarUrl: null,
    installationId: 1,
  },
  {
    id: 103,
    fullName: "acme/marketing-site",
    htmlUrl: "https://github.com/acme/marketing-site",
    private: false,
    ownerAvatarUrl: null,
    installationId: 1,
  },
];

export const MOCK_ISSUES: Record<number, ConnectedGitHubIssue[]> = {
  101: [
    {
      id: 9001,
      number: 214,
      title: "TypeError: cart.items is undefined on /checkout",
      body: "Checkout page crashes for returning users with a stale cart cookie.",
      state: "open",
      htmlUrl: "https://github.com/acme/checkout-web/issues/214",
      author: { login: "mwilson", avatarUrl: null },
      labels: ["bug", "checkout"],
      createdAt: "2026-07-21T14:32:00Z",
      updatedAt: "2026-07-22T09:10:00Z",
    },
    {
      id: 9002,
      number: 213,
      title: "Promo code field accepts expired codes",
      body: "Expired promo codes still apply a discount at checkout.",
      state: "open",
      htmlUrl: "https://github.com/acme/checkout-web/issues/213",
      author: { login: "dchen", avatarUrl: null },
      labels: ["bug"],
      createdAt: "2026-07-20T08:15:00Z",
      updatedAt: "2026-07-20T08:15:00Z",
    },
    {
      id: 9003,
      number: 209,
      title: "Session crash on login when auth cookie is stale",
      body: "Users with an expired session cookie hit a 500 on login.",
      state: "closed",
      htmlUrl: "https://github.com/acme/checkout-web/issues/209",
      author: { login: "mwilson", avatarUrl: null },
      labels: ["bug", "auth"],
      createdAt: "2026-07-14T17:45:00Z",
      updatedAt: "2026-07-18T11:02:00Z",
    },
  ],
  102: [
    {
      id: 9101,
      number: 87,
      title: "Stripe webhook retries exhausted on 500 responses",
      body: "Webhook handler returns 500 under load and Stripe stops retrying.",
      state: "open",
      htmlUrl: "https://github.com/acme/payments-api/issues/87",
      author: { login: "priyak", avatarUrl: null },
      labels: ["bug", "payments", "urgent"],
      createdAt: "2026-07-22T06:20:00Z",
      updatedAt: "2026-07-22T07:00:00Z",
    },
    {
      id: 9102,
      number: 85,
      title: "Refund endpoint double-charges on network timeout",
      body: "Retrying a timed-out refund call issues the refund twice.",
      state: "open",
      htmlUrl: "https://github.com/acme/payments-api/issues/85",
      author: { login: "dchen", avatarUrl: null },
      labels: ["bug"],
      createdAt: "2026-07-19T13:05:00Z",
      updatedAt: "2026-07-19T13:05:00Z",
    },
  ],
  103: [],
};
