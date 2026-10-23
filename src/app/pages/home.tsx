import type { RequestInfo } from "rwsdk/worker";
import {
	BuildingContent,
	HeaderContent,
	HeaderNav,
	RunItContent,
	SeriesList,
} from "@/app/components";
import { PostContent, postConfig } from "@/app/content";
import type { AppContext } from "@/worker";

export async function Home(requestInfo: RequestInfo<AppContext>) {
	return (
		<div className="container">
			<header className="header">
				<HeaderContent />
				<HeaderNav
					buildingContent={
						<BuildingContent
							currentStep={postConfig.step}
							postUrl={postConfig.postUrl}
						/>
					}
					seriesContent={<SeriesList currentStep={postConfig.step} />}
					runItContent={
						<RunItContent
							commandLines={postConfig.commandLines}
							explanation={postConfig.explanation}
						/>
					}
				/>
			</header>

			<main>
				<PostContent {...requestInfo} />
			</main>
		</div>
	);
}
