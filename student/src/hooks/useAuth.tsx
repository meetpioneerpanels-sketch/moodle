import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { collection, doc, getDocs, limit, onSnapshot, query, setDoc } from 'firebase/firestore';
import { auth, db, isDemoMode } from '../firebase';
import { demoStore } from '../lib/demoStore';
import type { AppUser, Role } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists. Try logging in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'No connection - check your network and try again.';
    default:
      return (error as Error)?.message ?? 'Something went wrong. Please try again.';
  }
}

/** Demo mode has no profile to read, so make a presentable name from the email. */
function displayNameFrom(email: string): string {
  const local = email.split('@')[0] ?? 'Learner';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    let stopProfile: (() => void) | undefined;

    const stopAuth = onAuthStateChanged(auth, (account) => {
      stopProfile?.();
      if (!account) {
        setUser(null);
        setLoading(false);
        return;
      }
      stopProfile = onSnapshot(
        doc(db, 'users', account.uid),
        (snapshot) => {
          const data = snapshot.data();
          setUser({
            id: account.uid,
            name: (data?.name as string) ?? account.email ?? 'Student',
            email: (data?.email as string) ?? account.email ?? '',
            role: (data?.role as Role) ?? 'student',
            createdAt: (data?.createdAt as number) ?? Date.now(),
          });
          setLoading(false);
        },
        () => setLoading(false),
      );
    });

    return () => {
      stopProfile?.();
      stopAuth();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      const existing = demoStore.findUserByEmail(email);
      setUser(
        existing ??
          demoStore.addUser({
            name: displayNameFrom(email),
            email,
            role: 'student',
            createdAt: Date.now(),
          }),
      );
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string, role: Role) => {
      if (isDemoMode) {
        if (demoStore.findUserByEmail(email)) {
          throw new Error('An account with that email already exists. Try logging in.');
        }
        setUser(demoStore.addUser({ name, email, role, createdAt: Date.now() }));
        return;
      }
      try {
        // Matches the console: the very first account in a fresh project is the admin.
        const existing = await getDocs(query(collection(db, 'users'), limit(1)));
        const effectiveRole: Role = existing.empty ? 'admin' : role;
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email,
          role: effectiveRole,
          createdAt: Date.now(),
        });
      } catch (error) {
        throw new Error(authErrorMessage(error));
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
