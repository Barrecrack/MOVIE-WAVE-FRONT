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
import Favorite from "./pages/favorite.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/favorite" element={<Favorite />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
