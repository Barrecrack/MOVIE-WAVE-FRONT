import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import Forgot from "./pages/forgot.tsx"; 
import Menu from "./pages/menu";
import Movies from "./pages/movies.tsx";
import About from "./pages/about.tsx";
import EditProfile from "./pages/editprofile.tsx";
import ResetPassword from "./pages/resetpassword.tsx";
import Sitemap from "./pages/sitemap.tsx";
import Favorite from "./pages/favorites.tsx";
import AuthGuard from "./components/AuthGuard.tsx";
import DeleteAccount from "./pages/deleteaccount.tsx";

/**
 * Application entry point.
 * 
 * - Uses React 18's createRoot API.
 * - Configures routes with React Router.
 * - Protects private routes with AuthGuard.
 */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/resetpassword" element={<ResetPassword />} />


        {/* Protected routes */}
        <Route path="/menu" element={<AuthGuard><DeleteAccount /></AuthGuard>} /> //nuevo apartado
        <Route path="/menu" element={<AuthGuard><Menu /></AuthGuard>} />
        <Route path="/movies" element={<AuthGuard><Movies /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><EditProfile /></AuthGuard>} />
        <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />
        <Route path="/sitemap" element={<AuthGuard><Sitemap /></AuthGuard>} />
        <Route path="/favorites" element={<AuthGuard><Favorite /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);