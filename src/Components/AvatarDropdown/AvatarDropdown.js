// src/Components/AvatarDropdown/AvatarDropdown.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AvatarDropdown.css";
import ProfileModal from "../ProfileModal/ProfileModal";
import LogoutIcon from "@mui/icons-material/Logout";
import Person2Icon from "@mui/icons-material/Person2";
import { getUser } from "../../utils/api";

/**
 * AvatarDropdown
 * Reads the logged-in user's name/email from localStorage/sessionStorage
 * so every page always reflects the real user without hardcoded props.
 *
 * Still accepts optional `name` / `email` props as overrides.
 */
const AvatarDropdown = ({ name: nameProp, email: emailProp }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef(null);

  // Resolve name & email: prop → stored user → fallback
  const user = getUser();
  const name = nameProp || user?.name || "U";
  const email = emailProp || user?.email || "";

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
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div className="avatar-dropdown-wrap" ref={ref}>
        <button
          className={`topbar-avatar avatar-trigger ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          title="Account"
        >
          {name.charAt(0).toUpperCase()}
        </button>

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

            <button
              className="avatar-menu-item"
              onClick={() => {
                setOpen(false);
                setModalOpen(true);
              }}
            >
              <Person2Icon
                className="avatar-menu-icon"
                style={{ fontSize: "1rem", color: "#fff" }}
              />
              View Profile
            </button>

            <div className="avatar-menu-divider" />

            <button
              className="avatar-menu-item avatar-menu-logout"
              onClick={handleLogout}
            >
              <LogoutIcon
                className="avatar-menu-icon"
                style={{ fontSize: "1rem", color: "#fc8181" }}
              />
              Sign Out
            </button>
          </div>
        )}
      </div>

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