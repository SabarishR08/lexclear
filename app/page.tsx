import Link from "next/link";
import { FileText, MessageSquareText, ShieldAlert } from "lucide-react";

const features = [
  {
    icon: <FileText color="#126b5a" aria-hidden="true" />,
    title: "Plain-language clauses",
    body: "Read a grade-8 explanation alongside the original text, clause by clause.",
  },
  {
    icon: <ShieldAlert color="#a85220" aria-hidden="true" />,
    title: "Risks & obligations",
    body: "See terms that need a closer look, each with a written label and a reason.",
  },
  {
    icon: <MessageSquareText color="#126b5a" aria-hidden="true" />,
    title: "Ask your document",
    body: "Get cited answers taken from the words in your document, not generic advice.",
  },
];

export default function Home() {
  return (
    <main className="page" id="main">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/">
          Lex<span>Clear</span>
        </Link>
        <Link className="btn secondary" href="/login">
          Sign in
        </Link>
      </nav>

      <section className="hero">
        <div>
          <p className="tag">LEGAL DOCUMENT CLARITY</p>
          <h1>Understand what you&apos;re signing.</h1>
          <p className="lead">
            Upload a lease, offer letter, NDA or contract. LexClear turns dense clauses into clear
            language, helps you spot things to ask about, and keeps every answer grounded in your
            document.
          </p>
          <Link className="btn" href="/dashboard">
            Review a document
          </Link>
        </div>
        <div className="panel" aria-label="Example clause analysis">
          <span className="tag">Needs attention · Clause 8</span>
          <div className="demo-doc">
            <strong>Original</strong>
            <p>
              Either party may terminate this Agreement upon thirty (30) days&rsquo; written notice.
            </p>
          </div>
          <div className="demo-doc">
            <strong>In plain language</strong>
            <p>Either side can end the agreement, but must give a month&rsquo;s written notice.</p>
          </div>
        </div>
      </section>

      <section className="grid" aria-label="How LexClear helps">
        {features.map((feature) => (
          <div className="card" key={feature.title}>
            {feature.icon}
            <h2 className="card-title">{feature.title}</h2>
            <p>{feature.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
