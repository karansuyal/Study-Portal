import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const styles = {
    breadcrumb: {
      padding: '1rem 2rem',
      background: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    list: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    item: {
      color: '#6b7280',
      fontSize: '0.9rem'
    },
    link: {
      color: '#4f46e5',
      textDecoration: 'none'
    },
    separator: {
      margin: '0 0.3rem',
      color: '#9ca3af'
    }
  };

  return (
    <div style={styles.breadcrumb}>
      <div style={styles.container}>
        <ul style={styles.list}>
          <li style={styles.item}>
            <Link to="/" style={styles.link}>Home</Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            
            return (
              <li key={name} style={styles.item}>
                <span style={styles.separator}>/</span>
                {isLast ? (
                  <span style={{ textTransform: 'capitalize' }}>{name}</span>
                ) : (
                  <Link to={routeTo} style={styles.link}>
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default BreadcrumbNav;