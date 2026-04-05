import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "./AuthModal";

const Navbar = ({ isLoggedIn, userRole, user, onLogout, onLoginSuccess }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled]               = useState(false);

  const isTransparentPage =
    location.pathname === "/" || location.pathname === "/seller-login";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = `navbar-settings ${
    isTransparentPage && !scrolled ? "is-transparent" : "is-scrolled"
  }`;

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    userRole === "seller" ? navigate("/seller-page") : navigate("/profile");
  };

  const handleLogoClick = () => {
    if (!isLoggedIn) { navigate("/"); return; }
    userRole === "seller" ? navigate("/seller-home") : navigate("/home");
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <>
      <nav className={navClass}>
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-brand" onClick={handleLogoClick}>
            🌿 Sav<span>ora</span>
          </div>

          {/* Sağ Alan */}
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                {/* Kullanıcı adı / profil butonu */}
                <button className="nav-btn-auth" onClick={handleProfileClick}>
                  {userRole === "seller"
                    ? (user?.restaurantName || "Panel")
                    : (user?.name?.split(" ")[0] || "Profil")}
                </button>

                {/* Çıkış butonu */}
                <button
                  className="nav-btn-logout"
                  onClick={handleLogout}
                  title="Çıkış Yap"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <button className="nav-btn-auth" onClick={() => setIsAuthModalOpen(true)}>
                Giriş / Kayıt
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Navbar'dan açılan Auth Modal — sadece kullanıcı girişi için */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab="login"
        onLoginSuccess={onLoginSuccess}
      />
    </>
  );
};

export default Navbar;