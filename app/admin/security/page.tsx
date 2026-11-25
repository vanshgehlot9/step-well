"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password is too weak. Please use at least 8 characters.";
    case "auth/requires-recent-login":
      return "For security, please sign out and sign back in before updating your password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/provider-already-linked":
      return "Password sign-in is already linked to this account.";
    default:
      return err instanceof Error ? err.message : "Failed to update security settings.";
  }
}

export default function AdminSecurityPage() {
  const {
    user,
    changePassword,
    setPasswordForAccount,
    sendPasswordReset,
    updateDisplayName,
  } = useAuth();

  const hasPasswordProvider = user?.providers?.includes("password") ?? true;

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [copiedId, setCopiedId] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Reset email state
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const copyAdminId = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileMsg({ type: "error", text: "Display name cannot be empty." });
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateDisplayName(displayName.trim());
      setProfileMsg({ type: "success", text: "Admin display name updated successfully." });
    } catch (err) {
      setProfileMsg({ type: "error", text: mapFirebaseAuthError(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    if (hasPasswordProvider && currentPassword === newPassword) {
      setPasswordMsg({
        type: "error",
        text: "New password must be different from your current password.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      if (hasPasswordProvider) {
        await changePassword(currentPassword, newPassword);
        setPasswordMsg({
          type: "success",
          text: "Admin password changed successfully. Use the new password on your next sign-in.",
        });
      } else {
        await setPasswordForAccount(newPassword);
        setPasswordMsg({
          type: "success",
          text: "Password login enabled for your admin account. You can now sign in with Email & Password.",
        });
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: mapFirebaseAuthError(err) });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    setSendingReset(true);
    setResetMsg(null);
    try {
      await sendPasswordReset(user?.email);
      setResetMsg({
        type: "success",
        text: `Password reset link sent to ${user?.email}. Check your inbox (and spam folder).`,
      });
    } catch (err) {
      setResetMsg({ type: "error", text: mapFirebaseAuthError(err) });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent-blue font-bold mb-1">
          System · Security &amp; Credentials
        </p>
        <h1 className="font-serif text-3xl font-bold text-primary-blue">
          Account &amp; Password
        </h1>
        <p className="text-xs md:text-sm text-primary-blue-light/70 mt-1">
          View your Admin Login ID, update your profile name, or change the admin panel password at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin ID & Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0D3B66] text-white flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-primary-blue">
                  Admin Login ID &amp; Profile
                </h2>
                <p className="text-xs text-primary-blue-light/60">
                  Credentials used to sign in at <code className="font-mono">/admin/login</code>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-blue/50 border border-surface-blue-dark space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-blue-light/55">
                  Admin Login ID (Email)
                </p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-sm font-bold text-primary-blue break-all">
                    {user?.email || "—"}
                  </p>
                  <button
                    type="button"
                    onClick={copyAdminId}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-surface-blue-dark text-[11px] font-bold text-primary-blue hover:border-accent-blue"
                  >
                    {copiedId ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy ID
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-blue-dark">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={11} /> Role: {user?.role || "admin"}
                </span>
                {(user?.providers || ["password"]).map((provider) => (
                  <span
                    key={provider}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-primary-blue border border-surface-blue-dark"
                  >
                    {provider === "password" ? "Email & Password" : provider}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Foundation Administrator"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
              </div>

              {profileMsg && (
                <div
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                    profileMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-blue border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue transition-all disabled:opacity-50"
              >
                {savingProfile && <Loader2 size={13} className="animate-spin" />}
                Save Display Name
              </button>
            </form>
          </div>

          {/* Email Password Reset Fallback */}
          <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Mail size={18} className="text-accent-blue" />
              <h3 className="font-serif text-lg font-bold text-primary-blue">
                Reset via Email Link
              </h3>
            </div>
            <p className="text-xs text-primary-blue-light/70 leading-relaxed">
              Need to reset the password from your inbox instead? Send a secure Firebase password
              reset link directly to <strong>{user?.email}</strong>.
            </p>

            {resetMsg && (
              <div
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${
                  resetMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {resetMsg.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={sendingReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-surface-blue-dark text-xs font-bold text-primary-blue hover:border-accent-blue transition-all disabled:opacity-50"
            >
              {sendingReset ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              Send Password Reset Email
            </button>
          </div>
        </div>

        {/* Change / Set Password Card */}
        <div className="bg-white rounded-3xl border border-surface-blue-dark p-6 space-y-5 shadow-sm h-fit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/15 text-accent-blue flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-primary-blue">
                {hasPasswordProvider ? "Change Admin Password" : "Set Admin Password"}
              </h2>
              <p className="text-xs text-primary-blue-light/60">
                {hasPasswordProvider
                  ? "Verify your current password and enter a new strong password."
                  : "Your account currently uses Google Sign-In. Set a password to also sign in with ID & Password."}
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {hasPasswordProvider && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-blue-light/45 hover:text-primary-blue"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-blue-light/45 hover:text-primary-blue"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-blue-light/70 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-surface-blue-dark text-sm text-primary-blue outline-none focus:border-accent-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-blue-light/45 hover:text-primary-blue"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-3.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0D3B66]/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingPassword ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  {hasPasswordProvider ? "Update Admin Password" : "Set Admin Password"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
