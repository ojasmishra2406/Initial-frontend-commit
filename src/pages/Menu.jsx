import { useState, useEffect } from 'react';
import * as menuService from '../services/menuService';
import MenuItem from '../components/MenuItem';
import styles from './Menu.module.css';

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await menuService.getAllMenuItems();
      setMenuItems(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (category) => {
    try {
      setLoading(true);
      setError('');
      setSelectedCategory(category);

      if (category === 'all') {
        const data = await menuService.getAllMenuItems();
        setMenuItems(data.data);
      } else {
        const data = await menuService.getMenuByCategory(category);
        setMenuItems(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'sides', label: 'Sides' },
  ];

  return (
    <div className={styles.menuPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Our Menu</h1>
          <p className={styles.subtitle}>Authentic Italian flavors, crafted with passion</p>
        </div>

        <div className={styles.categoryFilters}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => fetchByCategory(category.id)}
              className={`${styles.categoryButton} ${
                selectedCategory === category.id ? styles.active : ''
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            Loading delicious menu items...
          </div>
        ) : menuItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🍕</div>
            <p>No menu items available in this category.</p>
          </div>
        ) : (
          <div className={styles.menuGrid}>
            {menuItems.map((item) => (
              <MenuItem key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
