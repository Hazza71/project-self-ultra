/**
 * Pulse typed tool contracts.
 * Critical rules (claim, XP, eligibility) stay in @psx/domain — never in an LLM.
 * There is no allowed Claim tool. `claim_achievement` is listed only so a
 * hallucinated/malicious call is rejected by code.
 */

export const PULSE_TOOL_NAMES = [
  "navigate_atlas",
  "search_project",
  "log_activity",
  "explain_ready_to_claim",
  "get_achievement_status",
  "list_collections",
  "create_collection_item",
  "update_collection_item",
  "list_north_stars",
  "create_north_star",
  "update_north_star",
  "record_north_star_progress",
  "summarise_focus_season",
  "set_focus",
  "set_season",
  "get_compass",
  "claim_achievement",
] as const;

export type PulseToolName = (typeof PULSE_TOOL_NAMES)[number];

export const FORBIDDEN_PULSE_TOOLS = ["claim_achievement"] as const;

export interface PulseToolParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required?: boolean;
  items?: { type: string };
}

export interface PulseToolDefinition {
  name: PulseToolName;
  description: string;
  mutates: boolean;
  allowed: boolean;
  parameters: Record<string, PulseToolParameter>;
}

export const PULSE_TOOLS: PulseToolDefinition[] = [
  {
    name: "navigate_atlas",
    description: "Open Atlas at a tree, category, branch, achievement, or named view.",
    mutates: false,
    allowed: true,
    parameters: {
      view: { type: "string", description: "atlas | search | compass | north_stars | focus | branch | achievement" },
      treeId: { type: "string", description: "Tree id" },
      categoryId: { type: "string", description: "Category id" },
      branchId: { type: "string", description: "Branch id" },
      achievementId: { type: "string", description: "Achievement id" },
      query: { type: "string", description: "Optional search query" },
    },
  },
  {
    name: "search_project",
    description: "Search trees, branches, and achievements.",
    mutates: false,
    allowed: true,
    parameters: {
      query: { type: "string", description: "Search text", required: true },
      treeId: { type: "string", description: "Optional tree filter" },
    },
  },
  {
    name: "log_activity",
    description: "Write a manual Ledger log and optional evidence. Never claims.",
    mutates: true,
    allowed: true,
    parameters: {
      body: { type: "string", description: "What happened", required: true },
      achievementId: { type: "string", description: "Optional achievement to attach evidence to" },
    },
  },
  {
    name: "explain_ready_to_claim",
    description: "Explain why an achievement is or is not Ready to Claim. Pulse cannot claim.",
    mutates: false,
    allowed: true,
    parameters: {
      achievementId: { type: "string", description: "Achievement id", required: true },
    },
  },
  {
    name: "get_achievement_status",
    description: "Return state, reps, and eligibility for an achievement.",
    mutates: false,
    allowed: true,
    parameters: {
      achievementId: { type: "string", description: "Achievement id", required: true },
    },
  },
  {
    name: "list_collections",
    description: "List collection items, optionally for one Branch.",
    mutates: false,
    allowed: true,
    parameters: {
      branchId: { type: "string", description: "Optional branch id" },
    },
  },
  {
    name: "create_collection_item",
    description: "Add a Collection item on a Branch. Collections are not Achievements.",
    mutates: true,
    allowed: true,
    parameters: {
      branchId: { type: "string", description: "Branch id", required: true },
      title: { type: "string", description: "Item title", required: true },
      state: { type: "string", description: "saved|planned|active|competent|completed|archived" },
      notes: { type: "string", description: "Notes" },
      difficulty: { type: "string", description: "e.g. easy, moderate, high" },
      arrangement: { type: "string", description: "Repertoire arrangement/version" },
      tempoBpm: { type: "number", description: "Repertoire tempo" },
      fromMemory: { type: "boolean", description: "Played from memory" },
    },
  },
  {
    name: "update_collection_item",
    description: "Update a Collection item's fields or state.",
    mutates: true,
    allowed: true,
    parameters: {
      id: { type: "string", description: "Collection item id", required: true },
      state: { type: "string", description: "New universal state" },
      title: { type: "string", description: "Title" },
      notes: { type: "string", description: "Notes" },
      difficulty: { type: "string", description: "Difficulty" },
      arrangement: { type: "string", description: "Repertoire arrangement" },
      section: { type: "string", description: "Repertoire section" },
      tempoBpm: { type: "number", description: "BPM" },
      fromMemory: { type: "boolean", description: "From memory" },
    },
  },
  {
    name: "list_north_stars",
    description: "List North Stars.",
    mutates: false,
    allowed: true,
    parameters: {},
  },
  {
    name: "create_north_star",
    description: "Create a concrete North Star target. Spending does not grant XP.",
    mutates: true,
    allowed: true,
    parameters: {
      name: { type: "string", description: "Name", required: true },
      type: { type: "string", description: "e.g. bodyweight, savings, race" },
      currentValue: { type: "number", description: "Current value" },
      targetValue: { type: "number", description: "Target value", required: true },
      unit: { type: "string", description: "Unit" },
      deadline: { type: "string", description: "Optional ISO deadline" },
      reason: { type: "string", description: "Why it matters" },
      linkedBranchIds: { type: "array", description: "Linked branch ids", items: { type: "string" } },
    },
  },
  {
    name: "update_north_star",
    description: "Update North Star fields or lifecycle.",
    mutates: true,
    allowed: true,
    parameters: {
      id: { type: "string", description: "North Star id", required: true },
      status: { type: "string", description: "planned|active|paused|completed|archived" },
      currentValue: { type: "number", description: "Current value" },
      targetValue: { type: "number", description: "Target value" },
      deadline: { type: "string", description: "Deadline" },
      reason: { type: "string", description: "Reason" },
    },
  },
  {
    name: "record_north_star_progress",
    description: "Record a progress point. source=spend never grants XP.",
    mutates: true,
    allowed: true,
    parameters: {
      id: { type: "string", description: "North Star id", required: true },
      value: { type: "number", description: "New current value", required: true },
      note: { type: "string", description: "Note" },
      source: { type: "string", description: "manual | spend | pulse | system" },
    },
  },
  {
    name: "summarise_focus_season",
    description: "Summarise current Focus, Season, daily challenges, and Attention Budget.",
    mutates: false,
    allowed: true,
    parameters: {},
  },
  {
    name: "set_focus",
    description: "Replace the small Focus set. Non-focus skills stay loggable.",
    mutates: true,
    allowed: true,
    parameters: {
      items: {
        type: "array",
        description: "Focus items [{kind,id,note?,load?}]",
        required: true,
        items: { type: "object" },
      },
    },
  },
  {
    name: "set_season",
    description: "Create or update a 6–12 week Season with typically 2–4 priorities. No Season-completion XP.",
    mutates: true,
    allowed: true,
    parameters: {
      id: { type: "string", description: "Existing season id to update" },
      name: { type: "string", description: "Season name" },
      startsAt: { type: "string", description: "ISO start" },
      endsAt: { type: "string", description: "ISO end (6–12 weeks later)" },
      priorityBranchIds: { type: "array", description: "Priority branch ids", items: { type: "string" } },
      status: { type: "string", description: "planned|active|completed|archived" },
      reviewIntention: { type: "string", description: "On complete: original intention" },
      reviewActual: { type: "string", description: "On complete: what actually happened" },
    },
  },
  {
    name: "get_compass",
    description: "Recommend the next useful direction from progress + Focus/Season.",
    mutates: false,
    allowed: true,
    parameters: {},
  },
  {
    name: "claim_achievement",
    description: "FORBIDDEN. Achievements are never auto-claimed. Only an explicit Atlas/manual Claim by the user.",
    mutates: true,
    allowed: false,
    parameters: {
      achievementId: { type: "string", description: "Ignored — claim is always rejected" },
    },
  },
];

export const ALLOWED_PULSE_TOOLS = PULSE_TOOLS.filter((tool) => tool.allowed);

export function pulseToolByName(name: string): PulseToolDefinition | undefined {
  return PULSE_TOOLS.find((tool) => tool.name === name);
}

export function isForbiddenPulseTool(name: string): boolean {
  return (FORBIDDEN_PULSE_TOOLS as readonly string[]).includes(name);
}

/** JSON Schema-ish payload for OpenAI/function-calling adapters. */
export function pulseToolsAsOpenAI(): Array<{
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}> {
  return ALLOWED_PULSE_TOOLS.map((tool) => {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, param] of Object.entries(tool.parameters)) {
      properties[key] = {
        type: param.type,
        description: param.description,
        ...(param.items ? { items: param.items } : {}),
      };
      if (param.required) required.push(key);
    }
    return {
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties,
          required,
          additionalProperties: false,
        },
      },
    };
  });
}
