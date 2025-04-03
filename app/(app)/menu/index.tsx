import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // Asegúrate de que este archivo esté configurado correctamente
import React from 'react';

export default function Page() {
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    async function getMenuItems() {
      const { data: menu, error } = await supabase.from('menu-images').select('*'); // Cambia 'menu' por el nombre de tu tabla en Supabase

      if (error) {
        console.error('Error fetching menu items:', error);
      } else if (menu) {
        setMenuItems(menu);
      }
    }

    getMenuItems();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title as React.CSSProperties}>Menu</h1>
      <div style={styles.menuGrid}>
        {menuItems.map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.image_url} alt={item.name} style={styles.image} />
            <h2 style={styles.itemName}>{item.name}</h2>
            <p style={styles.price}>${item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f8f8',
    minHeight: '100vh',
  },
  title: {
    textAlign: 'center' as React.CSSProperties['textAlign'],
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    textAlign: 'center' as React.CSSProperties['textAlign'],
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover' as React.CSSProperties['objectFit'],
    borderRadius: '8px',
  },
  itemName: {
    fontSize: '1.2rem',
    color: '#333',
    margin: '10px 0',
  },
  price: {
    fontSize: '1rem',
    color: '#ff6b00',
    fontWeight: 'bold',
  },
};