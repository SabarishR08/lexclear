// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export type SampleContractType = "lease" | "nda";

export interface SampleContract {
  title: string;
  type: SampleContractType;
  description: string;
  rawText: string;
}

export const SAMPLE_CONTRACTS: Record<SampleContractType, SampleContract> = {
  lease: {
    title: "Sample Residential Lease Agreement",
    type: "lease",
    description:
      "Standard 12-month residential tenancy with deposit, maintenance, and termination clauses.",
    rawText: `RESIDENTIAL LEASE AGREEMENT

1. PARTIES AND PREMISES
This Agreement is entered into between Oakridge Properties LLC ("Landlord") and Jane Doe ("Tenant") for the premises located at 742 Evergreen Terrace, Unit 4B, Springfield ("Premises").

2. TERM AND RENT
The initial term shall commence on October 1, 2026, and terminate on September 30, 2027. Monthly rent is $1,850.00, payable in advance on or before the first day of each calendar month. Payments received after the 5th day shall incur a late charge of $75.00 plus $10.00 per each additional day late.

3. SECURITY DEPOSIT
Upon execution, Tenant shall deposit $1,850.00 as a Security Deposit. The deposit shall be returned within thirty (30) days of move-out, minus deductions for unpaid rent or repair of damages beyond standard wear and tear. Landlord shall provide an itemized written statement for any withholdings.

4. EARLY TERMINATION AND LIQUIDATED DAMAGES
Tenant may terminate this lease prior to expiration only upon giving sixty (60) days' prior written notice and paying an early termination penalty fee equal to two (2) months' full rent ($3,700.00). Failure to provide sixty days' notice shall forfeit the entire Security Deposit in addition to the penalty fee.

5. MAINTENANCE AND REPAIRS
Tenant shall promptly notify Landlord in writing of any condition requiring repair. Tenant is responsible for minor maintenance costs up to $100.00 per occurrence, including replacing lightbulbs, smoke detector batteries, and clearing minor plumbing clogs. Major repairs to heating, electrical, and structural systems shall be borne by Landlord.

6. ACCESS BY LANDLORD
Landlord reserves the right to enter the Premises at reasonable times with at least twenty-four (24) hours' advance notice for inspection, repairs, or showing to prospective buyers or tenants. In an emergency involving imminent threat to life or property, Landlord may enter immediately without prior notice.

7. PETS AND RESTRICTIONS
No pets of any kind (including dogs, cats, reptiles, or birds) are permitted on the Premises without Landlord's express prior written consent and payment of a non-refundable $350.00 pet fee plus $35.00 monthly pet rent.

8. INDEMNIFICATION AND LIABILITY
To the fullest extent permitted by law, Tenant agrees to indemnify, defend, and hold Landlord harmless from any claim, liability, loss, or expense arising from Tenant's use of the Premises or from any guest or invitee of Tenant, regardless of whether Landlord was partially negligent.`,
  },
  nda: {
    title: "Sample Mutual Non-Disclosure Agreement",
    type: "nda",
    description:
      "Bilateral confidentiality agreement covering proprietary tech, trade secrets, and non-solicitation.",
    rawText: `MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE
AcroTech Solutions Inc. ("Party A") and Nexus Data Labs ("Party B") desire to explore a prospective business collaboration concerning artificial intelligence and document processing architectures ("Purpose").

2. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public, proprietary information disclosed by either party, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.

3. EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that: (a) is or becomes publicly available without breach of this Agreement; (b) was known to the receiving party prior to disclosure without obligation of confidentiality; (c) is independently developed by the receiving party without reference to the disclosing party's information; or (d) is rightfully received from a third party without duty of confidentiality.

4. NON-USE AND NON-DISCLOSURE OBLIGATIONS
Each party agrees to: (a) hold the other party's Confidential Information in strict confidence using at least the degree of care it uses for its own confidential materials; (b) use Confidential Information solely to evaluate and perform the Purpose; and (c) restrict disclosure to employees and contractors who need to know and are bound by confidentiality covenants no less protective than this Agreement.

5. DURATION AND SURVIVAL
This Agreement remains effective for two (2) years from the Effective Date. The confidentiality and non-use obligations with respect to any disclosed Confidential Information shall survive termination and remain binding for a period of five (5) years following disclosure, except that obligations regarding trade secrets shall survive indefinitely.

6. NON-SOLICITATION COVENANT
During the term of this Agreement and for a period of twelve (12) months thereafter, neither party shall directly or indirectly solicit, recruit, or attempt to hire any senior software engineer or research scientist employed by the other party without prior written consent.

7. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles. Any dispute arising out of or relating to this Agreement shall be resolved exclusively in the state or federal courts located in Wilmington, Delaware, and each party irrevocably waives any right to a trial by jury.`,
  },
};
