import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from "./AuthModal";

const Navbar = ({ isLoggedIn, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === "/seller-login";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = `navbar-settings ${isHomePage && !scrolled ? "is-transparent" : "is-scrolled"}`;

  const handleProfileClick = () => {
    if (isLoggedIn) {
      userRole === "seller" ? navigate("/seller-profile") : navigate("/profile");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className={navClass}>
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigate("/")}>
            🌿 Sav<span>ora</span>
          </div>

          <div className="nav-actions">
            <button className="nav-btn-auth" onClick={handleProfileClick}>
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