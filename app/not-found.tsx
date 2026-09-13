// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page login-page" id="main">
      <h1 className="login-title">We could not find that page</h1>
      <p className="lead">
        The document may have been deleted, or it belongs to a different account.
      </p>
      <Link className="btn" href="/dashboard">
        Back to your library
      </Link>
    </main>
  );
}
