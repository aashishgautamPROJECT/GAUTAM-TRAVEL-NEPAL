import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

export const ADMIN_EMAILS = [
  'admin@gautamtravels.com',
  'admin@meridianjourneys.com',
  'aashishgautam5609@gmail.com',
  'aashishgautam88487@gmail.com'
];

interface AuthContextType {
  user: any;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (params: { email: string; password: string; full_name: string; phone: string }) => Promise<{ error: string | null }>;
  signIn: (params: { email: string; password: string }) => Promise<{ error: string | null }>;
  signInAsAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updatedFields: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInAsAdmin: async () => {},
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const savedUser = localStorage.getItem('mj_auth_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setProfile(parsed);
        } catch (e) {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    const client = supabase;

    const checkSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  const signUp = async ({ email, password, full_name, phone }: { email: string; password: string; full_name: string; phone: string }) => {
    if (!isSupabaseConfigured || !supabase) {
      const mockUser: Profile = {
        id: `usr-${Date.now()}`,
        email,
        full_name,
        phone,
        preferred_language: 'en',
        preferred_currency: 'NPR'
      };
      localStorage.setItem('mj_auth_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setProfile(mockUser);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone
        }
      }
    });

    if (error) return { error: error.message };
    if (data.user) {
      setUser(data.user);
      // Also ensure profile row is created
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name,
        email,
        phone,
        preferred_language: 'en',
        preferred_currency: 'NPR'
      });
      await fetchProfile(data.user.id);
    }
    return { error: null };
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    if (!isSupabaseConfigured || !supabase) {
      const mockUser: Profile = {
        id: 'usr-demo-local',
        email,
        full_name: email.split('@')[0],
        phone: '+9779841234567',
        preferred_language: 'en',
        preferred_currency: 'NPR'
      };
      localStorage.setItem('mj_auth_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setProfile(mockUser);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { error: error.message };
    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('mj_auth_user');
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updatedFields: Partial<Profile>) => {
    if (!user) return { error: "No user signed in" };

    if (!isSupabaseConfigured || !supabase) {
      const updated: Profile = { ...profile, ...updatedFields } as Profile;
      localStorage.setItem('mj_auth_user', JSON.stringify(updated));
      setProfile(updated);
      return { error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('id', user.id)
        .select()
        .single();

      if (error) return { error: error.message };
      if (data) setProfile(data);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) ||
    (profile?.email && ADMIN_EMAILS.includes(profile.email.toLowerCase()))
  );

  const signInAsAdmin = async () => {
    const adminUser: Profile = {
      id: 'usr-admin-portal',
      email: 'admin@gautamtravels.com',
      full_name: 'Aashish Gautam (Administrator)',
      phone: '+9779841234567',
      preferred_language: 'en',
      preferred_currency: 'NPR',
      role: 'admin'
    };
    localStorage.setItem('mj_auth_user', JSON.stringify(adminUser));
    setUser(adminUser);
    setProfile(adminUser);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signUp, signIn, signInAsAdmin, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

