import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import logo from '../../../public/logo.png';
import user from '../../../public/user.png';

export default function Header() {
    return (
        <header className={styles.header}>
            
            <div className={styles.logoContainer}>
                <Link href="/">
                    <Image src={logo} alt="Project Logo" width={150} height={150} />
                </Link>
            </div>

            <nav className={styles.nav}>
                
                <Link href="/home" className={styles.link}>home</Link> 
                <Link href="/about" className={styles.link}>About</Link>
                <Link href="/mycloset" className={styles.link}>My Closet</Link>
                <Link href="/newcloth" className={styles.link}>New Cloth</Link>
                <Link href="/mylooks" className={styles.link}>My Looks</Link>
                <Link href="/stylefeed" className={styles.link}>Style Feed</Link>
            </nav>
            
            <button className={styles.userButton}>
                <Image 
                    src={user} 
                    alt="User Icon" 
                    width={70} 
                    height={70}
                />
            </button>

        </header>
    );
}