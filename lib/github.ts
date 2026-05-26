import { graphql } from "@octokit/graphql";
import type { TimelineItem } from "./types";

const GH_LOGIN = "lumanlanj";
const COMMITS_PER_REPO = 30;
const REPO_LIMIT = 20;
const LOOKBACK_DAYS = 90;

type Repo = {
  name: string;
  isFork: boolean;
  url: string;
  defaultBranchRef: {
    target: {
      history: {
        nodes: { committedDate: string; messageHeadline: string; oid: string }[];
      };
    } | null;
  } | null;
  releases: {
    nodes: {
      tagName: string;
      name: string | null;
      publishedAt: string | null;
      url: string;
    }[];
  };
  createdAt: string;
};

const QUERY = `
  query($login: String!, $repoLimit: Int!, $commitsPerRepo: Int!) {
    user(login: $login) {
      repositories(
        first: $repoLimit
        ownerAffiliations: OWNER
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          isFork
          url
          createdAt
          releases(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
            nodes { tagName name publishedAt url }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: $commitsPerRepo) {
                  nodes { committedDate messageHeadline oid }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHub(): Promise<TimelineItem[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("[github] GITHUB_TOKEN not set; skipping GitHub aggregation");
    return [];
  }

  try {
    const res = await graphql<{ user: { repositories: { nodes: Repo[] } } }>(QUERY, {
      login: GH_LOGIN,
      repoLimit: REPO_LIMIT,
      commitsPerRepo: COMMITS_PER_REPO,
      headers: { authorization: `bearer ${token}` },
    });

    const items: TimelineItem[] = [];
    const cutoff = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;

    for (const repo of res.user.repositories.nodes) {
      if (repo.isFork) continue;

      // New repo created within lookback window
      if (new Date(repo.createdAt).getTime() >= cutoff) {
        items.push({
          id: `github:repo:${repo.name}`,
          source: "github",
          type: "repo",
          title: `New repo: ${repo.name}`,
          url: repo.url,
          timestamp: new Date(repo.createdAt).toISOString(),
        });
      }

      // Releases
      for (const rel of repo.releases.nodes) {
        if (!rel.publishedAt) continue;
        if (new Date(rel.publishedAt).getTime() < cutoff) continue;
        items.push({
          id: `github:release:${repo.name}:${rel.tagName}`,
          source: "github",
          type: "release",
          title: `${repo.name} ${rel.name ?? rel.tagName}`,
          url: rel.url,
          timestamp: new Date(rel.publishedAt).toISOString(),
        });
      }

      // Commits — batch per repo per day
      const commits = repo.defaultBranchRef?.target?.history?.nodes ?? [];
      const byDay = new Map<string, { count: number; latest: string }>();
      for (const c of commits) {
        const ts = new Date(c.committedDate);
        if (ts.getTime() < cutoff) continue;
        const day = c.committedDate.slice(0, 10);
        const existing = byDay.get(day);
        if (!existing) {
          byDay.set(day, { count: 1, latest: c.committedDate });
        } else {
          existing.count += 1;
          if (c.committedDate > existing.latest) existing.latest = c.committedDate;
        }
      }
      for (const [day, { count, latest }] of byDay) {
        items.push({
          id: `github:commits:${repo.name}:${day}`,
          source: "github",
          type: "commit_batch",
          title:
            count === 1
              ? `1 commit to ${repo.name}`
              : `${count} commits to ${repo.name}`,
          url: `${repo.url}/commits/?since=${day}T00:00:00Z&until=${day}T23:59:59Z`,
          timestamp: new Date(latest).toISOString(),
          meta: { count, repo: repo.name },
        });
      }
    }

    return items;
  } catch (err) {
    console.error("[github] fetch failed:", (err as Error).message);
    return [];
  }
}
