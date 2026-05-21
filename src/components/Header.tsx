import React from "react";
import { User, LogIn, LogOut, Sparkles } from "lucide-react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { UserProfile } from "../types";

interface HeaderProps {
  user: UserProfile | null;
  loadingAuth: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, loadingAuth }) => {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
      alert("로그인 중 에러가 발생했습니다: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="border-b border-gray-150 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-200/50 relative overflow-hidden group">
            <span className="text-xl font-bold text-amber-950 group-hover:scale-110 transition-transform">🍌</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 font-sans">
                나노 바나나 목업 AI 비주얼라이저
              </h1>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles size={8} /> Nano Banana
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 hidden sm:block">
              Generative AI-Powered Brand Mockups
            </p>
          </div>
        </div>

        {/* User Status / Login Actions */}
        <div className="flex items-center gap-3">
          {loadingAuth ? (
            <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 hover:bg-gray-100/80 transition-colors p-1.5 pr-3 rounded-full border border-gray-100">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full border border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <User size={14} />
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-gray-500 leading-none">Logged In</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 duration-150 p-1 rounded-full hover:bg-white transition-all shadow-sm"
                title="로그아웃"
                id="btn-logout"
              >
                <LogOut size={14} className="stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 text-xs font-semibold text-white bg-gray-900 hover:bg-amber-500 hover:text-amber-950 px-4 py-2 rounded-xl transition-all duration-300 shadow-md shadow-gray-200/50 hover:shadow-amber-200/40 cursor-pointer"
              id="btn-login"
            >
              <LogIn size={14} />
              <span>Google 계정으로 시작</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
