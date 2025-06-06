"use client";

import type { Project } from "@/api/projects";
import type { Team } from "@/api/team";
import { useDashboardRouter } from "@/lib/DashboardRouter";
import { CustomConnectWallet } from "@3rdweb-sdk/react/components/connect-wallet";
import type { Account } from "@3rdweb-sdk/react/hooks/useApi";
import { LazyCreateProjectDialog } from "components/settings/ApiKeys/Create/LazyCreateAPIKeyDialog";
import { useCallback, useState } from "react";
import type { ThirdwebClient } from "thirdweb";
import { useActiveWallet, useDisconnect } from "thirdweb/react";
import { doLogout } from "../../login/auth-actions";
import {
  getInboxNotifications,
  markNotificationAsRead,
} from "../../team/components/NotificationButton/fetch-notifications";
import {
  type AccountHeaderCompProps,
  AccountHeaderDesktopUI,
  AccountHeaderMobileUI,
} from "./AccountHeaderUI";

export function AccountHeader(props: {
  teamsAndProjects: Array<{ team: Team; projects: Project[] }>;
  account: Account;
  client: ThirdwebClient;
  accountAddress: string;
}) {
  const router = useDashboardRouter();
  const [createProjectDialogState, setCreateProjectDialogState] = useState<
    { team: Team; isOpen: true } | { isOpen: false }
  >({ isOpen: false });

  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const logout = useCallback(async () => {
    try {
      await doLogout();
      if (wallet) {
        disconnect(wallet);
      }
      router.refresh();
    } catch (e) {
      console.error("Failed to log out", e);
    }
  }, [router, disconnect, wallet]);

  const headerProps: AccountHeaderCompProps = {
    teamsAndProjects: props.teamsAndProjects,
    logout: logout,
    connectButton: (
      <CustomConnectWallet isLoggedIn={true} client={props.client} />
    ),
    createProject: (team: Team) =>
      setCreateProjectDialogState({
        team,
        isOpen: true,
      }),
    account: props.account,
    client: props.client,
    accountAddress: props.accountAddress,
    getInboxNotifications: getInboxNotifications,
    markNotificationAsRead: markNotificationAsRead,
  };

  return (
    <div>
      <AccountHeaderDesktopUI {...headerProps} className="max-lg:hidden" />
      <AccountHeaderMobileUI {...headerProps} className="lg:hidden" />

      {createProjectDialogState.isOpen && (
        <LazyCreateProjectDialog
          open={true}
          onOpenChange={() =>
            setCreateProjectDialogState({
              isOpen: false,
            })
          }
          onCreateAndComplete={() => {
            // refresh projects
            router.refresh();
          }}
          teamId={createProjectDialogState.team.id}
          teamSlug={createProjectDialogState.team.slug}
          enableNebulaServiceByDefault={
            createProjectDialogState.isOpen &&
            createProjectDialogState.team.enabledScopes.includes("nebula")
          }
        />
      )}
    </div>
  );
}
