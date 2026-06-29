import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox.tsx";
// import Button from "../../../components/ui/button/Button.tsx";
import { useAuthStore } from "../../../store/authStore.ts";
import Loader from "../../../components/common/Loader.tsx";
import { useAuth } from "../../../utils/useAuth.ts";

export default function SignInForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Password

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const login = useAuthStore((state) => state.login);
  const { loading, userLoged, error } = useAuthStore((state) => state);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate, userLoged]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      navigate("/");
    }
  }, [navigate, userLoged]);

  // email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setStep(2);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordError("");

    if (isChecked) {
      localStorage.setItem("keepLoggedIn", "true");
    } else {
      localStorage.removeItem("keepLoggedIn");
    }

    await login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {loading && <Loader />}

      {/* Card */}
      <div className="w-full max-w-md border border-white/10 bg-white text-black rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/baleryon_text_png.png" className="w-35 mx-auto mb-3" />

          <h1 className="text-2xl font-semibold text-black">Admin Sign In</h1>

          <p className="text-sm text-gray-600 mt-1">
            {step === 1
              ? "Enter your email to continue"
              : "Enter password to access dashboard"}
          </p>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-5">
            <div
              className={`h-1 w-10 rounded-full ${step >= 1 ? "bg-black" : "bg-gray-300"}`}
            />
            <div
              className={`h-1 w-10 rounded-full ${step === 2 ? "bg-black" : "bg-gray-300"}`}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
            <span className="text-red-500 font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}

            <div>
              <Label className="text-black">Email</Label>

              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="admin@company.com"
                className="mt-2 border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Continue
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}

            <div>
              <Label className="text-black">Password</Label>

              <div className="relative mt-2">
                <Input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-black pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Keep logged in */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              Keep me logged in
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-black"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
