import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../lib/auth-context";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/discover");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-mesh">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <Link href="/"><span className="text-2xl font-extrabold gradient-text cursor-pointer">HydraSpark ⚡</span></Link>
          <h1 className="text-2xl font-bold mt-4 mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue your spark</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full gradient-bg text-white font-bold py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In ⚡"}
          </motion.button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          No account?{" "}
          <Link href="/auth/register">
            <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-medium">Create one</span>
          </Link>
        </p>

        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <Link href="/admin/login">
            <span className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer">Admin access →</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
