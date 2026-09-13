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
