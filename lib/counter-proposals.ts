// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export interface CounterProposal {
  suggestedWording: string;
  rationale: string;
  negotiationTip: string;
}

/**
 * Provides balanced alternative clause suggestions and counter-negotiation points.
 */
export function getCounterProposal(
  category: string,
  clauseText: string,
  reason: string,
): CounterProposal {
  const lower = (category + " " + clauseText + " " + reason).toLowerCase();

  // Termination / Penalty
  if (lower.includes("terminat") || lower.includes("penalty") || lower.includes("liquidated")) {
    return {
      suggestedWording:
        "Either party may terminate this Agreement prior to expiration upon giving thirty (30) days' prior written notice and payment of an early termination fee equal to one (1) month's standard fee, subject to prompt re-letting or mitigation efforts.",
      rationale:
        "Standard commercial standards limit early termination penalties to 30 days notice and 1 month's fee, with an explicit obligation on the non-terminating party to mitigate damages.",
      negotiationTip:
        "Propose this by explaining that unexpected employment relocation or emergencies require bilateral flexibility, and highlight your willingness to provide ample notice.",
    };
  }

  // Indemnification / Liability
  if (lower.includes("indemn") || lower.includes("hold harmless") || lower.includes("liability")) {
    return {
      suggestedWording:
        "Each party agrees to indemnify, defend, and hold harmless the other party from third-party claims arising directly from gross negligence or willful misconduct, excluding claims arising from the other party's own negligence or breach.",
      rationale:
        "Indemnity obligations should be reciprocal (bilateral) and strictly limited to willful misconduct or gross negligence, rather than unilateral strict liability.",
      negotiationTip:
        "Remind the counterparty that standard business insurance policies do not cover indemnification for standard ordinary wear or third-party actions beyond your control.",
    };
  }

  // Deposit / Withholding
  if (lower.includes("deposit") || lower.includes("withhold") || lower.includes("forfeit")) {
    return {
      suggestedWording:
        "The deposit shall be held in an interest-bearing escrow account and returned within twenty-one (21) days of departure, accompanied by an itemized written invoice and receipts for any legitimate repairs exceeding normal wear and tear.",
      rationale:
        "Deposits are security against property damage, not arbitrary liquidated penalties. Itemized proof ensures accountability and prevents unjustified forfeitures.",
      negotiationTip:
        "Request that photo documentation and receipts accompany any proposed deduction before any funds are withheld.",
    };
  }

  // Restrictive covenants / Non-compete / Non-solicit
  if (lower.includes("solicit") || lower.includes("restrict") || lower.includes("compete")) {
    return {
      suggestedWording:
        "During the term and for six (6) months thereafter, neither party shall directly solicit active employees of the other party with whom they had direct project collaboration during the preceding twelve months.",
      rationale:
        "Restricting non-solicitation to 6 months and limiting it strictly to direct project collaborators is standard, legally enforceable, and avoids anti-competitive overbreadth.",
      negotiationTip:
        "Emphasize that overly broad restrictions can hinder ordinary industry networking and may be unenforceable under modern labor standards.",
    };
  }

  // General default fallback
  return {
    suggestedWording:
      "The parties agree that all duties and remedies under this clause shall be exercised reasonably, with at least fourteen (14) days' written notice and an opportunity to cure prior to declaring a default or imposing fees.",
    rationale:
      "Introducing a mandatory notice and cure window ensures fair play and prevents sudden unilateral penalties.",
    negotiationTip:
      "Ask for reasonable notice before any fee or breach is asserted to ensure both sides have time to resolve misunderstandings.",
  };
}
