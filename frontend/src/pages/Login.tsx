import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const roleToPath: Record<string, string> = {
  pm: "/pm",
  rfc: "/rfq",
  estimation: "/estimation",
  working: "/worker",
  documentation: "/documentation",
  Admin: "/admin",
};

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { makeApiCall, fetching } = useAPICall();

  useEffect(() => {
    console.log(user);
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      toast.error("Please enter both Email and Password.");
      return;
    }
    const response = await makeApiCall("post", API_ENDPOINT.LOGIN, {
      email,
      password,
    });
    console.log(response);
    if (response.status == 200) {
      console.log(response.data, response.data);
      login(response.data.user, response.data.token);
      navigate("/");
    } else {
      toast.error("Credentials invalid, try again");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">OE</span>
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Oil Engineering ERP
          </span>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">
          Sign In
        </h2>
        <p className="text-slate-500 mb-6 text-center">
          Welcome back! Please login to your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                disabled={fetching}
                placeholder="Enter your Email"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={fetching}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
            disabled={fetching}
            loading={fetching}
          >
            Sign In
          </Button>
        </form>
        <div className="mt-6 text-center text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Oil Engineering ERP
        </div>
      </div>
    </div>
  );
};

export default Login;
