// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { DISCLAIMER } from "@/lib/disclaimer";

export function DisclaimerBanner() {
  return (
    <div className="notice" role="note">
      {DISCLAIMER}
    </div>
  );
}

/** Rendered above every AI-generated output, so it never depends on the model echoing it. */
export function InlineDisclaimer() {
  return (
    <p className="disclaimer" role="note">
      {DISCLAIMER}
    </p>
  );
}
