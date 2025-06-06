import { engineInstancePageHandler } from "../../_utils/getEngineInstancePageMeta";
import { EngineOverview } from "./overview/components/engine-overview";
import type { EngineInstancePageProps } from "./types";

export default async function Page(props: EngineInstancePageProps) {
  const params = await props.params;
  const { instance, authToken, client } = await engineInstancePageHandler({
    engineId: params.engineId,
    teamSlug: params.team_slug,
    projectSlug: params.project_slug,
  });

  return (
    <EngineOverview
      instance={instance}
      teamSlug={params.team_slug}
      projectSlug={params.project_slug}
      authToken={authToken}
      client={client}
    />
  );
}
