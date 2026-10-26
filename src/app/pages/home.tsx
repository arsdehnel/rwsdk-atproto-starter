import type { RequestInfo } from "rwsdk/worker";
import {
	BuildingContent,
	GoingDeeper,
	HeaderContent,
	HeaderNav,
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
					goingDeeperContent={<GoingDeeper {...postConfig.goingDeeper} />}
				/>
			</header>

			<main>
				<PostContent {...requestInfo} />
			</main>
		</div>
	);
}
