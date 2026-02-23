import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroTag}>Authentic Italian</span>
            <h1 className={styles.heroTitle}>
              Experience the True
              <span className={styles.highlight}> Taste of Italy</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Handcrafted pizzas with the finest ingredients, delivered fresh to your doorstep.
              Every bite tells a story of tradition and passion.
            </p>
            <div className={styles.heroActions}>
              <button
                onClick={() => navigate('/menu')}
                className={styles.ctaPrimary}
              >
                Explore Our Menu
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signup')}
                  className={styles.ctaSecondary}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop"
              alt="Delicious Pizza"
              className={styles.pizzaImage}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🍕</div>
              <h3 className={styles.featureTitle}>Authentic Recipes</h3>
              <p className={styles.featureText}>
                Traditional Italian recipes passed down through generations
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🧀</div>
              <h3 className={styles.featureTitle}>Premium Ingredients</h3>
              <p className={styles.featureText}>
                Fresh, locally sourced toppings and imported Italian cheese
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚚</div>
              <h3 className={styles.featureTitle}>Fast Delivery</h3>
              <p className={styles.featureText}>
                Hot and fresh pizzas delivered right to your door
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Order?</h2>
          <p className={styles.ctaText}>
            Browse our menu and customize your perfect pizza today
          </p>
          <button
            onClick={() => navigate('/menu')}
            className={styles.ctaButton}
          >
            Order Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
