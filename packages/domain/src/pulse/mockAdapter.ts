import type { PulseAdapter, PulseTurnInput, PulseTurnPlan } from "./types.js";
import type { PulseToolCall } from "./types.js";
import type { Catalog } from "../types.js";

function asCall(name: PulseToolCall["name"], args: Record<string, unknown> = {}): PulseToolCall {
  return { name, arguments: args };
}

function findBranch(catalog: Catalog | undefined, text: string) {
  if (!catalog) return undefined;
  const q = text.toLowerCase();
  return catalog.branches.find((branch) => q.includes(branch.name.toLowerCase()));
}

function findAchievement(catalog: Catalog | undefined, text: string) {
  if (!catalog) return undefined;
  const q = text.toLowerCase();
  return catalog.achievements.find((item) => q.includes(item.title.toLowerCase()));
}

/**
 * Deterministic local adapter. Parses intent into the same typed tools a
 * live model would call. Used when OPENAI_API_KEY is absent.
 */
export function createMockAdapter(catalog?: Catalog): PulseAdapter {
  return {
    name: "mock",
    async complete(input: PulseTurnInput): Promise<PulseTurnPlan> {
      const text = input.userText.trim();
      const lower = text.toLowerCase();
      const calls: PulseToolCall[] = [];

      if (/\bclaim\b/.test(lower) && !/why|explain|ready/.test(lower)) {
        const achievement = findAchievement(catalog, lower);
        calls.push(asCall("claim_achievement", { achievementId: achievement?.id ?? "" }));
        return { text: "Claim is a user action in Atlas. Checking the forbidden tool path.", toolCalls: calls };
      }

      if (/ready to claim|why (is|isn't|not)? ?(it|this)?.{0,20}eligible|explain.{0,20}claim/.test(lower)) {
        const achievement = findAchievement(catalog, lower);
        calls.push(asCall("explain_ready_to_claim", { achievementId: achievement?.id ?? "" }));
        return { text: "Checking Ready-to-Claim. Pulse cannot claim.", toolCalls: calls };
      }

      if (/^search\b|\bfind\b|\blook up\b/.test(lower)) {
        const query = text.replace(/^(search|find|look up)\s+/i, "").trim() || text;
        calls.push(asCall("search_project", { query }));
        return { text: `Searching the Project for “${query}”.`, toolCalls: calls };
      }

      if (/\bcompass\b|what next|recommend|what should i (do|work)/.test(lower)) {
        calls.push(asCall("get_compass"));
        return { text: "Asking Compass for a next useful direction.", toolCalls: calls };
      }

      if (/\bfocus\b|\bseason\b|\bdaily challenge/.test(lower) && /set|start|make|priorit/.test(lower)) {
        if (/\bseason\b/.test(lower)) {
          const branch = findBranch(catalog, lower);
          calls.push(
            asCall("set_season", {
              name: "Current Season",
              startsAt: new Date().toISOString(),
              endsAt: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString(),
              priorityBranchIds: branch ? [branch.id] : [],
              status: "active",
            }),
          );
          return { text: "Setting a Season.", toolCalls: calls };
        }
        const branch = findBranch(catalog, lower);
        calls.push(
          asCall("set_focus", {
            items: branch ? [{ kind: "branch", id: branch.id, load: "high" }] : [],
          }),
        );
        return { text: "Updating Focus.", toolCalls: calls };
      }

      if (/\bfocus\b|\bseason\b|attention budget|overload/.test(lower)) {
        calls.push(asCall("summarise_focus_season"));
        return { text: "Summarising Focus and Season.", toolCalls: calls };
      }

      if (/north star/.test(lower) && /create|add|set|new/.test(lower)) {
        const nameMatch = text.match(/north star(?: called| named)?\s+([^.,]+)/i);
        calls.push(
          asCall("create_north_star", {
            name: nameMatch?.[1]?.trim() || "Untitled North Star",
            targetValue: 1,
            currentValue: 0,
            unit: "units",
            type: "goal",
          }),
        );
        return { text: "Creating a North Star. Buying things will not grant XP.", toolCalls: calls };
      }

      if (/north star/.test(lower)) {
        calls.push(asCall("list_north_stars"));
        return { text: "Listing North Stars.", toolCalls: calls };
      }

      if (/collection|repertoire|song/.test(lower) && /add|create|save|learn/.test(lower)) {
        const branch = findBranch(catalog, lower);
        const titleMatch = text.match(/(?:add|save|learn)\s+(?:song\s+)?["“]?([^"”.,]+)["”]?/i);
        calls.push(
          asCall("create_collection_item", {
            branchId: branch?.id ?? "",
            title: titleMatch?.[1]?.trim() || text.slice(0, 80),
            state: "saved",
          }),
        );
        return { text: "Adding a Collection item.", toolCalls: calls };
      }

      if (/collection|repertoire/.test(lower)) {
        const branch = findBranch(catalog, lower);
        calls.push(asCall("list_collections", branch ? { branchId: branch.id } : {}));
        return { text: "Listing Collections.", toolCalls: calls };
      }

      if (/^log\b|log that|i (did|ran|practised|practiced|trained)/.test(lower)) {
        const achievement = findAchievement(catalog, lower);
        calls.push(asCall("log_activity", { body: text, achievementId: achievement?.id }));
        return { text: "Logging to the Ledger.", toolCalls: calls };
      }

      if (/open|go to|show|atlas|navigate/.test(lower)) {
        const branch = findBranch(catalog, lower);
        const achievement = findAchievement(catalog, lower);
        if (achievement) {
          calls.push(asCall("navigate_atlas", { view: "achievement", achievementId: achievement.id }));
        } else if (branch) {
          calls.push(asCall("navigate_atlas", { view: "branch", branchId: branch.id }));
        } else if (/compass/.test(lower)) {
          calls.push(asCall("navigate_atlas", { view: "compass" }));
        } else if (/north star/.test(lower)) {
          calls.push(asCall("navigate_atlas", { view: "north_stars" }));
        } else if (/search/.test(lower)) {
          calls.push(asCall("navigate_atlas", { view: "search", query: text }));
        } else {
          calls.push(asCall("navigate_atlas", { view: "atlas" }));
        }
        return { text: "Opening Atlas.", toolCalls: calls };
      }

      calls.push(asCall("get_compass"));
      calls.push(asCall("summarise_focus_season"));
      return {
        text: "I can search, log, navigate Atlas, manage Collections and North Stars, and summarise Focus/Season. Compass next.",
        toolCalls: calls,
      };
    },
  };
}
