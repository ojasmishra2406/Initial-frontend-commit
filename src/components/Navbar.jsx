import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🍕</span>
            Pizzeria
          </Link>
          
          <div className={styles.navLinks}>
            <Link to="/menu" className={styles.navLink}>
              Menu
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/cart" className={styles.cartLink}>
                  Cart
                  {getTotalItems() > 0 && (
                    <span className={styles.cartBadge}>
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className={styles.navLink}>
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={styles.navLink}>
                    Admin
                  </Link>
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
              <Link to="/login" className={`${styles.button} ${styles.loginButton}`}>
                Login
              </Link>
              <Link to="/signup" className={`${styles.button} ${styles.signupButton}`}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
