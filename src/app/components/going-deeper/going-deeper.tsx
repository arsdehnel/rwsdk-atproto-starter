import type { GoingDeeperContent } from "@/app/content/config";

export function GoingDeeper({ links, explanation }: GoingDeeperContent) {
	return (
		<>
			{explanation}
			<ul className="featureList">
				{links.map(({ url, label, note }) => (
					<li key={url}>
						<a href={url} className="link" target="_blank" rel="noreferrer">
							{label}
						</a>
						{note && <span className="prose"> — {note}</span>}
					</li>
				))}
			</ul>
		</>
	);
}
