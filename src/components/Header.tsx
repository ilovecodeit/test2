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
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm flex items-center justify-between px-4 sm:px-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center relative overflow-hidden group shadow-sm">
            <span className="text-sm font-bold text-white group-hover:scale-110 transition-transform select-none">🍌</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-800 font-sans">
                나노 바나나 <span className="text-blue-600">AI</span> 비주얼라이저
              </h1>
              <span className="hidden xs:inline-flex text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-100 items-center gap-0.5">
                <Sparkles size={8} /> Professional
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 hidden sm:block leading-none mt-0.5">
              Generative AI-Powered Pro consistent mockups
            </p>
          </div>
        </div>

        {/* API Connection Indicator & User actions */}
        <div className="flex items-center gap-4">
          {/* Gemini connection badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-slate-600 font-mono">Gemini 2.5 Connected</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

          {/* User Status / Login Actions */}
          <div className="flex items-center gap-3">
            {loadingAuth ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full border border-slate-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <User size={12} />
                  </div>
                )}
                <div className="hidden xs:block text-left">
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">
                    {user.displayName}
                  </p>
                  <p className="text-[8px] text-slate-400 leading-none">Firebase OAuth</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 duration-150 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                  title="로그아웃"
                  id="btn-logout"
                >
                  <LogOut size={12} className="stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 hover:shadow-blue-200 px-3.5 py-1.5 rounded-lg transition-all duration-300 shadow-sm cursor-pointer"
                id="btn-login"
              >
                <LogIn size={13} />
                <span>Google 계정 로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
