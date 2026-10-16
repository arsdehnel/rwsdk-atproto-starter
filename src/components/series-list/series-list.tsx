const STEPS = [
	"Your First AT Protocol Read",
	"AT Protocol OAuth with rwsdk and Cloudflare Workers",
	"Local Development with Docker Compose",
	"Lexicons and Writing to Your PDS",
	"Reacting to Changes with Tap and Jetstream",
	"Persistence with D1 and Drizzle",
	"Building a Feed — You're an AppView Now",
	"Where to Go From Here",
];

interface SeriesListProps {
	currentStep: number;
}

export function SeriesList({ currentStep }: SeriesListProps) {
	return (
		<>
			<ol className="seriesList">
				{STEPS.map((title, i) => {
					const stepNum = i + 1;
					const isPast = stepNum < currentStep;
					const isCurrent = stepNum === currentStep;

					const stateClass = isPast
						? "seriesItemPast"
						: isCurrent
							? "seriesItemCurrent"
							: "seriesItemFuture";

					return (
						<li
							key={stepNum}
							className={`seriesItem ${stateClass}`}
							{...(isCurrent ? { "aria-current": "step" } : {})}
						>
							<span className="seriesItemEmoji" aria-hidden="true">
								{isPast ? "✅" : isCurrent ? "👉" : ""}
							</span>
							{isCurrent ? <strong>{title}</strong> : <span>{title}</span>}
						</li>
					);
				})}
			</ol>
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
				ties all the posts and branches together so that might help give the
				full context all at once.
			</p>
		</>
	);
}
