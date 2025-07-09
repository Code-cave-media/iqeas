import Loading from "@/components/atomic/Loading";
import { IUser } from "@/types/apiTypes";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;

  logout: () => void;
  authToken: string | null;
  user: IUser;
  login: (user: IUser, token?: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isCheckedUser: boolean;
  setIsCheckedUser: (isCheckedUser: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckedToken, setIsCheckedToken] = useState(false);
  const [isCheckedUser, setIsCheckedUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
    }
    setIsCheckedToken(true);
  }, []);
  const login = (user: IUser, token?: string) => {
    setUser(user);
    setAuthToken(token);
    localStorage.setItem("auth_token", token);
    console.log("saving");
  };
  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setAuthToken(null)
  };

  if (!isCheckedToken) {
    return <Loading full />;
  }
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,

        logout,
        authToken,
        user,
        login,
        loading,
        setLoading,
        isCheckedUser,
        setIsCheckedUser,
      }}
    >
      {loading && (
        <div className="fixed w-full h-full inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <Loading />
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
