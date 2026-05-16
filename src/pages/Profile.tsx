import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import useAppStore from '../stores/useAppStore';

export default function Profile() {
  const setUser = useAppStore((state) => state.setUser);
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setProfile({ username: data.user.username, email: data.user.email });
          setUser({ 
            name: data.user.username, 
            email: data.user.email,
            avatarInitial: data.user.username[0]?.toUpperCase() || 'U'
          });
        } else {
          setError(data.error || data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError('An error occurred while loading the profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const clearUser = useAppStore((state) => state.clearUser);
  const handleLogout = () => {
    clearUser();
    authService.logout();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-dev-surface border border-dev-border rounded-3xl p-8 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-dev-text-main">Your Profile</h2>
          <div className="w-16 h-16 bg-gradient-to-tr from-dev-primary to-dev-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-dev-primary/30">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        {loading ? (
          <div className="text-dev-text-muted animate-pulse">Loading profile information...</div>
        ) : error ? (
          <div className="text-red-500 bg-red-500/10 p-4 rounded-xl">{error}</div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="bg-dev-card rounded-2xl p-6 border border-dev-border">
              <label className="block text-sm font-medium text-dev-text-muted mb-2">Username</label>
              <div className="text-lg text-dev-text-main font-medium">{profile.username}</div>
            </div>
            
            <div className="bg-dev-card rounded-2xl p-6 border border-dev-border">
              <label className="block text-sm font-medium text-dev-text-muted mb-2">Email Address</label>
              <div className="text-lg text-dev-text-main font-medium">{profile.email}</div>
            </div>

            <div className="pt-6 border-t border-dev-border mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-lg hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
