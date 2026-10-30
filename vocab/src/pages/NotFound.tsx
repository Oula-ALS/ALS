import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted">This link may be old or have a typo.</p>
      <Link to="/" className="btn-primary mt-6">
        Go to home
      </Link>
    </Layout>
  );
}
