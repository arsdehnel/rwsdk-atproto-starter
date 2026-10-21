import type { RequestInfo } from "rwsdk/worker";

import { BuildingContent } from "@/components/building-content/building-content";
import { HeaderContent } from "@/components/header-content/header-content";
import { HeaderNav } from "@/components/header-nav/header-nav";
import { RunItContent } from "@/components/run-it-content/run-it-content";
import { SeriesList } from "@/components/series-list/series-list";
import type { AppContext } from "@/worker";
import { postConfig } from "@/components/post-config/post-config";
import { PostContent } from "@/components/post-content/post-content";

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
