import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login.tsx";
import Register from "./pages/register.tsx";
import Forgot from "./pages/forgot.tsx"; 
import Menu from "./pages/menu";
import Movies from "./pages/movies.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/movies" element={<Movies />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
