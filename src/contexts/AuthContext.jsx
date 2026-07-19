// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token) {
      setIsAuthenticated(true);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const defaultUser = {
          id: 1,
          firstName: "Mohamed",
          lastName: "Amine",
          email: "admin@larte.com",
          phone: "0612345678",
          birthDate: "2000-01-01",
          gender: "Homme",
          nationality: "Marocaine",
          address: "Casablanca",
          city: "Casablanca",
          postalCode: "20000",
          employeeId: "EMP001",
          department: "Administration",
          position: "Administrator",
          hiringDate: "2025-01-01",
          manager: "Admin",
          company: "L'arte del dolce",
          office: "Casablanca",
          role: "Administrator",
          status: "online",
          avatar: null,
        };

        setUser(defaultUser);
        localStorage.setItem("user", JSON.stringify(defaultUser));
      }
    }

    setIsLoading(false);
  }, []);

  const login = (email) => {
    const loggedUser = {
      id: 1,
      firstName: "Mohamed",
      lastName: "Amine",
      email: email || "admin@larte.com",
      phone: "0612345678",
      birthDate: "2000-01-01",
      gender: "Homme",
      nationality: "Marocaine",
      address: "Casablanca",
      city: "Casablanca",
      postalCode: "20000",
      employeeId: "EMP001",
      department: "Administration",
      position: "Administrator",
      hiringDate: "2025-01-01",
      manager: "Admin",
      company: "L'arte del dolce",
      office: "Casablanca",
      role: "Administrator",
      status: "online",
      avatar: null,
    };

    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem("user", JSON.stringify(loggedUser));

    setIsAuthenticated(true);
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (newData) => {
    const updatedUser = {
      ...user,
      ...newData,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        setUser,
        updateUser,
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

export default AuthContext;