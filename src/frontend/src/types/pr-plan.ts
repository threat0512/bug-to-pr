export interface PRPlanResult {
  pr_title: string;
  commit_plan: string[];
  files_to_modify: string[];
  code_snippets: Record<string, string>;
  warning?: string;
  error_type?: string;
  should_retry?: boolean;
  raw_response?: string;
}
