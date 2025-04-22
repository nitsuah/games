import React from "react";
import styles from "./Crosshair.module.css";

const Crosshair = () => (
  <div className={styles.crosshairWrapper}>
    <div className={styles.crosshairVertical}></div>
    <div className={styles.crosshairHorizontal}></div>
  </div>
);

export default Crosshair;
