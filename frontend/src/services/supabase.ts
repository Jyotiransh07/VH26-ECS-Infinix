// Supabase Client with Environment Variable support and Safe Mock Fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-leakguard-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-public-safe';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'USER' | 'ADMIN';
  org_id?: string;
}

export const mockCurrentUser: UserProfile = {
  id: 'usr-101-janson',
  email: 'williams@mesh.com',
  full_name: 'Janson Williams',
  avatar_url: '',
  role: 'USER',
  org_id: 'org-mesh-security'
};

export const mockAdminUser: UserProfile = {
  id: 'usr-001-admin',
  email: 'admin@leakguard.internal',
  full_name: 'Admin Supervisor',
  avatar_url: '',
  role: 'ADMIN',
  org_id: 'org-mesh-security'
};

class SupabaseService {
  private user: UserProfile = mockCurrentUser;
  private listeners: Array<(event: string, payload: any) => void> = [];

  getUser(): UserProfile {
    return this.user;
  }

  setUserRole(role: 'USER' | 'ADMIN') {
    this.user = role === 'ADMIN' ? mockAdminUser : mockCurrentUser;
    this.broadcast('USER_ROLE_CHANGED', this.user);
  }

  async signInWithGitHub(): Promise<{ user: UserProfile | null; error: string | null }> {
    console.log('[Supabase Auth] Initiating GitHub OAuth flow via Supabase Auth...');
    // Simulated successful GitHub OAuth callback
    this.user = {
      id: 'usr-github-987',
      email: 'github-dev@users.noreply.github.com',
      full_name: 'GitHub Verified Developer',
      avatar_url: 'https://github.com/identicons/leakguard.png',
      role: 'USER',
      org_id: 'org-mesh-security'
    };
    this.broadcast('AUTH_STATE_CHANGE', { event: 'SIGNED_IN', user: this.user });
    return { user: this.user, error: null };
  }

  async signOut(): Promise<void> {
    this.user = mockCurrentUser;
    this.broadcast('AUTH_STATE_CHANGE', { event: 'SIGNED_OUT', user: null });
  }

  // Realtime subscription channel simulation
  subscribeToFindings(repositoryId: string, callback: (payload: any) => void) {
    const listener = (event: string, payload: any) => {
      if (event === 'NEW_FINDING' || event === 'FINDING_UPDATED') {
        callback(payload);
      }
    };
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  broadcast(event: string, payload: any) {
    this.listeners.forEach(cb => cb(event, payload));
  }
}

export const supabase = new SupabaseService();
