import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AuthGuard({ children }) {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);

    // Check for token in localStorage
    if (token) {
      // Optionally decode the token to check its validity
      try {
        const decodedToken = jwtDecode(token);
        // Check token expiration
        if (decodedToken.exp * 1000 > Date.now()) {
          console.log("Token is still valid");
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token");
      }
    }

    setIsLoading(false); // Set loading to false once token is validated
  }, []);

  // Show loading until authentication is checked
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authenticated, render children components
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to the login page
  return <Navigate replace to="/session/signin" state={{ from: pathname }} />;
}
