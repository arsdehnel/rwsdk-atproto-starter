const SERIES = [
	{
		label: "Series 1",
		posts: [
			"Your First AT Protocol Read",
			"AT Protocol OAuth",
			"Local Development with Docker Compose",
			"Lexicons and Writing to Your PDS",
			"Reacting to Changes with Tap",
		],
	},
	{
		label: "Series 2",
		posts: [
			"Production OAuth",
			"D1 Persistence",
			"AppView Features",
			"Deploy Prep",
			"Next Steps",
		],
	},
];

interface SeriesListProps {
	currentSeries: number;
	currentStep: number;
}

export function PostProgress({ currentSeries, currentStep }: SeriesListProps) {
	return (
		<>
			{SERIES.map((series, si) => {
				const seriesNum = si + 1;
				return (
					<section key={seriesNum} className="seriesGroup">
						<h3 className="seriesGroupTitle">{series.label}</h3>
						<ol className="seriesList">
							{series.posts.map((title, pi) => {
								const postNum = pi + 1;
								const isPast =
									seriesNum < currentSeries ||
									(seriesNum === currentSeries && postNum < currentStep);
								const isCurrent =
									seriesNum === currentSeries && postNum === currentStep;

								const stateClass = isPast
									? "seriesItemPast"
									: isCurrent
										? "seriesItemCurrent"
										: "seriesItemFuture";

								return (
									<li
										key={postNum}
										className={`seriesItem ${stateClass}`}
										{...(isCurrent ? { "aria-current": "step" } : {})}
									>
										<span className="seriesItemEmoji" aria-hidden="true">
											{isPast ? "✅" : isCurrent ? "👉" : ""}
										</span>
										{isCurrent ? (
											<strong>{title}</strong>
										) : (
											<span>{title}</span>
										)}
									</li>
								);
							})}
						</ol>
					</section>
				);
			})}
			<p className="prose">
				The{" "}
				<a
					href="https://arsdehnel.github.io/rwsdk-atproto-starter/"
					target="_blank"
					rel="noreferrer"
					className="link"
				>
					series overview
				</a>{" "}
				ties all the posts and branches together if you want the full picture at
				once.
			</p>
		</>
	);
}
