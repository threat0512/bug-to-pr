export interface PRPlanResult {
    pr_title: string;
    commit_plan: string[];
    files_to_modify: string[];
    code_snippets: Record<string, string>;
} 