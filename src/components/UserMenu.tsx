import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaChartLine, FaSignInAlt, FaGoogle, FaMicrosoft, FaGithub, FaShieldAlt, FaFileContract, FaGlobe } from 'react-icons/fa';
import { supabase, signOutUser, isSafeHttpsUrl, consumeGoogleIdTokenFromHash } from '../services/supabaseClient';
import { ProgressService } from '../services/progressService';
import AuthModal from './AuthModal';
import ProgressModal from './ProgressModal';

interface UserMenuProps {
  onNavigate?: (section: string) => void;
  initialUser?: any;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigate, initialUser = null }) => {
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    // Exchange any direct Google OIDC ID token in the URL hash before checking the session
    (typeof consumeGoogleIdTokenFromHash === 'function'
      ? consumeGoogleIdTokenFromHash()
      : Promise.resolve()
    ).finally(() => {
      supabase!.auth.getUser().then(({ data: { user } }) => {
        setCurrentUser(user);
        if (user) {
          ProgressService.syncGuestDataToCloud();
        }
      });
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        ProgressService.syncGuestDataToCloud();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus first menuitem when menu opens and handle Escape / Arrow keys
  useEffect(() => {
    if (!menuOpen) return;

    const getMenuItems = (): HTMLElement[] =>
      menuRef.current
        ? Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        : [];

    const items = getMenuItems();
    if (items.length > 0) {
      items[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        const menuItems = getMenuItems();
        if (menuItems.length === 0) return;
        e.preventDefault();
        const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
        let nextIndex = 0;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex >= 0 ? (currentIndex + 1) % menuItems.length : 0;
        } else if (e.key === 'ArrowUp') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = menuItems.length - 1;
        }

        menuItems[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setMenuOpen(true);
    }
  };

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    await signOutUser();
    setCurrentUser(null);
  };

  const provider = currentUser?.app_metadata?.provider;
  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const avatarUrl = isSafeHttpsUrl(currentUser?.user_metadata?.avatar_url)
    ? currentUser.user_metadata.avatar_url
    : null;

  return (
    <div className="user-menu-wrapper" ref={dropdownRef}>
      {currentUser ? (
        // Logged-in state: trigger and dropdown are siblings, preventing bubbling bugs
        <>
          <button 
            ref={triggerRef}
            type="button"
            className="user-profile-trigger" 
            onClick={() => setMenuOpen((prev) => !prev)}
            onKeyDown={handleTriggerKeyDown}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`User menu for ${displayName}`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="user-avatar-img"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div className="user-avatar-placeholder" aria-hidden="true">
                <FaUser aria-hidden="true" />
              </div>
            )}
            <span className="user-display-name">{displayName}</span>
          </button>

          {menuOpen && (
            <div 
              ref={menuRef}
              className="user-dropdown-menu" 
              role="menu"
              aria-label="User account menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-dropdown-header" role="presentation">
                <p className="dropdown-name">{displayName}</p>
                <p className="dropdown-email">{currentUser.email}</p>
                <span className="provider-badge">
                  {provider === 'azure' ? (
                    <>
                      <FaMicrosoft aria-hidden="true" /> Microsoft Entra ID
                    </>
                  ) : provider === 'github' ? (
                    <>
                      <FaGithub aria-hidden="true" /> GitHub
                    </>
                  ) : (
                    <>
                      <FaGoogle aria-hidden="true" /> Google
                    </>
                  )}
                </span>
              </div>

              <div className="dropdown-divider" role="separator"></div>

              <button
                type="button"
                role="menuitem"
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setProgressModalOpen(true);
                }}
              >
                <FaChartLine aria-hidden="true" />
                <span>My Progress & Stats</span>
              </button>

              <a
                href="https://basiclanguage.school"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <FaGlobe aria-hidden="true" />
                <span>15+ Languages Hub</span>
              </a>

              <a
                href="https://github.com/JohnBendfeldt/basic-english"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <FaGithub aria-hidden="true" />
                <span>GitHub Repository</span>
              </a>

              {onNavigate && (
                <>
                  <div className="dropdown-divider" role="separator"></div>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item legal-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onNavigate('privacy');
                    }}
                  >
                    <FaShieldAlt aria-hidden="true" />
                    <span>Privacy Policy</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="dropdown-item legal-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onNavigate('terms');
                    }}
                  >
                    <FaFileContract aria-hidden="true" />
                    <span>Terms of Service</span>
                  </button>
                </>
              )}

              <div className="dropdown-divider" role="separator"></div>

              <button
                type="button"
                role="menuitem"
                className="dropdown-item signout-btn"
                onClick={handleSignOut}
              >
                <FaSignOutAlt aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </>
      ) : (
        // Guest state
        <div className="guest-action-buttons">
          <button
            type="button"
            className="header-action-btn progress-btn"
            onClick={() => setProgressModalOpen(true)}
            title="View learning stats"
            aria-label="My Stats — View learning progress"
          >
            <FaChartLine aria-hidden="true" />
            <span className="btn-text">My Stats</span>
          </button>

          <button
            type="button"
            className="header-action-btn signin-btn"
            onClick={() => setAuthModalOpen(true)}
            title="Sign in to sync progress"
            aria-label="Sign in to sync progress"
          >
            <FaSignInAlt aria-hidden="true" />
            <span className="btn-text">Sign In</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        userEmail={currentUser?.email}
      />
    </div>
  );
};

export default UserMenu;
