import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AvatarDropdown.css";
import ProfileModal from "../ProfileModal/ProfileModal";
import LogoutIcon from '@mui/icons-material/Logout';
import Person2Icon from '@mui/icons-material/Person2';

/**
 * AvatarDropdown
 * Drop-in replacement for the static topbar-avatar div.
 * Usage:
 *   <AvatarDropdown name="Bansari" email="bansari@example.com" />
 */
const AvatarDropdown = ({ name = "B", email = "bansari@example.com" }) => {
  const navigate = useNavigate();
  const [open,      setOpen]      = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="avatar-dropdown-wrap" ref={ref}>
        {/* Avatar button */}
        <button
          className={`topbar-avatar avatar-trigger ${open ? "open" : ""}`}
          onClick={() => setOpen(v => !v)}
          title="Account"
        >
          {name.charAt(0).toUpperCase()}
        </button>

        {/* Dropdown menu */}
        {open && (
          <div className="avatar-menu">
            <div className="avatar-menu-header">
              <div className="avatar-menu-avatar">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="avatar-menu-name">{name}</p>
                <p className="avatar-menu-role">AI Toolkit Hub</p>
              </div>
            </div>

            <div className="avatar-menu-divider" />

            {/* View Profile → opens modal, stays on current page */}
            <button
              className="avatar-menu-item"
              onClick={() => { setOpen(false); setModalOpen(true); }}
            >
              <Person2Icon className="avatar-menu-icon" style={{ fontSize: "1rem", color: "#fff" }} />
              {/* <span className="avatar-menu-icon">👤</span> */}
              View Profile
            </button>

            <div className="avatar-menu-divider" />

            <button className="avatar-menu-item avatar-menu-logout" onClick={handleLogout}>
              <LogoutIcon className="avatar-menu-icon" style={{ fontSize: "1rem", color: "#fc8181" }} />
                Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal — renders on top of current page, no navigation */}
      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        name={name}
        email={email}
      />
    </>
  );
};

export default AvatarDropdown;