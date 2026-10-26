import type { RequestInfo } from "rwsdk/worker";
import {
	BuildingContent,
	GoingDeeper,
	HeaderContent,
	HeaderNav,
	PostProgress,
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
							currentSeries={postConfig.series}
							currentPost={postConfig.post}
							postUrl={`https://arsdehnel.com/posts/rwsdk-atp-s${postConfig.series}-p${postConfig.post}-${postConfig.slug}`}
						/>
					}
					seriesContent={
						<PostProgress
							currentSeries={postConfig.series}
							currentPost={postConfig.post}
						/>
					}
					goingDeeperContent={<GoingDeeper {...postConfig.goingDeeper} />}
				/>
			</header>

			<main>
				<PostContent {...requestInfo} />
			</main>
		</div>
	);
}
