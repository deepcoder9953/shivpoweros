import React from 'react';
import { ArrowRight, Zap, LayoutDashboard } from 'lucide-react';
import { Link, useRouter } from '../../router/Router';
import { useAuth } from '../../auth/AuthContext';

export const LandingCTA: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  return (
    <section className="py-20 relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden text-center space-y-6">
          {/* Subtle background graphic */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>Scale Your Operations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Run Your Business Smarter?
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
            Create your account and start managing your business from one intelligent workspace.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <button
                type="button"
                id="cta-open-dashboard-btn"
                onClick={() => navigate('/app')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  id="cta-create-account-btn"
                  className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  id="cta-signin-btn"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
