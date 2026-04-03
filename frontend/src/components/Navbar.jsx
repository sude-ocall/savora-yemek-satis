import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from "./AuthModal";

const Navbar = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sadece ana sayfada (/) şeffaf olmasını istiyorsan bu kontrolü ekledim
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dinamik sınıf yapısı
  const navClass = `navbar-settings ${isHomePage && !scrolled ? "is-transparent" : "is-scrolled"}`;

  return (
    <>
      <nav className={navClass}>
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate("/")}>
            🌿 Sav<span>ora</span>
          </div>

          <div className="nav-actions">
            <button 
              className="nav-btn-auth" 
              onClick={() => isLoggedIn ? navigate("/profile") : setIsAuthModalOpen(true)}
            >
              {isLoggedIn ? "Profil" : "Giriş / Kayıt"}
            </button>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;