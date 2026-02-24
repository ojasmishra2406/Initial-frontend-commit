import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const closeDrawer = () => setDrawerOpen(false);

  const cartCount = getTotalItems();

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <Link to="/" className={styles.logo} onClick={closeDrawer}>
              <span className={styles.logoIcon}>🍕</span>
              Pizzeria
            </Link>

            <div className={styles.navLinks}>
              <Link to="/menu" className={styles.navLink}>Menu</Link>
              {isAuthenticated && (
                <>
                  <Link to="/cart" className={styles.cartLink}>
                    Cart
                    {cartCount > 0 && (
                      <span className={styles.cartBadge}>{cartCount}</span>
                    )}
                  </Link>
                  <Link to="/orders" className={styles.navLink}>Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className={styles.navLink}>Admin</Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.rightSection}>
            {isAuthenticated ? (
              <>
                <span className={styles.welcomeText}>Welcome, {user?.name}</span>
                <button onClick={handleLogout} className={`${styles.button} ${styles.logoutButton}`}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`${styles.button} ${styles.loginButton}`}>Login</Link>
                <Link to="/signup" className={`${styles.button} ${styles.signupButton}`}>Sign Up</Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className={styles.mobileMenuButton}
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {drawerOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div className={styles.drawerBackdrop} onClick={closeDrawer} />
      )}

      {/* Mobile slide-in drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>🍕 Pizzeria</span>
          <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
        </div>

        <nav className={styles.drawerNav}>
          <Link to="/menu" className={styles.drawerLink} onClick={closeDrawer}>🍕 Menu</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className={styles.drawerLink} onClick={closeDrawer}>
                🛒 Cart
                {cartCount > 0 && (
                  <span className={styles.drawerBadge}>{cartCount}</span>
                )}
              </Link>
              <Link to="/orders" className={styles.drawerLink} onClick={closeDrawer}>📦 Orders</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={styles.drawerLink} onClick={closeDrawer}>⚙️ Admin</Link>
              )}
              <div className={styles.drawerDivider} />
              <div className={styles.drawerUser}>Signed in as<br /><strong>{user?.name}</strong></div>
              <button className={styles.drawerLogout} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.drawerLink} onClick={closeDrawer}>Login</Link>
              <Link to="/signup" className={styles.drawerLink} onClick={closeDrawer}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>

      {/* Floating cart button — mobile only, only when authenticated & cart has items */}
      {isAuthenticated && cartCount > 0 && location.pathname !== '/cart' && (
        <Link to="/cart" className={styles.cartFab}>
          🛒
          <span className={styles.cartFabBadge}>{cartCount}</span>
        </Link>
      )}
    </>
  );
}

export default Navbar;
