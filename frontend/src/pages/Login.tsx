import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const roleToPath: Record<string, string> = {
  pm: "/pm",
  rfq: "/rfq",
  estimation: "/estimation",
  working: "/working",
  documentation: "/documentation",
  admin: "/admin",
  project_coordinator: "/project-coordinator",
  project_leader: "/project-leader",
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { makeApiCall, fetching, fetchType } = useAPICall();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both Email and Password.");
      return;
    }

    const response = await makeApiCall(
      "post",
      API_ENDPOINT.LOGIN,
      {
        email: email.trim(),
        password: password.trim(),
      },
      "application/json",
      undefined,
      "login"
    );

    if (response.status === 200) {
      const user = response.data.user;

      // Save auth
      login(user, response.data.token);

      // 🔥 ROLE BASED REDIRECT
      const redirectPath = roleToPath[user.role] || "/";
      navigate(redirectPath, { replace: true });

      toast.success("Login successful");
    } else {
      toast.error("Credentials invalid, try again");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      const response = await makeApiCall(
        "post",
        API_ENDPOINT.FORGOT_PASSWORD,
        { email },
        "application/json",
        undefined,
        "forgotPassword"
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Password reset link sent to your email");
      } else {
        toast.error("User does not exist or is inactive");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4" />

        <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <UserIcon
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={fetching}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={fetching}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={fetching && fetchType === "login"}
            disabled={fetching}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleForgotPassword}
            disabled={forgotPasswordLoading}
            className="text-blue-600 text-sm"
          >
            Forgot Password?
          </button>
          {fetching && fetchType === "forgotPassword" && (
            <Loader2 size={16} className="animate-spin inline ml-2" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
