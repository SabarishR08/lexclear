// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  Lock,
  MessageSquareText,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { InteractiveLandingPreview } from "@/components/interactive-landing-preview";

const features = [
  {
    icon: <FileText size={24} className="feature-icon" aria-hidden="true" />,
    title: "Plain-Language Clause Translation",
    body: "Reads complex boilerplate and outputs a clear Grade-8 explanation side-by-side with original text.",
  },
  {
    icon: <ShieldAlert size={24} className="feature-icon alert" aria-hidden="true" />,
    title: "Red-Flag & Risk Highlighting",
    body: "Pinpoints high-risk terms with explicit visual labels (🔴 Risky, 🟡 Needs Attention, 🟢 Favorable) and clear rationales.",
  },
  {
    icon: <MessageSquareText size={24} className="feature-icon" aria-hidden="true" />,
    title: "Grounded Document Q&A",
    body: "Ask questions and receive answers cited verbatim from your contract text using pgvector RAG.",
  },
  {
    icon: <Scale size={24} className="feature-icon" aria-hidden="true" />,
    title: "Fairness Scorecard & Inconsistency Checks",
    body: "Audits bilateral vs. one-sided terms and spots internal date or rate contradictions before you sign.",
  },
  {
    icon: <FileCheck2 size={24} className="feature-icon" aria-hidden="true" />,
    title: "Counter-Proposals & Lawyer Prep Sheet",
    body: "Equips non-lawyers with alternative wording to propose and one-click exportable attorney consultation sheets.",
  },
  {
    icon: <Lock size={24} className="feature-icon" aria-hidden="true" />,
    title: "Zero Retention & Privacy First",
    body: "Your document text is never retained for model training. Session files can be purged anytime.",
  },
];

const trustBadges = [
  { label: "Powered by Google Gemini 2.5 Flash", icon: <Sparkles size={16} /> },
  { label: "Grounded RAG with pgvector", icon: <CheckCircle2 size={16} /> },
  { label: "Zero Model Retraining on User Data", icon: <Lock size={16} /> },
];

export default function Home() {
  return (
    <main className="page landing-page" id="main">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/">
          Lex<span>Clear</span>
        </Link>
        <div className="nav-actions">
          <Link className="btn secondary" href="/login">
            Sign in
          </Link>
          <Link className="btn primary-cta" href="/dashboard">
            Open App <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="badge-pill">LEGAL DOCUMENT CLARITY</span>
            <span className="badge-pill-sub">AI FOR ACCESS TO JUSTICE</span>
          </div>
          <h1>Understand what you&apos;re signing before you commit.</h1>
          <p className="lead">
            Upload any residential lease, freelance contract, NDA, or offer letter. LexClear
            transforms dense legalese into grade-8 plain English, flags one-sided risks, detects
            hidden contradictions, and lets you ask questions grounded strictly in the document
            text.
          </p>

          <div className="hero-cta-group">
            <Link className="btn primary-cta large" href="/dashboard">
              Review a Document Free <ArrowRight size={18} />
            </Link>
            <Link className="btn secondary large" href="/dashboard">
              Try Interactive Sample Contracts
            </Link>
          </div>

          <div className="trust-strip" aria-label="Security and AI infrastructure">
            {trustBadges.map((badge) => (
              <div className="trust-item" key={badge.label}>
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-preview-col">
          <InteractiveLandingPreview />
        </div>
      </section>

      <section className="section-features" aria-label="Comprehensive analysis capabilities">
        <div className="section-header">
          <p className="tag">ENTERPRISE-GRADE LEGAL REASONING FOR EVERYDAY SIGNERS</p>
          <h2>Everything you need to negotiate with confidence</h2>
          <p className="section-sub">
            Built specifically for tenants, freelancers, and employees facing unequal bargaining
            power.
          </p>
        </div>

        <div className="grid">
          {features.map((feature) => (
            <div className="card feature-card" key={feature.title}>
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3 className="card-title">{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner" aria-label="Get started">
        <div className="cta-banner-content">
          <h2>Ready to demystify your contract?</h2>
          <p>
            Upload your PDF or paste contract clauses to get your clause guide, risk summary, and
            negotiation checklist in seconds.
          </p>
          <div className="cta-btn-wrapper">
            <Link className="btn primary-cta large" href="/dashboard">
              Start Free Analysis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer-strip">
        <p>© 2026 LexClear. Submitted for PromptWars 2026 — AI for Legal Assistance & Access.</p>
        <p className="disclaimer-text">
          LexClear provides educational clarity and document analysis; it does not provide legal
          advice or create an attorney-client relationship.
        </p>
      </footer>
    </main>
  );
}
