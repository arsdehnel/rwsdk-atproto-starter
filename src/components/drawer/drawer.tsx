"use client";

import { useEffect, useRef } from "react";
import styles from "./drawer.module.css";

interface DrawerProps {
	id: string;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}

export function Drawer({ id, title, onClose, children }: DrawerProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	// Keep a ref so the effect doesn't re-run when onClose identity changes
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		dialog.showModal();

		const handleClose = () => onCloseRef.current();
		dialog.addEventListener("close", handleClose);
		return () => dialog.removeEventListener("close", handleClose);
	}, []);

	// Clicking the backdrop (the dialog element itself, not its children) closes.
	// onKeyDown pairs with onClick per accessibility requirements — Escape is the
	// keyboard equivalent, and is also handled natively by <dialog>, but we make
	// it explicit here so the two handlers are clearly a matched pair.
	const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
		if (e.target === dialogRef.current) {
			dialogRef.current?.close();
		}
	};

	const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
		if (e.key === "Escape") {
			dialogRef.current?.close();
		}
	};

	const titleId = `${id}-title`;

	return (
		<dialog
			ref={dialogRef}
			id={id}
			className={styles.drawer}
			aria-labelledby={titleId}
			aria-modal="true"
			onClick={handleDialogClick}
			onKeyDown={handleDialogKeyDown}
		>
			<div className={styles.drawerPanel}>
				<div className={styles.drawerHeader}>
					<h2 id={titleId} className={styles.drawerTitle}>
						{title}
					</h2>
					<button
						type="button"
						className={styles.drawerClose}
						onClick={() => dialogRef.current?.close()}
						aria-label="Close drawer"
					>
						✕
					</button>
				</div>
				<div className={styles.drawerContent}>{children}</div>
			</div>
		</dialog>
	);
}
