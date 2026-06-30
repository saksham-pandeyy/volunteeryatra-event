import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { notify } from "@/common/utils";
import { baseApi } from "@/common/api";
import { useLoginMutation, useRegisterMutation, useGetMeQuery } from "../services";

interface AuthUser { id: string; email: string; name: string; avatar_url?: string | null; created_at?: string }

export function useAuth() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const cachedUser = localStorage.getItem("user");
    if (storedToken) {
      setToken(storedToken);
      if (cachedUser) {
        try { setUser(JSON.parse(cachedUser)); } catch { /* ignore */ }
      }
    }
    setInitialized(true);
  }, []);

  const { data: meData, isError: meError, refetch: refetchUser } = useGetMeQuery(undefined, {
    skip: !token || !initialized,
  });

  const refreshUser = useCallback(() => {
    if (token) refetchUser();
  }, [token, refetchUser]);

  useEffect(() => {
    if (meData) {
      setUser(meData);
      localStorage.setItem("user", JSON.stringify(meData));
    }
  }, [meData]);

  useEffect(() => {
    if (meError) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }, [meError]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password }).unwrap();
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    notify.success(`Welcome back, ${result.user.name || "User"}!`);
    setTimeout(() => router.replace("/dashboard"), 300);
  }, [loginMutation, router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerMutation({ name, email, password }).unwrap();
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    notify.success("Account created successfully! Welcome aboard.");
    setTimeout(() => router.replace("/dashboard"), 300);
  }, [registerMutation, router]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    dispatch(baseApi.util.resetApiState());
    notify.info("You have been logged out");
    window.location.href = "/login";
  }, [dispatch]);

  return { user, isAuthenticated: !!token, login, register, logout, refreshUser, loginLoading, registerLoading, initialized };
}
