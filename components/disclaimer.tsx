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
