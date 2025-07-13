import { createContext, useContext, useState, useEffect } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState();
  const [location, setLocation] = useState("GATE");

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      authenticate(savedToken);
    }
  }, []);

  // TODO: signup
  async function signup(name) {
    try {
      const response = await fetch(API + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          password: "password",
        }),
      });
      const result = await response.json();
      setToken(result.token);
      sessionStorage.setItem("token", result.token);
      setLocation("TABLET");
      return result.token;
    } catch (e) {
      console.error("oh no ;(");
    }
  }

  // TODO: authenticate
  async function authenticate(token) {
    try {
      const response = await fetch(API + "/authenticate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setLocation("TUNNEL");
    } catch (e) {
      console.error(e);
    }
  }

  async function verify(name) {
    try {
      const newToken = await signup(name);
      if (newToken) {
        const authResult = await authenticate(newToken);
        return authResult;
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  const value = { location, signup, token, authenticate };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
