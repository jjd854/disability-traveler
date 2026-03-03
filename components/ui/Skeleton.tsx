import React from 'react';
import styles from './Skeleton.module.css';

type Props = { width?: number | string; height?: number | string; radius?: number | string; className?: string };

export default function Skeleton({ width='100%', height=16, radius=8, className }: Props) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
