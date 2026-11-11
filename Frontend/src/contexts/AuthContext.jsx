import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("gplx_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("gplx_token") || null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi ứng dụng khởi chạy
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("gplx_token");
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem("gplx_user", JSON.stringify(res.user));
        } catch (error) {
          console.warn("Phiên đăng nhập không hợp lệ, đang xóa token");
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Hàm đăng nhập bằng username hoặc email
  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("gplx_token", data.token);
    localStorage.setItem("gplx_user", JSON.stringify(data.user));
    return data;
  };

  // Hàm đăng xuất
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("gplx_token");
    localStorage.removeItem("gplx_user");
  };

  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
