"use client";
import Image from "next/image";

import styles from "./Welcome.module.css";
import logo from '../../public/logo.png';

export default function Welcome() {

    return (
        <div className={styles.welcome}>
            <div className={styles.Container}>

            <Image className={styles.logo} src={logo} alt="Project Logo" width={550} height={550} />
            <h1 className={styles.title}>Dress. Style. Shine.</h1>
            <p className={styles.subtitle}>Discover your perfect look with SnapFit </p>
            <p className={styles.subtitle}>- where fashion meets technology!</p>
            <div className={styles.buttonContainer}>
                <button className={styles.button}>Join Us</button>
                <button className={styles.button}>Member Login</button>
            </div>
            </div>
        </div>
    );
}
