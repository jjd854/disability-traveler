import styles from './Card.module.css';

export function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

