import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
// import Button from "../../../components/ui/button/Button.tsx";
import { useAuthStore } from "../../../store/authStore.ts";
import Loader from "../../../components/common/Loader.tsx";
import { useAuth } from "../../../utils/useAuth.ts";

export default function SignUpForm() {
    const navigate = useNavigate();
    const [showPassword] = useState(false);

    // Create states for each field in the sign up form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState(""); // <-- Added type state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Error states for each field
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [typeError, setTypeError] = useState(""); // <-- Added type error state
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const signup = useAuthStore((state) => state.signup);
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

    // sign up submit
    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let valid = true;

        // Reset errors
        setNameError("");
        setEmailError("");
        setPhoneError("");
        setTypeError(""); // <-- Reset type error
        setPasswordError("");
        setConfirmPasswordError("");

        // Name validation
        if (!name.trim()) {
            setNameError("Name is required");
            valid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailError("Email is required");
            valid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            valid = false;
        }

        // Phone validation (simple, can be improved)
        if (!phone.trim()) {
            setPhoneError("Phone is required");
            valid = false;
        }

        // Type validation
        if (!type) {
            setTypeError("Type is required");
            valid = false;
        }

        // Password validation
        if (!password) {
            setPasswordError("Password is required");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            valid = false;
        }

        // Confirm password validation
        if (!confirmPassword) {
            setConfirmPasswordError("Please confirm your password");
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            valid = false;
        }

        if (!valid) return;

        // TODO: Call sign up API here

        // For now, just log the values
        console.log(name, email, phone, type, password, "fielddddddddddddd");
        // You may need to update your signup function to accept type as well
        await signup(email, password, phone, name, type);

        // Optionally, redirect or show success message
    };

    return (
        <div className="flex flex-col flex-1 min-h-screen px-4 overflow-auto md:items-center md:justify-center bg-amber-50">
            {loading && <Loader />}
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="sm:mb-8">
                        <img src="/baleryon_dragon_full.png" className="w-30" />
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-sm">
                            Sign up
                        </h1>
                    </div>

                    {error && (
                        <div className="relative py-3 sm:py-5">
                            <span className="p-2 text-red-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSignUpSubmit}>
                        <div className="space-y-2">
                            <div>
                                <Label>
                                    Name<span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    placeholder="Your name"
                                    className="bg-white"
                                />
                                {nameError && (
                                    <p className="mt-1 text-sm text-red-500">{nameError}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    Email <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError("");
                                    }}
                                    placeholder="info@gmail.com"
                                    className="bg-white"
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-500">{emailError}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    Phone <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        if (phoneError) setPhoneError("");
                                    }}
                                    placeholder="Your phone number"
                                    className="bg-white"
                                />
                                {phoneError && (
                                    <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    Type <span className="text-error-500">*</span>
                                </Label>
                                <select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        if (typeError) setTypeError("");
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="">Select type</option>
                                    <option value="HNI">HNI</option>
                                    <option value="NRI">NRI</option>
                                    <option value="Company">Company</option>
                                </select>
                                {typeError && (
                                    <p className="mt-1 text-sm text-red-500">{typeError}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    Password <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError("");
                                    }}
                                    placeholder="Enter your password"
                                    className="bg-white"
                                />
                                {passwordError && (
                                    <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                                )}
                            </div>

                            <div>
                                <Label>
                                    Confirm Password <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (confirmPasswordError) setConfirmPasswordError("");
                                    }}
                                    placeholder="Confirm your password"
                                    className="bg-white"
                                />
                                {confirmPasswordError && (
                                    <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
                                )}
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition"
                                >
                                    Sign up
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
