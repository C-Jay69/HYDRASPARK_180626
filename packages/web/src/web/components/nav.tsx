import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/meetups", label: "Meetups" },
  { href: "/chat", label: "Chat" },
  { href: "/guardian", label: "Guardian" },
  { href: "/spark-wallet", label: "⚡ Wallet" },
];

export function Nav() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-extrabold gradient-text cursor-pointer">HydraSpark⚡</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                location === href ? "text-purple-400" : "text-gray-400 hover:text-white"
              }`}>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.isGoldSpark && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-400 border border-amber-400/40 rounded-full px-3 py-1">
                  ✦ Gold Spark
                </span>
              )}
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>
              {(user.role === "admin" || user.role === "marshal") && (
                <Link href="/admin">
                  <span className="text-xs text-purple-400 border border-purple-400/40 rounded-full px-2 py-1 hover:bg-purple-400/10 transition-colors cursor-pointer">Admin</span>
                </Link>
              )}
              <button onClick={logout} className="text-xs text-gray-400 hover:text-white transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Sign in</span>
              </Link>
              <Link href="/auth/register">
                <span className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
                  Join
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
