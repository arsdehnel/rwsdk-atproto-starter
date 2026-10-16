"use client";

import styles from "./header-nav.module.css";

export function HeaderNav(): React.ReactNode {
	return (
		<nav className={styles.headerNav}>
			<button
				className={styles.headerNavButton}
				type="button"
				onClick={() => console.log("Open building drawer")}
			>
				What you're building
			</button>
			<button
				className={styles.headerNavButton}
				type="button"
				onClick={() => console.log("Open series drawer")}
			>
				The series
			</button>
			<button
				className={styles.headerNavButton}
				type="button"
				onClick={() => console.log("Open run-it drawer")}
			>
				Run it yourself
			</button>
		</nav>
	);
}
