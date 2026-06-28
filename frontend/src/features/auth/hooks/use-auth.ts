import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useRegisterMutation, useGetMeQuery } from "../services";

interface AuthUser { id: string; email: string; name: string; created_at?: string }

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();
  const { data: meData, isError: meError } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => { const stored = localStorage.getItem("token"); if (stored) setToken(stored); }, []);
  useEffect(() => { if (meData?.success && meData.data) setUser(meData.data); }, [meData]);
  useEffect(() => { if (meError) { setToken(null); setUser(null); localStorage.removeItem("token"); } }, [meError]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password }).unwrap();
    if (result.success) { localStorage.setItem("token", result.data.token); setToken(result.data.token); setUser(result.data.user); router.replace("/dashboard"); }
  }, [loginMutation, router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerMutation({ name, email, password }).unwrap();
    if (result.success) { localStorage.setItem("token", result.data.token); setToken(result.data.token); setUser(result.data.user); router.replace("/dashboard"); }
  }, [registerMutation, router]);

  const logout = useCallback(() => { localStorage.removeItem("token"); setToken(null); setUser(null); }, []);

  return { user, isAuthenticated: !!token, login, register, logout, loginLoading, registerLoading };
}
