"use client";

import { useState } from "react";
import { Drawer } from "@/app/components";
import styles from "./header-nav.module.css";

type DrawerId = "building" | "series" | "going-deeper";

const DRAWERS: Array<{ id: DrawerId; label: string }> = [
	{ id: "building", label: "What you're building" },
	{ id: "series", label: "The progression" },
	{ id: "going-deeper", label: "Going deeper" },
];

interface HeaderNavProps {
	buildingContent: React.ReactNode;
	seriesContent: React.ReactNode;
	goingDeeperContent: React.ReactNode;
}

export function HeaderNav({
	buildingContent,
	seriesContent,
	goingDeeperContent,
}: HeaderNavProps) {
	const [activeDrawer, setActiveDrawer] = useState<DrawerId | null>(null);

	const contentMap: Record<DrawerId, React.ReactNode> = {
		building: buildingContent,
		series: seriesContent,
		"going-deeper": goingDeeperContent,
	};

	const activeConfig = DRAWERS.find((d) => d.id === activeDrawer);

	return (
		<>
			<nav className={styles.headerNav} aria-label="Page info">
				{DRAWERS.map(({ id, label }) => (
					<button
						key={id}
						className={styles.headerNavButton}
						type="button"
						aria-haspopup="dialog"
						onClick={() => setActiveDrawer(id)}
					>
						{label}
					</button>
				))}
			</nav>
			{activeDrawer && activeConfig && (
				<Drawer
					id={`drawer-${activeDrawer}`}
					title={activeConfig.label}
					onClose={() => setActiveDrawer(null)}
				>
					{contentMap[activeDrawer]}
				</Drawer>
			)}
		</>
	);
}
