import { Schema } from "effect";

//#region src/baseSchemas.d.ts
declare const TrimmedString: Schema.Trim;
declare const TrimmedNonEmptyString: Schema.Trim;
declare const NonNegativeInt: Schema.Int;
declare const PositiveInt: Schema.Int;
declare const IsoDateTime: Schema.String;
type IsoDateTime = typeof IsoDateTime.Type;
declare const ThreadId: Schema.brand<Schema.Trim, "ThreadId">;
type ThreadId = typeof ThreadId.Type;
declare const ProjectId: Schema.brand<Schema.Trim, "ProjectId">;
type ProjectId = typeof ProjectId.Type;
declare const CommandId: Schema.brand<Schema.Trim, "CommandId">;
type CommandId = typeof CommandId.Type;
declare const EventId: Schema.brand<Schema.Trim, "EventId">;
type EventId = typeof EventId.Type;
declare const MessageId: Schema.brand<Schema.Trim, "MessageId">;
type MessageId = typeof MessageId.Type;
declare const TurnId: Schema.brand<Schema.Trim, "TurnId">;
type TurnId = typeof TurnId.Type;
declare const ProviderItemId: Schema.brand<Schema.Trim, "ProviderItemId">;
type ProviderItemId = typeof ProviderItemId.Type;
declare const RuntimeSessionId: Schema.brand<Schema.Trim, "RuntimeSessionId">;
type RuntimeSessionId = typeof RuntimeSessionId.Type;
declare const RuntimeItemId: Schema.brand<Schema.Trim, "RuntimeItemId">;
type RuntimeItemId = typeof RuntimeItemId.Type;
declare const RuntimeRequestId: Schema.brand<Schema.Trim, "RuntimeRequestId">;
type RuntimeRequestId = typeof RuntimeRequestId.Type;
declare const RuntimeTaskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
type RuntimeTaskId = typeof RuntimeTaskId.Type;
declare const ApprovalRequestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
type ApprovalRequestId = typeof ApprovalRequestId.Type;
declare const CheckpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
type CheckpointRef = typeof CheckpointRef.Type;
//#endregion
//#region src/git.d.ts
declare const GitStackedAction: Schema.Literals<readonly ["commit", "commit_push", "commit_push_pr"]>;
type GitStackedAction = typeof GitStackedAction.Type;
declare const GitBranch: Schema.Struct<{
  readonly name: Schema.Trim;
  readonly isRemote: Schema.optional<Schema.Boolean>;
  readonly remoteName: Schema.optional<Schema.Trim>;
  readonly current: Schema.Boolean;
  readonly isDefault: Schema.Boolean;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
}>;
type GitBranch = typeof GitBranch.Type;
declare const GitResolvedPullRequest: Schema.Struct<{
  readonly number: Schema.Int;
  readonly title: Schema.Trim;
  readonly url: Schema.String;
  readonly baseBranch: Schema.Trim;
  readonly headBranch: Schema.Trim;
  readonly state: Schema.Literals<readonly ["open", "closed", "merged"]>;
}>;
type GitResolvedPullRequest = typeof GitResolvedPullRequest.Type;
declare const GitStatusInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
}>;
type GitStatusInput = typeof GitStatusInput.Type;
declare const GitPullInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
}>;
type GitPullInput = typeof GitPullInput.Type;
declare const GitRunStackedActionInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly action: Schema.Literals<readonly ["commit", "commit_push", "commit_push_pr"]>;
  readonly commitMessage: Schema.optional<Schema.Trim>;
  readonly featureBranch: Schema.optional<Schema.Boolean>;
  readonly filePaths: Schema.optional<Schema.$Array<Schema.Trim>>;
  readonly textGenerationModel: Schema.withConstructorDefault<Schema.optional<Schema.Trim>>;
}>;
type GitRunStackedActionInput = typeof GitRunStackedActionInput.Type;
declare const GitListBranchesInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
}>;
type GitListBranchesInput = typeof GitListBranchesInput.Type;
declare const GitCreateWorktreeInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly branch: Schema.Trim;
  readonly newBranch: Schema.optional<Schema.Trim>;
  readonly path: Schema.NullOr<Schema.Trim>;
}>;
type GitCreateWorktreeInput = typeof GitCreateWorktreeInput.Type;
declare const GitPullRequestRefInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly reference: Schema.Trim;
}>;
type GitPullRequestRefInput = typeof GitPullRequestRefInput.Type;
declare const GitPreparePullRequestThreadInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly reference: Schema.Trim;
  readonly mode: Schema.Literals<readonly ["local", "worktree"]>;
}>;
type GitPreparePullRequestThreadInput = typeof GitPreparePullRequestThreadInput.Type;
declare const GitRemoveWorktreeInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly path: Schema.Trim;
  readonly force: Schema.optional<Schema.Boolean>;
}>;
type GitRemoveWorktreeInput = typeof GitRemoveWorktreeInput.Type;
declare const GitCreateBranchInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly branch: Schema.Trim;
}>;
type GitCreateBranchInput = typeof GitCreateBranchInput.Type;
declare const GitCheckoutInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly branch: Schema.Trim;
}>;
type GitCheckoutInput = typeof GitCheckoutInput.Type;
declare const GitInitInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
}>;
type GitInitInput = typeof GitInitInput.Type;
declare const GitStatusResult: Schema.Struct<{
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly hasWorkingTreeChanges: Schema.Boolean;
  readonly workingTree: Schema.Struct<{
    readonly files: Schema.$Array<Schema.Struct<{
      readonly path: Schema.Trim;
      readonly insertions: Schema.Int;
      readonly deletions: Schema.Int;
    }>>;
    readonly insertions: Schema.Int;
    readonly deletions: Schema.Int;
  }>;
  readonly hasUpstream: Schema.Boolean;
  readonly aheadCount: Schema.Int;
  readonly behindCount: Schema.Int;
  readonly pr: Schema.NullOr<Schema.Struct<{
    readonly number: Schema.Int;
    readonly title: Schema.Trim;
    readonly url: Schema.String;
    readonly baseBranch: Schema.Trim;
    readonly headBranch: Schema.Trim;
    readonly state: Schema.Literals<readonly ["open", "closed", "merged"]>;
  }>>;
}>;
type GitStatusResult = typeof GitStatusResult.Type;
declare const GitListBranchesResult: Schema.Struct<{
  readonly branches: Schema.$Array<Schema.Struct<{
    readonly name: Schema.Trim;
    readonly isRemote: Schema.optional<Schema.Boolean>;
    readonly remoteName: Schema.optional<Schema.Trim>;
    readonly current: Schema.Boolean;
    readonly isDefault: Schema.Boolean;
    readonly worktreePath: Schema.NullOr<Schema.Trim>;
  }>>;
  readonly isRepo: Schema.Boolean;
  readonly hasOriginRemote: Schema.Boolean;
}>;
type GitListBranchesResult = typeof GitListBranchesResult.Type;
declare const GitCreateWorktreeResult: Schema.Struct<{
  readonly worktree: Schema.Struct<{
    readonly path: Schema.Trim;
    readonly branch: Schema.Trim;
  }>;
}>;
type GitCreateWorktreeResult = typeof GitCreateWorktreeResult.Type;
declare const GitResolvePullRequestResult: Schema.Struct<{
  readonly pullRequest: Schema.Struct<{
    readonly number: Schema.Int;
    readonly title: Schema.Trim;
    readonly url: Schema.String;
    readonly baseBranch: Schema.Trim;
    readonly headBranch: Schema.Trim;
    readonly state: Schema.Literals<readonly ["open", "closed", "merged"]>;
  }>;
}>;
type GitResolvePullRequestResult = typeof GitResolvePullRequestResult.Type;
declare const GitPreparePullRequestThreadResult: Schema.Struct<{
  readonly pullRequest: Schema.Struct<{
    readonly number: Schema.Int;
    readonly title: Schema.Trim;
    readonly url: Schema.String;
    readonly baseBranch: Schema.Trim;
    readonly headBranch: Schema.Trim;
    readonly state: Schema.Literals<readonly ["open", "closed", "merged"]>;
  }>;
  readonly branch: Schema.Trim;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
}>;
type GitPreparePullRequestThreadResult = typeof GitPreparePullRequestThreadResult.Type;
declare const GitRunStackedActionResult: Schema.Struct<{
  readonly action: Schema.Literals<readonly ["commit", "commit_push", "commit_push_pr"]>;
  readonly branch: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["created", "skipped_not_requested"]>;
    readonly name: Schema.optional<Schema.Trim>;
  }>;
  readonly commit: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["created", "skipped_no_changes"]>;
    readonly commitSha: Schema.optional<Schema.Trim>;
    readonly subject: Schema.optional<Schema.Trim>;
  }>;
  readonly push: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["pushed", "skipped_not_requested", "skipped_up_to_date"]>;
    readonly branch: Schema.optional<Schema.Trim>;
    readonly upstreamBranch: Schema.optional<Schema.Trim>;
    readonly setUpstream: Schema.optional<Schema.Boolean>;
  }>;
  readonly pr: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["created", "opened_existing", "skipped_not_requested"]>;
    readonly url: Schema.optional<Schema.String>;
    readonly number: Schema.optional<Schema.Int>;
    readonly baseBranch: Schema.optional<Schema.Trim>;
    readonly headBranch: Schema.optional<Schema.Trim>;
    readonly title: Schema.optional<Schema.Trim>;
  }>;
}>;
type GitRunStackedActionResult = typeof GitRunStackedActionResult.Type;
declare const GitPullResult: Schema.Struct<{
  readonly status: Schema.Literals<readonly ["pulled", "skipped_up_to_date"]>;
  readonly branch: Schema.Trim;
  readonly upstreamBranch: Schema.NullOr<Schema.Trim>;
}>;
type GitPullResult = typeof GitPullResult.Type;
//#endregion
//#region src/project.d.ts
declare const ProjectSearchEntriesInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly query: Schema.Trim;
  readonly limit: Schema.Int;
}>;
type ProjectSearchEntriesInput = typeof ProjectSearchEntriesInput.Type;
declare const ProjectEntry: Schema.Struct<{
  readonly path: Schema.Trim;
  readonly kind: Schema.Literals<readonly ["file", "directory"]>;
  readonly parentPath: Schema.optional<Schema.Trim>;
}>;
type ProjectEntry = typeof ProjectEntry.Type;
declare const ProjectSearchEntriesResult: Schema.Struct<{
  readonly entries: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Literals<readonly ["file", "directory"]>;
    readonly parentPath: Schema.optional<Schema.Trim>;
  }>>;
  readonly truncated: Schema.Boolean;
}>;
type ProjectSearchEntriesResult = typeof ProjectSearchEntriesResult.Type;
declare const ProjectWriteFileInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly relativePath: Schema.Trim;
  readonly contents: Schema.String;
}>;
type ProjectWriteFileInput = typeof ProjectWriteFileInput.Type;
declare const ProjectWriteFileResult: Schema.Struct<{
  readonly relativePath: Schema.Trim;
}>;
type ProjectWriteFileResult = typeof ProjectWriteFileResult.Type;
//#endregion
//#region src/keybindings.d.ts
declare const MAX_KEYBINDING_VALUE_LENGTH = 64;
declare const MAX_WHEN_EXPRESSION_DEPTH = 64;
declare const MAX_SCRIPT_ID_LENGTH = 24;
declare const MAX_KEYBINDINGS_COUNT = 256;
declare const SCRIPT_RUN_COMMAND_PATTERN: Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>;
declare const KeybindingCommand: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
type KeybindingCommand = typeof KeybindingCommand.Type;
declare const KeybindingRule: Schema.Struct<{
  readonly key: Schema.Trim;
  readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
  readonly when: Schema.optional<Schema.Trim>;
}>;
type KeybindingRule = typeof KeybindingRule.Type;
declare const KeybindingsConfig: Schema.$Array<Schema.Struct<{
  readonly key: Schema.Trim;
  readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
  readonly when: Schema.optional<Schema.Trim>;
}>>;
type KeybindingsConfig = typeof KeybindingsConfig.Type;
declare const KeybindingShortcut: Schema.Struct<{
  readonly key: Schema.Trim;
  readonly metaKey: Schema.Boolean;
  readonly ctrlKey: Schema.Boolean;
  readonly shiftKey: Schema.Boolean;
  readonly altKey: Schema.Boolean;
  readonly modKey: Schema.Boolean;
}>;
type KeybindingShortcut = typeof KeybindingShortcut.Type;
declare const KeybindingWhenNode: Schema.Schema<KeybindingWhenNode>;
type KeybindingWhenNode = {
  type: "identifier";
  name: string;
} | {
  type: "not";
  node: KeybindingWhenNode;
} | {
  type: "and";
  left: KeybindingWhenNode;
  right: KeybindingWhenNode;
} | {
  type: "or";
  left: KeybindingWhenNode;
  right: KeybindingWhenNode;
};
declare const ResolvedKeybindingRule: Schema.Struct<{
  readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
  readonly shortcut: Schema.Struct<{
    readonly key: Schema.Trim;
    readonly metaKey: Schema.Boolean;
    readonly ctrlKey: Schema.Boolean;
    readonly shiftKey: Schema.Boolean;
    readonly altKey: Schema.Boolean;
    readonly modKey: Schema.Boolean;
  }>;
  readonly whenAst: Schema.optional<Schema.Schema<KeybindingWhenNode>>;
}>;
type ResolvedKeybindingRule = typeof ResolvedKeybindingRule.Type;
declare const ResolvedKeybindingsConfig: Schema.$Array<Schema.Struct<{
  readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
  readonly shortcut: Schema.Struct<{
    readonly key: Schema.Trim;
    readonly metaKey: Schema.Boolean;
    readonly ctrlKey: Schema.Boolean;
    readonly shiftKey: Schema.Boolean;
    readonly altKey: Schema.Boolean;
    readonly modKey: Schema.Boolean;
  }>;
  readonly whenAst: Schema.optional<Schema.Schema<KeybindingWhenNode>>;
}>>;
type ResolvedKeybindingsConfig = typeof ResolvedKeybindingsConfig.Type;
//#endregion
//#region src/server.d.ts
declare const ServerConfigIssue: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"keybindings.malformed-config">;
  readonly message: Schema.Trim;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"keybindings.invalid-entry">;
  readonly message: Schema.Trim;
  readonly index: Schema.Number;
}>]>;
type ServerConfigIssue = typeof ServerConfigIssue.Type;
declare const ServerProviderStatusState: Schema.Literals<readonly ["ready", "warning", "error"]>;
type ServerProviderStatusState = typeof ServerProviderStatusState.Type;
declare const ServerProviderAuthStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
type ServerProviderAuthStatus = typeof ServerProviderAuthStatus.Type;
declare const ServerProviderStatus: Schema.Struct<{
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
  readonly available: Schema.Boolean;
  readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
  readonly checkedAt: Schema.String;
  readonly message: Schema.optional<Schema.Trim>;
}>;
type ServerProviderStatus = typeof ServerProviderStatus.Type;
declare const ServerConfig: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly keybindingsConfigPath: Schema.Trim;
  readonly keybindings: Schema.$Array<Schema.Struct<{
    readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
    readonly shortcut: Schema.Struct<{
      readonly key: Schema.Trim;
      readonly metaKey: Schema.Boolean;
      readonly ctrlKey: Schema.Boolean;
      readonly shiftKey: Schema.Boolean;
      readonly altKey: Schema.Boolean;
      readonly modKey: Schema.Boolean;
    }>;
    readonly whenAst: Schema.optional<Schema.Schema<KeybindingWhenNode>>;
  }>>;
  readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.malformed-config">;
    readonly message: Schema.Trim;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.invalid-entry">;
    readonly message: Schema.Trim;
    readonly index: Schema.Number;
  }>]>>;
  readonly providers: Schema.$Array<Schema.Struct<{
    readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
    readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
    readonly available: Schema.Boolean;
    readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
    readonly checkedAt: Schema.String;
    readonly message: Schema.optional<Schema.Trim>;
  }>>;
  readonly availableEditors: Schema.$Array<Schema.Literals<("cursor" | "vscode" | "zed" | "antigravity" | "file-manager")[]>>;
}>;
type ServerConfig = typeof ServerConfig.Type;
declare const ServerUpsertKeybindingInput: Schema.Struct<{
  readonly key: Schema.Trim;
  readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
  readonly when: Schema.optional<Schema.Trim>;
}>;
type ServerUpsertKeybindingInput = typeof ServerUpsertKeybindingInput.Type;
declare const ServerUpsertKeybindingResult: Schema.Struct<{
  readonly keybindings: Schema.$Array<Schema.Struct<{
    readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
    readonly shortcut: Schema.Struct<{
      readonly key: Schema.Trim;
      readonly metaKey: Schema.Boolean;
      readonly ctrlKey: Schema.Boolean;
      readonly shiftKey: Schema.Boolean;
      readonly altKey: Schema.Boolean;
      readonly modKey: Schema.Boolean;
    }>;
    readonly whenAst: Schema.optional<Schema.Schema<KeybindingWhenNode>>;
  }>>;
  readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.malformed-config">;
    readonly message: Schema.Trim;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.invalid-entry">;
    readonly message: Schema.Trim;
    readonly index: Schema.Number;
  }>]>>;
}>;
type ServerUpsertKeybindingResult = typeof ServerUpsertKeybindingResult.Type;
declare const ServerConfigUpdatedPayload: Schema.Struct<{
  readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.malformed-config">;
    readonly message: Schema.Trim;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"keybindings.invalid-entry">;
    readonly message: Schema.Trim;
    readonly index: Schema.Number;
  }>]>>;
  readonly providers: Schema.$Array<Schema.Struct<{
    readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
    readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
    readonly available: Schema.Boolean;
    readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
    readonly checkedAt: Schema.String;
    readonly message: Schema.optional<Schema.Trim>;
  }>>;
}>;
type ServerConfigUpdatedPayload = typeof ServerConfigUpdatedPayload.Type;
//#endregion
//#region src/terminal.d.ts
declare const DEFAULT_TERMINAL_ID = "default";
declare const TerminalThreadInput: Schema.Struct<{
  readonly threadId: Schema.Trim;
}>;
type TerminalThreadInput = Schema.Codec.Encoded<typeof TerminalThreadInput>;
declare const TerminalSessionInput: Schema.Struct<{
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalSessionInput = Schema.Codec.Encoded<typeof TerminalSessionInput>;
declare const TerminalOpenInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly cols: Schema.optional<Schema.Int>;
  readonly rows: Schema.optional<Schema.Int>;
  readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalOpenInput = Schema.Codec.Encoded<typeof TerminalOpenInput>;
declare const TerminalWriteInput: Schema.Struct<{
  readonly data: Schema.String;
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalWriteInput = Schema.Codec.Encoded<typeof TerminalWriteInput>;
declare const TerminalResizeInput: Schema.Struct<{
  readonly cols: Schema.Int;
  readonly rows: Schema.Int;
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalResizeInput = Schema.Codec.Encoded<typeof TerminalResizeInput>;
declare const TerminalClearInput: Schema.Struct<{
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalClearInput = Schema.Codec.Encoded<typeof TerminalClearInput>;
declare const TerminalRestartInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly cols: Schema.Int;
  readonly rows: Schema.Int;
  readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
  readonly threadId: Schema.Trim;
}>;
type TerminalRestartInput = Schema.Codec.Encoded<typeof TerminalRestartInput>;
declare const TerminalCloseInput: Schema.Struct<{
  readonly terminalId: Schema.optional<Schema.Trim>;
  readonly deleteHistory: Schema.optional<Schema.Boolean>;
  readonly threadId: Schema.Trim;
}>;
type TerminalCloseInput = Schema.Codec.Encoded<typeof TerminalCloseInput>;
declare const TerminalSessionStatus: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
type TerminalSessionStatus = typeof TerminalSessionStatus.Type;
declare const TerminalSessionSnapshot: Schema.Struct<{
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly cwd: Schema.String;
  readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
  readonly pid: Schema.NullOr<Schema.Int>;
  readonly history: Schema.String;
  readonly exitCode: Schema.NullOr<Schema.Int>;
  readonly exitSignal: Schema.NullOr<Schema.Int>;
  readonly updatedAt: Schema.String;
}>;
type TerminalSessionSnapshot = typeof TerminalSessionSnapshot.Type;
declare const TerminalEvent: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"started">;
  readonly snapshot: Schema.Struct<{
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly cwd: Schema.String;
    readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
    readonly pid: Schema.NullOr<Schema.Int>;
    readonly history: Schema.String;
    readonly exitCode: Schema.NullOr<Schema.Int>;
    readonly exitSignal: Schema.NullOr<Schema.Int>;
    readonly updatedAt: Schema.String;
  }>;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"output">;
  readonly data: Schema.String;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"exited">;
  readonly exitCode: Schema.NullOr<Schema.Int>;
  readonly exitSignal: Schema.NullOr<Schema.Int>;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"error">;
  readonly message: Schema.String;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"cleared">;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"restarted">;
  readonly snapshot: Schema.Struct<{
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly cwd: Schema.String;
    readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
    readonly pid: Schema.NullOr<Schema.Int>;
    readonly history: Schema.String;
    readonly exitCode: Schema.NullOr<Schema.Int>;
    readonly exitSignal: Schema.NullOr<Schema.Int>;
    readonly updatedAt: Schema.String;
  }>;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"activity">;
  readonly hasRunningSubprocess: Schema.Boolean;
  readonly threadId: Schema.String;
  readonly terminalId: Schema.String;
  readonly createdAt: Schema.String;
}>]>;
type TerminalEvent = typeof TerminalEvent.Type;
//#endregion
//#region src/orchestration.d.ts
declare const ORCHESTRATION_WS_METHODS: {
  readonly getSnapshot: "orchestration.getSnapshot";
  readonly dispatchCommand: "orchestration.dispatchCommand";
  readonly getTurnDiff: "orchestration.getTurnDiff";
  readonly getFullThreadDiff: "orchestration.getFullThreadDiff";
  readonly replayEvents: "orchestration.replayEvents";
};
declare const ORCHESTRATION_WS_CHANNELS: {
  readonly domainEvent: "orchestration.domainEvent";
};
declare const ProviderKind: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
type ProviderKind = typeof ProviderKind.Type;
declare const ProviderApprovalPolicy: Schema.Literals<readonly ["untrusted", "on-failure", "on-request", "never"]>;
type ProviderApprovalPolicy = typeof ProviderApprovalPolicy.Type;
declare const ProviderSandboxMode: Schema.Literals<readonly ["read-only", "workspace-write", "danger-full-access"]>;
type ProviderSandboxMode = typeof ProviderSandboxMode.Type;
declare const DEFAULT_PROVIDER_KIND: ProviderKind;
declare const CodexProviderStartOptions: Schema.Struct<{
  readonly binaryPath: Schema.optional<Schema.Trim>;
  readonly homePath: Schema.optional<Schema.Trim>;
}>;
declare const ClaudeProviderStartOptions: Schema.Struct<{
  readonly binaryPath: Schema.optional<Schema.Trim>;
  readonly permissionMode: Schema.optional<Schema.Trim>;
  readonly maxThinkingTokens: Schema.optional<Schema.Int>;
}>;
declare const ProviderStartOptions: Schema.Struct<{
  readonly codex: Schema.optional<Schema.Struct<{
    readonly binaryPath: Schema.optional<Schema.Trim>;
    readonly homePath: Schema.optional<Schema.Trim>;
  }>>;
  readonly claudeAgent: Schema.optional<Schema.Struct<{
    readonly binaryPath: Schema.optional<Schema.Trim>;
    readonly permissionMode: Schema.optional<Schema.Trim>;
    readonly maxThinkingTokens: Schema.optional<Schema.Int>;
  }>>;
}>;
type ProviderStartOptions = typeof ProviderStartOptions.Type;
declare const RuntimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
type RuntimeMode = typeof RuntimeMode.Type;
declare const DEFAULT_RUNTIME_MODE: RuntimeMode;
declare const ProviderInteractionMode: Schema.Literals<readonly ["default", "plan"]>;
type ProviderInteractionMode = typeof ProviderInteractionMode.Type;
declare const DEFAULT_PROVIDER_INTERACTION_MODE: ProviderInteractionMode;
declare const ProviderRequestKind: Schema.Literals<readonly ["command", "file-read", "file-change"]>;
type ProviderRequestKind = typeof ProviderRequestKind.Type;
declare const AssistantDeliveryMode: Schema.Literals<readonly ["buffered", "streaming"]>;
type AssistantDeliveryMode = typeof AssistantDeliveryMode.Type;
declare const ProviderApprovalDecision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
type ProviderApprovalDecision = typeof ProviderApprovalDecision.Type;
declare const ProviderUserInputAnswers: Schema.$Record<Schema.String, Schema.Unknown>;
type ProviderUserInputAnswers = typeof ProviderUserInputAnswers.Type;
declare const PROVIDER_SEND_TURN_MAX_INPUT_CHARS = 120000;
declare const PROVIDER_SEND_TURN_MAX_ATTACHMENTS = 8;
declare const PROVIDER_SEND_TURN_MAX_IMAGE_BYTES: number;
declare const CorrelationId: Schema.brand<Schema.Trim, "CommandId">;
type CorrelationId = typeof CorrelationId.Type;
declare const ChatAttachmentId: Schema.Trim;
type ChatAttachmentId = typeof ChatAttachmentId.Type;
declare const ChatImageAttachment: Schema.Struct<{
  readonly type: Schema.Literal<"image">;
  readonly id: Schema.Trim;
  readonly name: Schema.Trim;
  readonly mimeType: Schema.Trim;
  readonly sizeBytes: Schema.Int;
}>;
type ChatImageAttachment = typeof ChatImageAttachment.Type;
declare const UploadChatImageAttachment: Schema.Struct<{
  readonly type: Schema.Literal<"image">;
  readonly name: Schema.Trim;
  readonly mimeType: Schema.Trim;
  readonly sizeBytes: Schema.Int;
  readonly dataUrl: Schema.Trim;
}>;
type UploadChatImageAttachment = typeof UploadChatImageAttachment.Type;
declare const ChatAttachment: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"image">;
  readonly id: Schema.Trim;
  readonly name: Schema.Trim;
  readonly mimeType: Schema.Trim;
  readonly sizeBytes: Schema.Int;
}>]>;
type ChatAttachment = typeof ChatAttachment.Type;
declare const UploadChatAttachment: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"image">;
  readonly name: Schema.Trim;
  readonly mimeType: Schema.Trim;
  readonly sizeBytes: Schema.Int;
  readonly dataUrl: Schema.Trim;
}>]>;
type UploadChatAttachment = typeof UploadChatAttachment.Type;
declare const ProjectScriptIcon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
type ProjectScriptIcon = typeof ProjectScriptIcon.Type;
declare const ProjectScript: Schema.Struct<{
  readonly id: Schema.Trim;
  readonly name: Schema.Trim;
  readonly command: Schema.Trim;
  readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
  readonly runOnWorktreeCreate: Schema.Boolean;
}>;
type ProjectScript = typeof ProjectScript.Type;
declare const OrchestrationProject: Schema.Struct<{
  readonly id: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.NullOr<Schema.Trim>;
  readonly scripts: Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
  readonly deletedAt: Schema.NullOr<Schema.String>;
}>;
type OrchestrationProject = typeof OrchestrationProject.Type;
declare const OrchestrationMessageRole: Schema.Literals<readonly ["user", "assistant", "system"]>;
type OrchestrationMessageRole = typeof OrchestrationMessageRole.Type;
declare const OrchestrationMessage: Schema.Struct<{
  readonly id: Schema.brand<Schema.Trim, "MessageId">;
  readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
  readonly text: Schema.String;
  readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"image">;
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly mimeType: Schema.Trim;
    readonly sizeBytes: Schema.Int;
  }>]>>>;
  readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
  readonly streaming: Schema.Boolean;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
}>;
type OrchestrationMessage = typeof OrchestrationMessage.Type;
declare const OrchestrationProposedPlanId: Schema.Trim;
type OrchestrationProposedPlanId = typeof OrchestrationProposedPlanId.Type;
declare const OrchestrationProposedPlan: Schema.Struct<{
  readonly id: Schema.Trim;
  readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
  readonly planMarkdown: Schema.Trim;
  readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
  readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
}>;
type OrchestrationProposedPlan = typeof OrchestrationProposedPlan.Type;
declare const OrchestrationSessionStatus: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
type OrchestrationSessionStatus = typeof OrchestrationSessionStatus.Type;
declare const OrchestrationSession: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
  readonly providerName: Schema.NullOr<Schema.Trim>;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
  readonly lastError: Schema.NullOr<Schema.Trim>;
  readonly updatedAt: Schema.String;
}>;
type OrchestrationSession = typeof OrchestrationSession.Type;
declare const OrchestrationCheckpointFile: Schema.Struct<{
  readonly path: Schema.Trim;
  readonly kind: Schema.Trim;
  readonly additions: Schema.Int;
  readonly deletions: Schema.Int;
}>;
type OrchestrationCheckpointFile = typeof OrchestrationCheckpointFile.Type;
declare const OrchestrationCheckpointStatus: Schema.Literals<readonly ["ready", "missing", "error"]>;
type OrchestrationCheckpointStatus = typeof OrchestrationCheckpointStatus.Type;
declare const OrchestrationCheckpointSummary: Schema.Struct<{
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly checkpointTurnCount: Schema.Int;
  readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
  readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
  readonly files: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Trim;
    readonly additions: Schema.Int;
    readonly deletions: Schema.Int;
  }>>;
  readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
  readonly completedAt: Schema.String;
}>;
type OrchestrationCheckpointSummary = typeof OrchestrationCheckpointSummary.Type;
declare const OrchestrationThreadActivityTone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
type OrchestrationThreadActivityTone = typeof OrchestrationThreadActivityTone.Type;
declare const OrchestrationThreadActivity: Schema.Struct<{
  readonly id: Schema.brand<Schema.Trim, "EventId">;
  readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
  readonly kind: Schema.Trim;
  readonly summary: Schema.Trim;
  readonly payload: Schema.Unknown;
  readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
  readonly sequence: Schema.optional<Schema.Int>;
  readonly createdAt: Schema.String;
}>;
type OrchestrationThreadActivity = typeof OrchestrationThreadActivity.Type;
declare const OrchestrationLatestTurnState: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
type OrchestrationLatestTurnState = typeof OrchestrationLatestTurnState.Type;
declare const OrchestrationLatestTurn: Schema.Struct<{
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly state: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
  readonly requestedAt: Schema.String;
  readonly startedAt: Schema.NullOr<Schema.String>;
  readonly completedAt: Schema.NullOr<Schema.String>;
  readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
}>;
type OrchestrationLatestTurn = typeof OrchestrationLatestTurn.Type;
declare const OrchestrationThread: Schema.Struct<{
  readonly id: Schema.brand<Schema.Trim, "ThreadId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly model: Schema.Trim;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
  readonly latestTurn: Schema.NullOr<Schema.Struct<{
    readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
    readonly state: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
    readonly requestedAt: Schema.String;
    readonly startedAt: Schema.NullOr<Schema.String>;
    readonly completedAt: Schema.NullOr<Schema.String>;
    readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
    readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly planId: Schema.Trim;
    }>>;
  }>>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
  readonly deletedAt: Schema.NullOr<Schema.String>;
  readonly messages: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
    readonly text: Schema.String;
    readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>>;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly streaming: Schema.Boolean;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>>;
  readonly proposedPlans: Schema.withDecodingDefault<Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly planMarkdown: Schema.Trim;
    readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
    readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>>>;
  readonly activities: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "EventId">;
    readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
    readonly kind: Schema.Trim;
    readonly summary: Schema.Trim;
    readonly payload: Schema.Unknown;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly sequence: Schema.optional<Schema.Int>;
    readonly createdAt: Schema.String;
  }>>;
  readonly checkpoints: Schema.$Array<Schema.Struct<{
    readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
    readonly checkpointTurnCount: Schema.Int;
    readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
    readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
    readonly files: Schema.$Array<Schema.Struct<{
      readonly path: Schema.Trim;
      readonly kind: Schema.Trim;
      readonly additions: Schema.Int;
      readonly deletions: Schema.Int;
    }>>;
    readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
    readonly completedAt: Schema.String;
  }>>;
  readonly session: Schema.NullOr<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
    readonly providerName: Schema.NullOr<Schema.Trim>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly lastError: Schema.NullOr<Schema.Trim>;
    readonly updatedAt: Schema.String;
  }>>;
}>;
type OrchestrationThread = typeof OrchestrationThread.Type;
declare const OrchestrationReadModel: Schema.Struct<{
  readonly snapshotSequence: Schema.Int;
  readonly projects: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly workspaceRoot: Schema.Trim;
    readonly defaultModel: Schema.NullOr<Schema.Trim>;
    readonly scripts: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
    readonly deletedAt: Schema.NullOr<Schema.String>;
  }>>;
  readonly threads: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "ThreadId">;
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly model: Schema.Trim;
    readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly branch: Schema.NullOr<Schema.Trim>;
    readonly worktreePath: Schema.NullOr<Schema.Trim>;
    readonly latestTurn: Schema.NullOr<Schema.Struct<{
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly state: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
      readonly requestedAt: Schema.String;
      readonly startedAt: Schema.NullOr<Schema.String>;
      readonly completedAt: Schema.NullOr<Schema.String>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
    readonly deletedAt: Schema.NullOr<Schema.String>;
    readonly messages: Schema.$Array<Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "MessageId">;
      readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
      readonly text: Schema.String;
      readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"image">;
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly mimeType: Schema.Trim;
        readonly sizeBytes: Schema.Int;
      }>]>>>;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly streaming: Schema.Boolean;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>>;
    readonly proposedPlans: Schema.withDecodingDefault<Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly planMarkdown: Schema.Trim;
      readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
      readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>>>;
    readonly activities: Schema.$Array<Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "EventId">;
      readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
      readonly kind: Schema.Trim;
      readonly summary: Schema.Trim;
      readonly payload: Schema.Unknown;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly sequence: Schema.optional<Schema.Int>;
      readonly createdAt: Schema.String;
    }>>;
    readonly checkpoints: Schema.$Array<Schema.Struct<{
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly checkpointTurnCount: Schema.Int;
      readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
      readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
      readonly files: Schema.$Array<Schema.Struct<{
        readonly path: Schema.Trim;
        readonly kind: Schema.Trim;
        readonly additions: Schema.Int;
        readonly deletions: Schema.Int;
      }>>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly completedAt: Schema.String;
    }>>;
    readonly session: Schema.NullOr<Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
      readonly providerName: Schema.NullOr<Schema.Trim>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly lastError: Schema.NullOr<Schema.Trim>;
      readonly updatedAt: Schema.String;
    }>>;
  }>>;
  readonly updatedAt: Schema.String;
}>;
type OrchestrationReadModel = typeof OrchestrationReadModel.Type;
declare const ProjectCreateCommand: Schema.Struct<{
  readonly type: Schema.Literal<"project.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly createdAt: Schema.String;
}>;
declare const ThreadTurnStartCommand: Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.start">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly message: Schema.Struct<{
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literal<"user">;
    readonly text: Schema.String;
    readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>;
  }>;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
  readonly createdAt: Schema.String;
}>;
declare const DispatchableClientOrchestrationCommand: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"project.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly workspaceRoot: Schema.optional<Schema.Trim>;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly model: Schema.Trim;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.runtime-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.interaction-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.start">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly message: Schema.Struct<{
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literal<"user">;
    readonly text: Schema.String;
    readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>;
  }>;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.interrupt">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.approval.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.user-input.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.checkpoint.revert">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session.stop">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
}>]>;
type DispatchableClientOrchestrationCommand = typeof DispatchableClientOrchestrationCommand.Type;
declare const ClientOrchestrationCommand: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"project.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly workspaceRoot: Schema.optional<Schema.Trim>;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly model: Schema.Trim;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.runtime-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.interaction-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.start">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly message: Schema.Struct<{
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literal<"user">;
    readonly text: Schema.String;
    readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
      readonly dataUrl: Schema.Trim;
    }>]>>;
  }>;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.interrupt">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.approval.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.user-input.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.checkpoint.revert">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session.stop">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
}>]>;
type ClientOrchestrationCommand = typeof ClientOrchestrationCommand.Type;
declare const InternalOrchestrationCommand: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"thread.session.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly session: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
    readonly providerName: Schema.NullOr<Schema.Trim>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly lastError: Schema.NullOr<Schema.Trim>;
    readonly updatedAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message.assistant.delta">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly delta: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message.assistant.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.proposed-plan.upsert">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly proposedPlan: Schema.Struct<{
    readonly id: Schema.Trim;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly planMarkdown: Schema.Trim;
    readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
    readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.diff.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly completedAt: Schema.String;
  readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
  readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
  readonly files: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Trim;
    readonly additions: Schema.Int;
    readonly deletions: Schema.Int;
  }>>;
  readonly assistantMessageId: Schema.optional<Schema.brand<Schema.Trim, "MessageId">>;
  readonly checkpointTurnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.activity.append">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly activity: Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "EventId">;
    readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
    readonly kind: Schema.Trim;
    readonly summary: Schema.Trim;
    readonly payload: Schema.Unknown;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly sequence: Schema.optional<Schema.Int>;
    readonly createdAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.revert.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>]>;
type InternalOrchestrationCommand = typeof InternalOrchestrationCommand.Type;
declare const OrchestrationCommand: Schema.Union<readonly [Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"project.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly workspaceRoot: Schema.optional<Schema.Trim>;
  readonly defaultModel: Schema.optional<Schema.Trim>;
  readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.create">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly model: Schema.Trim;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.delete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.meta.update">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.runtime-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.interaction-mode.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.start">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly message: Schema.Struct<{
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literal<"user">;
    readonly text: Schema.String;
    readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>;
  }>;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.interrupt">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.approval.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.user-input.respond">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.checkpoint.revert">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session.stop">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
}>]>, Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"thread.session.set">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly session: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
    readonly providerName: Schema.NullOr<Schema.Trim>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly lastError: Schema.NullOr<Schema.Trim>;
    readonly updatedAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message.assistant.delta">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly delta: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message.assistant.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.proposed-plan.upsert">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly proposedPlan: Schema.Struct<{
    readonly id: Schema.Trim;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly planMarkdown: Schema.Trim;
    readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
    readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn.diff.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly completedAt: Schema.String;
  readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
  readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
  readonly files: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Trim;
    readonly additions: Schema.Int;
    readonly deletions: Schema.Int;
  }>>;
  readonly assistantMessageId: Schema.optional<Schema.brand<Schema.Trim, "MessageId">>;
  readonly checkpointTurnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.activity.append">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly activity: Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "EventId">;
    readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
    readonly kind: Schema.Trim;
    readonly summary: Schema.Trim;
    readonly payload: Schema.Unknown;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly sequence: Schema.optional<Schema.Int>;
    readonly createdAt: Schema.String;
  }>;
  readonly createdAt: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.revert.complete">;
  readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>]>]>;
type OrchestrationCommand = typeof OrchestrationCommand.Type;
declare const OrchestrationEventType: Schema.Literals<readonly ["project.created", "project.meta-updated", "project.deleted", "thread.created", "thread.deleted", "thread.meta-updated", "thread.runtime-mode-set", "thread.interaction-mode-set", "thread.message-sent", "thread.turn-start-requested", "thread.turn-interrupt-requested", "thread.approval-response-requested", "thread.user-input-response-requested", "thread.checkpoint-revert-requested", "thread.reverted", "thread.session-stop-requested", "thread.session-set", "thread.proposed-plan-upserted", "thread.turn-diff-completed", "thread.activity-appended"]>;
type OrchestrationEventType = typeof OrchestrationEventType.Type;
declare const OrchestrationAggregateKind: Schema.Literals<readonly ["project", "thread"]>;
type OrchestrationAggregateKind = typeof OrchestrationAggregateKind.Type;
declare const OrchestrationActorKind: Schema.Literals<readonly ["client", "server", "provider"]>;
declare const ProjectCreatedPayload: Schema.Struct<{
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly workspaceRoot: Schema.Trim;
  readonly defaultModel: Schema.NullOr<Schema.Trim>;
  readonly scripts: Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
}>;
declare const ProjectMetaUpdatedPayload: Schema.Struct<{
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly workspaceRoot: Schema.optional<Schema.Trim>;
  readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly command: Schema.Trim;
    readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
    readonly runOnWorktreeCreate: Schema.Boolean;
  }>>>;
  readonly updatedAt: Schema.String;
}>;
declare const ProjectDeletedPayload: Schema.Struct<{
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly deletedAt: Schema.String;
}>;
declare const ThreadCreatedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
  readonly title: Schema.Trim;
  readonly model: Schema.Trim;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly branch: Schema.NullOr<Schema.Trim>;
  readonly worktreePath: Schema.NullOr<Schema.Trim>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
}>;
declare const ThreadDeletedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly deletedAt: Schema.String;
}>;
declare const ThreadMetaUpdatedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly title: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly updatedAt: Schema.String;
}>;
declare const ThreadRuntimeModeSetPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly updatedAt: Schema.String;
}>;
declare const ThreadInteractionModeSetPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly updatedAt: Schema.String;
}>;
declare const ThreadMessageSentPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
  readonly text: Schema.String;
  readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"image">;
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly mimeType: Schema.Trim;
    readonly sizeBytes: Schema.Int;
  }>]>>>;
  readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
  readonly streaming: Schema.Boolean;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
}>;
declare const ThreadTurnStartRequestedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
  readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
  readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
  readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly planId: Schema.Trim;
  }>>;
  readonly createdAt: Schema.String;
}>;
declare const ThreadTurnInterruptRequestedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
}>;
declare const ThreadApprovalResponseRequestedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
  readonly createdAt: Schema.String;
}>;
declare const ThreadCheckpointRevertRequestedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
  readonly createdAt: Schema.String;
}>;
declare const ThreadRevertedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnCount: Schema.Int;
}>;
declare const ThreadSessionStopRequestedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
}>;
declare const ThreadSessionSetPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly session: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
    readonly providerName: Schema.NullOr<Schema.Trim>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly lastError: Schema.NullOr<Schema.Trim>;
    readonly updatedAt: Schema.String;
  }>;
}>;
declare const ThreadProposedPlanUpsertedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly proposedPlan: Schema.Struct<{
    readonly id: Schema.Trim;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly planMarkdown: Schema.Trim;
    readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
    readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
}>;
declare const ThreadTurnDiffCompletedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly checkpointTurnCount: Schema.Int;
  readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
  readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
  readonly files: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Trim;
    readonly additions: Schema.Int;
    readonly deletions: Schema.Int;
  }>>;
  readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
  readonly completedAt: Schema.String;
}>;
declare const ThreadActivityAppendedPayload: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly activity: Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "EventId">;
    readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
    readonly kind: Schema.Trim;
    readonly summary: Schema.Trim;
    readonly payload: Schema.Unknown;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly sequence: Schema.optional<Schema.Int>;
    readonly createdAt: Schema.String;
  }>;
}>;
declare const OrchestrationEventMetadata: Schema.Struct<{
  readonly providerTurnId: Schema.optional<Schema.Trim>;
  readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
  readonly adapterKey: Schema.optional<Schema.Trim>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
  readonly ingestedAt: Schema.optional<Schema.String>;
}>;
type OrchestrationEventMetadata = typeof OrchestrationEventMetadata.Type;
declare const OrchestrationEvent: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"project.created">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly workspaceRoot: Schema.Trim;
    readonly defaultModel: Schema.NullOr<Schema.Trim>;
    readonly scripts: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.meta-updated">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.optional<Schema.Trim>;
    readonly workspaceRoot: Schema.optional<Schema.Trim>;
    readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.deleted">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly deletedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.created">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly model: Schema.Trim;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly branch: Schema.NullOr<Schema.Trim>;
    readonly worktreePath: Schema.NullOr<Schema.Trim>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.deleted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly deletedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.meta-updated">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly title: Schema.optional<Schema.Trim>;
    readonly model: Schema.optional<Schema.Trim>;
    readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.runtime-mode-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.interaction-mode-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message-sent">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
    readonly text: Schema.String;
    readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>>;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly streaming: Schema.Boolean;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-start-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
    readonly model: Schema.optional<Schema.Trim>;
    readonly modelOptions: Schema.optional<Schema.Struct<{
      readonly codex: Schema.optional<Schema.Struct<{
        readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
        readonly fastMode: Schema.optional<Schema.Boolean>;
      }>>;
      readonly claudeAgent: Schema.optional<Schema.Struct<{
        readonly thinking: Schema.optional<Schema.Boolean>;
        readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
        readonly fastMode: Schema.optional<Schema.Boolean>;
      }>>;
    }>>;
    readonly providerOptions: Schema.optional<Schema.Struct<{
      readonly codex: Schema.optional<Schema.Struct<{
        readonly binaryPath: Schema.optional<Schema.Trim>;
        readonly homePath: Schema.optional<Schema.Trim>;
      }>>;
      readonly claudeAgent: Schema.optional<Schema.Struct<{
        readonly binaryPath: Schema.optional<Schema.Trim>;
        readonly permissionMode: Schema.optional<Schema.Trim>;
        readonly maxThinkingTokens: Schema.optional<Schema.Int>;
      }>>;
    }>>;
    readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly planId: Schema.Trim;
    }>>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.approval-response-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
    readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.user-input-response-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
    readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnCount: Schema.Int;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.reverted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnCount: Schema.Int;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session-stop-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly session: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
      readonly providerName: Schema.NullOr<Schema.Trim>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly lastError: Schema.NullOr<Schema.Trim>;
      readonly updatedAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly proposedPlan: Schema.Struct<{
      readonly id: Schema.Trim;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly planMarkdown: Schema.Trim;
      readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
      readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-diff-completed">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
    readonly checkpointTurnCount: Schema.Int;
    readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
    readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
    readonly files: Schema.$Array<Schema.Struct<{
      readonly path: Schema.Trim;
      readonly kind: Schema.Trim;
      readonly additions: Schema.Int;
      readonly deletions: Schema.Int;
    }>>;
    readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
    readonly completedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.activity-appended">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly activity: Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "EventId">;
      readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
      readonly kind: Schema.Trim;
      readonly summary: Schema.Trim;
      readonly payload: Schema.Unknown;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly sequence: Schema.optional<Schema.Int>;
      readonly createdAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>]>;
type OrchestrationEvent = typeof OrchestrationEvent.Type;
declare const OrchestrationCommandReceiptStatus: Schema.Literals<readonly ["accepted", "rejected"]>;
type OrchestrationCommandReceiptStatus = typeof OrchestrationCommandReceiptStatus.Type;
declare const TurnCountRange: Schema.Struct<{
  readonly fromTurnCount: Schema.Int;
  readonly toTurnCount: Schema.Int;
}>;
declare const ThreadTurnDiff: Schema.Struct<{
  readonly fromTurnCount: Schema.Int;
  readonly toTurnCount: Schema.Int;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly diff: Schema.String;
}>;
declare const ProviderSessionRuntimeStatus: Schema.Literals<readonly ["starting", "running", "stopped", "error"]>;
type ProviderSessionRuntimeStatus = typeof ProviderSessionRuntimeStatus.Type;
declare const ProjectionThreadTurnStatus: Schema.Literals<readonly ["running", "completed", "interrupted", "error"]>;
type ProjectionThreadTurnStatus = typeof ProjectionThreadTurnStatus.Type;
declare const ProjectionCheckpointRow: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly checkpointTurnCount: Schema.Int;
  readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
  readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
  readonly files: Schema.$Array<Schema.Struct<{
    readonly path: Schema.Trim;
    readonly kind: Schema.Trim;
    readonly additions: Schema.Int;
    readonly deletions: Schema.Int;
  }>>;
  readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
  readonly completedAt: Schema.String;
}>;
type ProjectionCheckpointRow = typeof ProjectionCheckpointRow.Type;
declare const ProjectionPendingApprovalStatus: Schema.Literals<readonly ["pending", "resolved"]>;
type ProjectionPendingApprovalStatus = typeof ProjectionPendingApprovalStatus.Type;
declare const ProjectionPendingApprovalDecision: Schema.NullOr<Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>>;
type ProjectionPendingApprovalDecision = typeof ProjectionPendingApprovalDecision.Type;
declare const DispatchResult: Schema.Struct<{
  readonly sequence: Schema.Int;
}>;
type DispatchResult = typeof DispatchResult.Type;
declare const OrchestrationGetSnapshotInput: Schema.Struct<{}>;
type OrchestrationGetSnapshotInput = typeof OrchestrationGetSnapshotInput.Type;
declare const OrchestrationGetSnapshotResult: Schema.Struct<{
  readonly snapshotSequence: Schema.Int;
  readonly projects: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly workspaceRoot: Schema.Trim;
    readonly defaultModel: Schema.NullOr<Schema.Trim>;
    readonly scripts: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
    readonly deletedAt: Schema.NullOr<Schema.String>;
  }>>;
  readonly threads: Schema.$Array<Schema.Struct<{
    readonly id: Schema.brand<Schema.Trim, "ThreadId">;
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly model: Schema.Trim;
    readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly branch: Schema.NullOr<Schema.Trim>;
    readonly worktreePath: Schema.NullOr<Schema.Trim>;
    readonly latestTurn: Schema.NullOr<Schema.Struct<{
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly state: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
      readonly requestedAt: Schema.String;
      readonly startedAt: Schema.NullOr<Schema.String>;
      readonly completedAt: Schema.NullOr<Schema.String>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
    readonly deletedAt: Schema.NullOr<Schema.String>;
    readonly messages: Schema.$Array<Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "MessageId">;
      readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
      readonly text: Schema.String;
      readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"image">;
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly mimeType: Schema.Trim;
        readonly sizeBytes: Schema.Int;
      }>]>>>;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly streaming: Schema.Boolean;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>>;
    readonly proposedPlans: Schema.withDecodingDefault<Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly planMarkdown: Schema.Trim;
      readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
      readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>>>;
    readonly activities: Schema.$Array<Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "EventId">;
      readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
      readonly kind: Schema.Trim;
      readonly summary: Schema.Trim;
      readonly payload: Schema.Unknown;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly sequence: Schema.optional<Schema.Int>;
      readonly createdAt: Schema.String;
    }>>;
    readonly checkpoints: Schema.$Array<Schema.Struct<{
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly checkpointTurnCount: Schema.Int;
      readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
      readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
      readonly files: Schema.$Array<Schema.Struct<{
        readonly path: Schema.Trim;
        readonly kind: Schema.Trim;
        readonly additions: Schema.Int;
        readonly deletions: Schema.Int;
      }>>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly completedAt: Schema.String;
    }>>;
    readonly session: Schema.NullOr<Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
      readonly providerName: Schema.NullOr<Schema.Trim>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly lastError: Schema.NullOr<Schema.Trim>;
      readonly updatedAt: Schema.String;
    }>>;
  }>>;
  readonly updatedAt: Schema.String;
}>;
type OrchestrationGetSnapshotResult = typeof OrchestrationGetSnapshotResult.Type;
declare const OrchestrationGetTurnDiffInput: Schema.Struct<{
  readonly fromTurnCount: Schema.Int;
  readonly toTurnCount: Schema.Int;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
}>;
type OrchestrationGetTurnDiffInput = typeof OrchestrationGetTurnDiffInput.Type;
declare const OrchestrationGetTurnDiffResult: Schema.Struct<{
  readonly fromTurnCount: Schema.Int;
  readonly toTurnCount: Schema.Int;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly diff: Schema.String;
}>;
type OrchestrationGetTurnDiffResult = typeof OrchestrationGetTurnDiffResult.Type;
declare const OrchestrationGetFullThreadDiffInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly toTurnCount: Schema.Int;
}>;
type OrchestrationGetFullThreadDiffInput = typeof OrchestrationGetFullThreadDiffInput.Type;
declare const OrchestrationGetFullThreadDiffResult: Schema.Struct<{
  readonly fromTurnCount: Schema.Int;
  readonly toTurnCount: Schema.Int;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly diff: Schema.String;
}>;
type OrchestrationGetFullThreadDiffResult = typeof OrchestrationGetFullThreadDiffResult.Type;
declare const OrchestrationReplayEventsInput: Schema.Struct<{
  readonly fromSequenceExclusive: Schema.Int;
}>;
type OrchestrationReplayEventsInput = typeof OrchestrationReplayEventsInput.Type;
declare const OrchestrationReplayEventsResult: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"project.created">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly workspaceRoot: Schema.Trim;
    readonly defaultModel: Schema.NullOr<Schema.Trim>;
    readonly scripts: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.meta-updated">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.optional<Schema.Trim>;
    readonly workspaceRoot: Schema.optional<Schema.Trim>;
    readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly command: Schema.Trim;
      readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
      readonly runOnWorktreeCreate: Schema.Boolean;
    }>>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"project.deleted">;
  readonly payload: Schema.Struct<{
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly deletedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.created">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    readonly title: Schema.Trim;
    readonly model: Schema.Trim;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly branch: Schema.NullOr<Schema.Trim>;
    readonly worktreePath: Schema.NullOr<Schema.Trim>;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.deleted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly deletedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.meta-updated">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly title: Schema.optional<Schema.Trim>;
    readonly model: Schema.optional<Schema.Trim>;
    readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.runtime-mode-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.interaction-mode-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.message-sent">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
    readonly text: Schema.String;
    readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"image">;
      readonly id: Schema.Trim;
      readonly name: Schema.Trim;
      readonly mimeType: Schema.Trim;
      readonly sizeBytes: Schema.Int;
    }>]>>>;
    readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
    readonly streaming: Schema.Boolean;
    readonly createdAt: Schema.String;
    readonly updatedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-start-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
    readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
    readonly model: Schema.optional<Schema.Trim>;
    readonly modelOptions: Schema.optional<Schema.Struct<{
      readonly codex: Schema.optional<Schema.Struct<{
        readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
        readonly fastMode: Schema.optional<Schema.Boolean>;
      }>>;
      readonly claudeAgent: Schema.optional<Schema.Struct<{
        readonly thinking: Schema.optional<Schema.Boolean>;
        readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
        readonly fastMode: Schema.optional<Schema.Boolean>;
      }>>;
    }>>;
    readonly providerOptions: Schema.optional<Schema.Struct<{
      readonly codex: Schema.optional<Schema.Struct<{
        readonly binaryPath: Schema.optional<Schema.Trim>;
        readonly homePath: Schema.optional<Schema.Trim>;
      }>>;
      readonly claudeAgent: Schema.optional<Schema.Struct<{
        readonly binaryPath: Schema.optional<Schema.Trim>;
        readonly permissionMode: Schema.optional<Schema.Trim>;
        readonly maxThinkingTokens: Schema.optional<Schema.Int>;
      }>>;
    }>>;
    readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
    readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
    readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
    readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly planId: Schema.Trim;
    }>>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.approval-response-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
    readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.user-input-response-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
    readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnCount: Schema.Int;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.reverted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnCount: Schema.Int;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session-stop-requested">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly createdAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.session-set">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly session: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
      readonly providerName: Schema.NullOr<Schema.Trim>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly lastError: Schema.NullOr<Schema.Trim>;
      readonly updatedAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly proposedPlan: Schema.Struct<{
      readonly id: Schema.Trim;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly planMarkdown: Schema.Trim;
      readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
      readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.turn-diff-completed">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
    readonly checkpointTurnCount: Schema.Int;
    readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
    readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
    readonly files: Schema.$Array<Schema.Struct<{
      readonly path: Schema.Trim;
      readonly kind: Schema.Trim;
      readonly additions: Schema.Int;
      readonly deletions: Schema.Int;
    }>>;
    readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
    readonly completedAt: Schema.String;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.activity-appended">;
  readonly payload: Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly activity: Schema.Struct<{
      readonly id: Schema.brand<Schema.Trim, "EventId">;
      readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
      readonly kind: Schema.Trim;
      readonly summary: Schema.Trim;
      readonly payload: Schema.Unknown;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly sequence: Schema.optional<Schema.Int>;
      readonly createdAt: Schema.String;
    }>;
  }>;
  readonly sequence: Schema.Int;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
  readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
  readonly occurredAt: Schema.String;
  readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
  readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
  readonly metadata: Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly adapterKey: Schema.optional<Schema.Trim>;
    readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
    readonly ingestedAt: Schema.optional<Schema.String>;
  }>;
}>]>>;
type OrchestrationReplayEventsResult = typeof OrchestrationReplayEventsResult.Type;
declare const OrchestrationRpcSchemas: {
  readonly getSnapshot: {
    readonly input: Schema.Struct<{}>;
    readonly output: Schema.Struct<{
      readonly snapshotSequence: Schema.Int;
      readonly projects: Schema.$Array<Schema.Struct<{
        readonly id: Schema.brand<Schema.Trim, "ProjectId">;
        readonly title: Schema.Trim;
        readonly workspaceRoot: Schema.Trim;
        readonly defaultModel: Schema.NullOr<Schema.Trim>;
        readonly scripts: Schema.$Array<Schema.Struct<{
          readonly id: Schema.Trim;
          readonly name: Schema.Trim;
          readonly command: Schema.Trim;
          readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
          readonly runOnWorktreeCreate: Schema.Boolean;
        }>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
        readonly deletedAt: Schema.NullOr<Schema.String>;
      }>>;
      readonly threads: Schema.$Array<Schema.Struct<{
        readonly id: Schema.brand<Schema.Trim, "ThreadId">;
        readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
        readonly title: Schema.Trim;
        readonly model: Schema.Trim;
        readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
        readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
        readonly branch: Schema.NullOr<Schema.Trim>;
        readonly worktreePath: Schema.NullOr<Schema.Trim>;
        readonly latestTurn: Schema.NullOr<Schema.Struct<{
          readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
          readonly state: Schema.Literals<readonly ["running", "interrupted", "completed", "error"]>;
          readonly requestedAt: Schema.String;
          readonly startedAt: Schema.NullOr<Schema.String>;
          readonly completedAt: Schema.NullOr<Schema.String>;
          readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
          readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
            readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
            readonly planId: Schema.Trim;
          }>>;
        }>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
        readonly deletedAt: Schema.NullOr<Schema.String>;
        readonly messages: Schema.$Array<Schema.Struct<{
          readonly id: Schema.brand<Schema.Trim, "MessageId">;
          readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
          readonly text: Schema.String;
          readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly type: Schema.Literal<"image">;
            readonly id: Schema.Trim;
            readonly name: Schema.Trim;
            readonly mimeType: Schema.Trim;
            readonly sizeBytes: Schema.Int;
          }>]>>>;
          readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly streaming: Schema.Boolean;
          readonly createdAt: Schema.String;
          readonly updatedAt: Schema.String;
        }>>;
        readonly proposedPlans: Schema.withDecodingDefault<Schema.$Array<Schema.Struct<{
          readonly id: Schema.Trim;
          readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly planMarkdown: Schema.Trim;
          readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
          readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
          readonly createdAt: Schema.String;
          readonly updatedAt: Schema.String;
        }>>>;
        readonly activities: Schema.$Array<Schema.Struct<{
          readonly id: Schema.brand<Schema.Trim, "EventId">;
          readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
          readonly kind: Schema.Trim;
          readonly summary: Schema.Trim;
          readonly payload: Schema.Unknown;
          readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly sequence: Schema.optional<Schema.Int>;
          readonly createdAt: Schema.String;
        }>>;
        readonly checkpoints: Schema.$Array<Schema.Struct<{
          readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
          readonly checkpointTurnCount: Schema.Int;
          readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
          readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
          readonly files: Schema.$Array<Schema.Struct<{
            readonly path: Schema.Trim;
            readonly kind: Schema.Trim;
            readonly additions: Schema.Int;
            readonly deletions: Schema.Int;
          }>>;
          readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
          readonly completedAt: Schema.String;
        }>>;
        readonly session: Schema.NullOr<Schema.Struct<{
          readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
          readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
          readonly providerName: Schema.NullOr<Schema.Trim>;
          readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
          readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly lastError: Schema.NullOr<Schema.Trim>;
          readonly updatedAt: Schema.String;
        }>>;
      }>>;
      readonly updatedAt: Schema.String;
    }>;
  };
  readonly dispatchCommand: {
    readonly input: Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"project.create">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly workspaceRoot: Schema.Trim;
      readonly defaultModel: Schema.optional<Schema.Trim>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.meta.update">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly workspaceRoot: Schema.optional<Schema.Trim>;
      readonly defaultModel: Schema.optional<Schema.Trim>;
      readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.delete">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.create">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly model: Schema.Trim;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly branch: Schema.NullOr<Schema.Trim>;
      readonly worktreePath: Schema.NullOr<Schema.Trim>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.delete">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.meta.update">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.runtime-mode.set">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.interaction-mode.set">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn.start">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly message: Schema.Struct<{
        readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
        readonly role: Schema.Literal<"user">;
        readonly text: Schema.String;
        readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly type: Schema.Literal<"image">;
          readonly name: Schema.Trim;
          readonly mimeType: Schema.Trim;
          readonly sizeBytes: Schema.Int;
          readonly dataUrl: Schema.Trim;
        }>]>>;
      }>;
      readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly modelOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly thinking: Schema.optional<Schema.Boolean>;
          readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
      }>>;
      readonly providerOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly homePath: Schema.optional<Schema.Trim>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly permissionMode: Schema.optional<Schema.Trim>;
          readonly maxThinkingTokens: Schema.optional<Schema.Int>;
        }>>;
      }>>;
      readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn.interrupt">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.approval.respond">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.user-input.respond">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.checkpoint.revert">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.session.stop">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly createdAt: Schema.String;
    }>]>;
    readonly output: Schema.Struct<{
      readonly sequence: Schema.Int;
    }>;
  };
  readonly getTurnDiff: {
    readonly input: Schema.Struct<{
      readonly fromTurnCount: Schema.Int;
      readonly toTurnCount: Schema.Int;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    }>;
    readonly output: Schema.Struct<{
      readonly fromTurnCount: Schema.Int;
      readonly toTurnCount: Schema.Int;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly diff: Schema.String;
    }>;
  };
  readonly getFullThreadDiff: {
    readonly input: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly toTurnCount: Schema.Int;
    }>;
    readonly output: Schema.Struct<{
      readonly fromTurnCount: Schema.Int;
      readonly toTurnCount: Schema.Int;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly diff: Schema.String;
    }>;
  };
  readonly replayEvents: {
    readonly input: Schema.Struct<{
      readonly fromSequenceExclusive: Schema.Int;
    }>;
    readonly output: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"project.created">;
      readonly payload: Schema.Struct<{
        readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
        readonly title: Schema.Trim;
        readonly workspaceRoot: Schema.Trim;
        readonly defaultModel: Schema.NullOr<Schema.Trim>;
        readonly scripts: Schema.$Array<Schema.Struct<{
          readonly id: Schema.Trim;
          readonly name: Schema.Trim;
          readonly command: Schema.Trim;
          readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
          readonly runOnWorktreeCreate: Schema.Boolean;
        }>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.meta-updated">;
      readonly payload: Schema.Struct<{
        readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
        readonly title: Schema.optional<Schema.Trim>;
        readonly workspaceRoot: Schema.optional<Schema.Trim>;
        readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
        readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
          readonly id: Schema.Trim;
          readonly name: Schema.Trim;
          readonly command: Schema.Trim;
          readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
          readonly runOnWorktreeCreate: Schema.Boolean;
        }>>>;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.deleted">;
      readonly payload: Schema.Struct<{
        readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
        readonly deletedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.created">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
        readonly title: Schema.Trim;
        readonly model: Schema.Trim;
        readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
        readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
        readonly branch: Schema.NullOr<Schema.Trim>;
        readonly worktreePath: Schema.NullOr<Schema.Trim>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.deleted">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly deletedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.meta-updated">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly title: Schema.optional<Schema.Trim>;
        readonly model: Schema.optional<Schema.Trim>;
        readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
        readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.runtime-mode-set">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.interaction-mode-set">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.message-sent">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
        readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
        readonly text: Schema.String;
        readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly type: Schema.Literal<"image">;
          readonly id: Schema.Trim;
          readonly name: Schema.Trim;
          readonly mimeType: Schema.Trim;
          readonly sizeBytes: Schema.Int;
        }>]>>>;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly streaming: Schema.Boolean;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn-start-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
        readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
        readonly model: Schema.optional<Schema.Trim>;
        readonly modelOptions: Schema.optional<Schema.Struct<{
          readonly codex: Schema.optional<Schema.Struct<{
            readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
            readonly fastMode: Schema.optional<Schema.Boolean>;
          }>>;
          readonly claudeAgent: Schema.optional<Schema.Struct<{
            readonly thinking: Schema.optional<Schema.Boolean>;
            readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
            readonly fastMode: Schema.optional<Schema.Boolean>;
          }>>;
        }>>;
        readonly providerOptions: Schema.optional<Schema.Struct<{
          readonly codex: Schema.optional<Schema.Struct<{
            readonly binaryPath: Schema.optional<Schema.Trim>;
            readonly homePath: Schema.optional<Schema.Trim>;
          }>>;
          readonly claudeAgent: Schema.optional<Schema.Struct<{
            readonly binaryPath: Schema.optional<Schema.Trim>;
            readonly permissionMode: Schema.optional<Schema.Trim>;
            readonly maxThinkingTokens: Schema.optional<Schema.Int>;
          }>>;
        }>>;
        readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
        readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
        readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
        readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
          readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
          readonly planId: Schema.Trim;
        }>>;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.approval-response-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
        readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.user-input-response-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
        readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly turnCount: Schema.Int;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.reverted">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly turnCount: Schema.Int;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.session-stop-requested">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly createdAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.session-set">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly session: Schema.Struct<{
          readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
          readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
          readonly providerName: Schema.NullOr<Schema.Trim>;
          readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
          readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly lastError: Schema.NullOr<Schema.Trim>;
          readonly updatedAt: Schema.String;
        }>;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly proposedPlan: Schema.Struct<{
          readonly id: Schema.Trim;
          readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly planMarkdown: Schema.Trim;
          readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
          readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
          readonly createdAt: Schema.String;
          readonly updatedAt: Schema.String;
        }>;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn-diff-completed">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
        readonly checkpointTurnCount: Schema.Int;
        readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
        readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
        readonly files: Schema.$Array<Schema.Struct<{
          readonly path: Schema.Trim;
          readonly kind: Schema.Trim;
          readonly additions: Schema.Int;
          readonly deletions: Schema.Int;
        }>>;
        readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
        readonly completedAt: Schema.String;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.activity-appended">;
      readonly payload: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly activity: Schema.Struct<{
          readonly id: Schema.brand<Schema.Trim, "EventId">;
          readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
          readonly kind: Schema.Trim;
          readonly summary: Schema.Trim;
          readonly payload: Schema.Unknown;
          readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
          readonly sequence: Schema.optional<Schema.Int>;
          readonly createdAt: Schema.String;
        }>;
      }>;
      readonly sequence: Schema.Int;
      readonly eventId: Schema.brand<Schema.Trim, "EventId">;
      readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
      readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
      readonly occurredAt: Schema.String;
      readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
      readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
      readonly metadata: Schema.Struct<{
        readonly providerTurnId: Schema.optional<Schema.Trim>;
        readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
        readonly adapterKey: Schema.optional<Schema.Trim>;
        readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
        readonly ingestedAt: Schema.optional<Schema.String>;
      }>;
    }>]>>;
  };
};
//#endregion
//#region src/editor.d.ts
declare const EDITORS: readonly [{
  readonly id: "cursor";
  readonly label: "Cursor";
  readonly command: "cursor";
}, {
  readonly id: "vscode";
  readonly label: "VS Code";
  readonly command: "code";
}, {
  readonly id: "zed";
  readonly label: "Zed";
  readonly command: "zed";
}, {
  readonly id: "antigravity";
  readonly label: "Antigravity";
  readonly command: "agy";
}, {
  readonly id: "file-manager";
  readonly label: "File Manager";
  readonly command: null;
}];
declare const EditorId: Schema.Literals<("cursor" | "vscode" | "zed" | "antigravity" | "file-manager")[]>;
type EditorId = typeof EditorId.Type;
declare const OpenInEditorInput: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly editor: Schema.Literals<("cursor" | "vscode" | "zed" | "antigravity" | "file-manager")[]>;
}>;
type OpenInEditorInput = typeof OpenInEditorInput.Type;
//#endregion
//#region src/ipc.d.ts
interface ContextMenuItem<T extends string = string> {
  id: T;
  label: string;
  destructive?: boolean;
}
type DesktopUpdateStatus = "disabled" | "idle" | "checking" | "up-to-date" | "available" | "downloading" | "downloaded" | "error";
type DesktopRuntimeArch = "arm64" | "x64" | "other";
type DesktopTheme = "light" | "dark" | "system";
interface DesktopRuntimeInfo {
  hostArch: DesktopRuntimeArch;
  appArch: DesktopRuntimeArch;
  runningUnderArm64Translation: boolean;
}
interface DesktopUpdateState {
  enabled: boolean;
  status: DesktopUpdateStatus;
  currentVersion: string;
  hostArch: DesktopRuntimeArch;
  appArch: DesktopRuntimeArch;
  runningUnderArm64Translation: boolean;
  availableVersion: string | null;
  downloadedVersion: string | null;
  downloadPercent: number | null;
  checkedAt: string | null;
  message: string | null;
  errorContext: "check" | "download" | "install" | null;
  canRetry: boolean;
}
interface DesktopUpdateActionResult {
  accepted: boolean;
  completed: boolean;
  state: DesktopUpdateState;
}
interface DesktopBridge {
  getWsUrl: () => string | null;
  pickFolder: () => Promise<string | null>;
  confirm: (message: string) => Promise<boolean>;
  setTheme: (theme: DesktopTheme) => Promise<void>;
  showContextMenu: <T extends string>(items: readonly ContextMenuItem<T>[], position?: {
    x: number;
    y: number;
  }) => Promise<T | null>;
  openExternal: (url: string) => Promise<boolean>;
  onMenuAction: (listener: (action: string) => void) => () => void;
  getUpdateState: () => Promise<DesktopUpdateState>;
  downloadUpdate: () => Promise<DesktopUpdateActionResult>;
  installUpdate: () => Promise<DesktopUpdateActionResult>;
  onUpdateState: (listener: (state: DesktopUpdateState) => void) => () => void;
}
interface NativeApi {
  dialogs: {
    pickFolder: () => Promise<string | null>;
    confirm: (message: string) => Promise<boolean>;
  };
  terminal: {
    open: (input: TerminalOpenInput) => Promise<TerminalSessionSnapshot>;
    write: (input: TerminalWriteInput) => Promise<void>;
    resize: (input: TerminalResizeInput) => Promise<void>;
    clear: (input: TerminalClearInput) => Promise<void>;
    restart: (input: TerminalRestartInput) => Promise<TerminalSessionSnapshot>;
    close: (input: TerminalCloseInput) => Promise<void>;
    onEvent: (callback: (event: TerminalEvent) => void) => () => void;
  };
  projects: {
    searchEntries: (input: ProjectSearchEntriesInput) => Promise<ProjectSearchEntriesResult>;
    writeFile: (input: ProjectWriteFileInput) => Promise<ProjectWriteFileResult>;
  };
  shell: {
    openInEditor: (cwd: string, editor: EditorId) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
  };
  git: {
    listBranches: (input: GitListBranchesInput) => Promise<GitListBranchesResult>;
    createWorktree: (input: GitCreateWorktreeInput) => Promise<GitCreateWorktreeResult>;
    removeWorktree: (input: GitRemoveWorktreeInput) => Promise<void>;
    createBranch: (input: GitCreateBranchInput) => Promise<void>;
    checkout: (input: GitCheckoutInput) => Promise<void>;
    init: (input: GitInitInput) => Promise<void>;
    resolvePullRequest: (input: GitPullRequestRefInput) => Promise<GitResolvePullRequestResult>;
    preparePullRequestThread: (input: GitPreparePullRequestThreadInput) => Promise<GitPreparePullRequestThreadResult>;
    pull: (input: GitPullInput) => Promise<GitPullResult>;
    status: (input: GitStatusInput) => Promise<GitStatusResult>;
    runStackedAction: (input: GitRunStackedActionInput) => Promise<GitRunStackedActionResult>;
  };
  contextMenu: {
    show: <T extends string>(items: readonly ContextMenuItem<T>[], position?: {
      x: number;
      y: number;
    }) => Promise<T | null>;
  };
  server: {
    getConfig: () => Promise<ServerConfig>;
    upsertKeybinding: (input: ServerUpsertKeybindingInput) => Promise<ServerUpsertKeybindingResult>;
  };
  orchestration: {
    getSnapshot: () => Promise<OrchestrationReadModel>;
    dispatchCommand: (command: ClientOrchestrationCommand) => Promise<{
      sequence: number;
    }>;
    getTurnDiff: (input: OrchestrationGetTurnDiffInput) => Promise<OrchestrationGetTurnDiffResult>;
    getFullThreadDiff: (input: OrchestrationGetFullThreadDiffInput) => Promise<OrchestrationGetFullThreadDiffResult>;
    replayEvents: (fromSequenceExclusive: number) => Promise<OrchestrationEvent[]>;
    onDomainEvent: (callback: (event: OrchestrationEvent) => void) => () => void;
  };
}
//#endregion
//#region src/provider.d.ts
declare const ProviderSession: Schema.Struct<{
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly status: Schema.Literals<readonly ["connecting", "ready", "running", "error", "closed"]>;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
  readonly cwd: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly resumeCursor: Schema.optional<Schema.Unknown>;
  readonly activeTurnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly createdAt: Schema.String;
  readonly updatedAt: Schema.String;
  readonly lastError: Schema.optional<Schema.Trim>;
}>;
type ProviderSession = typeof ProviderSession.Type;
declare const ProviderSessionStartInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
  readonly cwd: Schema.optional<Schema.Trim>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly resumeCursor: Schema.optional<Schema.Unknown>;
  readonly approvalPolicy: Schema.optional<Schema.Literals<readonly ["untrusted", "on-failure", "on-request", "never"]>>;
  readonly sandboxMode: Schema.optional<Schema.Literals<readonly ["read-only", "workspace-write", "danger-full-access"]>>;
  readonly providerOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly homePath: Schema.optional<Schema.Trim>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly binaryPath: Schema.optional<Schema.Trim>;
      readonly permissionMode: Schema.optional<Schema.Trim>;
      readonly maxThinkingTokens: Schema.optional<Schema.Int>;
    }>>;
  }>>;
  readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
}>;
type ProviderSessionStartInput = typeof ProviderSessionStartInput.Type;
declare const ProviderSendTurnInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly input: Schema.optional<Schema.Trim>;
  readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"image">;
    readonly id: Schema.Trim;
    readonly name: Schema.Trim;
    readonly mimeType: Schema.Trim;
    readonly sizeBytes: Schema.Int;
  }>]>>>;
  readonly model: Schema.optional<Schema.Trim>;
  readonly modelOptions: Schema.optional<Schema.Struct<{
    readonly codex: Schema.optional<Schema.Struct<{
      readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
    readonly claudeAgent: Schema.optional<Schema.Struct<{
      readonly thinking: Schema.optional<Schema.Boolean>;
      readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
      readonly fastMode: Schema.optional<Schema.Boolean>;
    }>>;
  }>>;
  readonly interactionMode: Schema.optional<Schema.Literals<readonly ["default", "plan"]>>;
}>;
type ProviderSendTurnInput = typeof ProviderSendTurnInput.Type;
declare const ProviderTurnStartResult: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
  readonly resumeCursor: Schema.optional<Schema.Unknown>;
}>;
type ProviderTurnStartResult = typeof ProviderTurnStartResult.Type;
declare const ProviderInterruptTurnInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
}>;
type ProviderInterruptTurnInput = typeof ProviderInterruptTurnInput.Type;
declare const ProviderStopSessionInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
}>;
type ProviderStopSessionInput = typeof ProviderStopSessionInput.Type;
declare const ProviderRespondToRequestInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
}>;
type ProviderRespondToRequestInput = typeof ProviderRespondToRequestInput.Type;
declare const ProviderRespondToUserInputInput: Schema.Struct<{
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
  readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
}>;
type ProviderRespondToUserInputInput = typeof ProviderRespondToUserInputInput.Type;
declare const ProviderEvent: Schema.Struct<{
  readonly id: Schema.brand<Schema.Trim, "EventId">;
  readonly kind: Schema.Literals<readonly ["session", "notification", "request", "error"]>;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly method: Schema.Trim;
  readonly message: Schema.optional<Schema.Trim>;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
  readonly requestKind: Schema.optional<Schema.Literals<readonly ["command", "file-read", "file-change"]>>;
  readonly textDelta: Schema.optional<Schema.String>;
  readonly payload: Schema.optional<Schema.Unknown>;
}>;
type ProviderEvent = typeof ProviderEvent.Type;
//#endregion
//#region src/providerRuntime.d.ts
declare const RuntimeEventRawSource: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
type RuntimeEventRawSource = typeof RuntimeEventRawSource.Type;
declare const RuntimeEventRaw: Schema.Struct<{
  readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
  readonly method: Schema.optional<Schema.Trim>;
  readonly messageType: Schema.optional<Schema.Trim>;
  readonly payload: Schema.Unknown;
}>;
type RuntimeEventRaw = typeof RuntimeEventRaw.Type;
declare const ProviderRequestId: Schema.Trim;
type ProviderRequestId = typeof ProviderRequestId.Type;
declare const ProviderRefs: Schema.Struct<{
  readonly providerTurnId: Schema.optional<Schema.Trim>;
  readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
  readonly providerRequestId: Schema.optional<Schema.Trim>;
}>;
type ProviderRefs = typeof ProviderRefs.Type;
declare const RuntimeSessionState: Schema.Literals<readonly ["starting", "ready", "running", "waiting", "stopped", "error"]>;
type RuntimeSessionState = typeof RuntimeSessionState.Type;
declare const RuntimeThreadState: Schema.Literals<readonly ["active", "idle", "archived", "closed", "compacted", "error"]>;
type RuntimeThreadState = typeof RuntimeThreadState.Type;
declare const RuntimeTurnState: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
type RuntimeTurnState = typeof RuntimeTurnState.Type;
declare const RuntimePlanStepStatus: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
type RuntimePlanStepStatus = typeof RuntimePlanStepStatus.Type;
declare const RuntimeItemStatus: Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>;
type RuntimeItemStatus = typeof RuntimeItemStatus.Type;
declare const RuntimeContentStreamKind: Schema.Literals<readonly ["assistant_text", "reasoning_text", "reasoning_summary_text", "plan_text", "command_output", "file_change_output", "unknown"]>;
type RuntimeContentStreamKind = typeof RuntimeContentStreamKind.Type;
declare const RuntimeSessionExitKind: Schema.Literals<readonly ["graceful", "error"]>;
type RuntimeSessionExitKind = typeof RuntimeSessionExitKind.Type;
declare const RuntimeErrorClass: Schema.Literals<readonly ["provider_error", "transport_error", "permission_error", "validation_error", "unknown"]>;
type RuntimeErrorClass = typeof RuntimeErrorClass.Type;
declare const TOOL_LIFECYCLE_ITEM_TYPES: readonly ["command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view"];
declare const ToolLifecycleItemType: Schema.Literals<readonly ["command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view"]>;
type ToolLifecycleItemType = typeof ToolLifecycleItemType.Type;
declare function isToolLifecycleItemType(value: string): value is ToolLifecycleItemType;
declare const CanonicalItemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
type CanonicalItemType = typeof CanonicalItemType.Type;
declare const CanonicalRequestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
type CanonicalRequestType = typeof CanonicalRequestType.Type;
declare const ProviderRuntimeEventType: Schema.Literals<readonly ["session.started", "session.configured", "session.state.changed", "session.exited", "thread.started", "thread.state.changed", "thread.metadata.updated", "thread.token-usage.updated", "thread.realtime.started", "thread.realtime.item-added", "thread.realtime.audio.delta", "thread.realtime.error", "thread.realtime.closed", "turn.started", "turn.completed", "turn.aborted", "turn.plan.updated", "turn.proposed.delta", "turn.proposed.completed", "turn.diff.updated", "item.started", "item.updated", "item.completed", "content.delta", "request.opened", "request.resolved", "user-input.requested", "user-input.resolved", "task.started", "task.progress", "task.completed", "hook.started", "hook.progress", "hook.completed", "tool.progress", "tool.summary", "auth.status", "account.updated", "account.rate-limits.updated", "mcp.status.updated", "mcp.oauth.completed", "model.rerouted", "config.warning", "deprecation.notice", "files.persisted", "runtime.warning", "runtime.error"]>;
type ProviderRuntimeEventType = typeof ProviderRuntimeEventType.Type;
declare const ProviderRuntimeEventBase: Schema.Struct<{
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeEventBase = typeof ProviderRuntimeEventBase.Type;
declare const SessionStartedPayload: Schema.Struct<{
  readonly message: Schema.optional<Schema.Trim>;
  readonly resume: Schema.optional<Schema.Unknown>;
}>;
type SessionStartedPayload = typeof SessionStartedPayload.Type;
declare const SessionConfiguredPayload: Schema.Struct<{
  readonly config: Schema.$Record<Schema.String, Schema.Unknown>;
}>;
type SessionConfiguredPayload = typeof SessionConfiguredPayload.Type;
declare const SessionStateChangedPayload: Schema.Struct<{
  readonly state: Schema.Literals<readonly ["starting", "ready", "running", "waiting", "stopped", "error"]>;
  readonly reason: Schema.optional<Schema.Trim>;
  readonly detail: Schema.optional<Schema.Unknown>;
}>;
type SessionStateChangedPayload = typeof SessionStateChangedPayload.Type;
declare const SessionExitedPayload: Schema.Struct<{
  readonly reason: Schema.optional<Schema.Trim>;
  readonly recoverable: Schema.optional<Schema.Boolean>;
  readonly exitKind: Schema.optional<Schema.Literals<readonly ["graceful", "error"]>>;
}>;
type SessionExitedPayload = typeof SessionExitedPayload.Type;
declare const ThreadStartedPayload: Schema.Struct<{
  readonly providerThreadId: Schema.optional<Schema.Trim>;
}>;
type ThreadStartedPayload = typeof ThreadStartedPayload.Type;
declare const ThreadStateChangedPayload: Schema.Struct<{
  readonly state: Schema.Literals<readonly ["active", "idle", "archived", "closed", "compacted", "error"]>;
  readonly detail: Schema.optional<Schema.Unknown>;
}>;
type ThreadStateChangedPayload = typeof ThreadStateChangedPayload.Type;
declare const ThreadMetadataUpdatedPayload: Schema.Struct<{
  readonly name: Schema.optional<Schema.Trim>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type ThreadMetadataUpdatedPayload = typeof ThreadMetadataUpdatedPayload.Type;
declare const ThreadTokenUsageUpdatedPayload: Schema.Struct<{
  readonly usage: Schema.Unknown;
}>;
type ThreadTokenUsageUpdatedPayload = typeof ThreadTokenUsageUpdatedPayload.Type;
declare const ThreadRealtimeStartedPayload: Schema.Struct<{
  readonly realtimeSessionId: Schema.optional<Schema.Trim>;
}>;
type ThreadRealtimeStartedPayload = typeof ThreadRealtimeStartedPayload.Type;
declare const ThreadRealtimeItemAddedPayload: Schema.Struct<{
  readonly item: Schema.Unknown;
}>;
type ThreadRealtimeItemAddedPayload = typeof ThreadRealtimeItemAddedPayload.Type;
declare const ThreadRealtimeAudioDeltaPayload: Schema.Struct<{
  readonly audio: Schema.Unknown;
}>;
type ThreadRealtimeAudioDeltaPayload = typeof ThreadRealtimeAudioDeltaPayload.Type;
declare const ThreadRealtimeErrorPayload: Schema.Struct<{
  readonly message: Schema.Trim;
}>;
type ThreadRealtimeErrorPayload = typeof ThreadRealtimeErrorPayload.Type;
declare const ThreadRealtimeClosedPayload: Schema.Struct<{
  readonly reason: Schema.optional<Schema.Trim>;
}>;
type ThreadRealtimeClosedPayload = typeof ThreadRealtimeClosedPayload.Type;
declare const TurnStartedPayload: Schema.Struct<{
  readonly model: Schema.optional<Schema.Trim>;
  readonly effort: Schema.optional<Schema.Trim>;
}>;
type TurnStartedPayload = typeof TurnStartedPayload.Type;
declare const TurnCompletedPayload: Schema.Struct<{
  readonly state: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
  readonly stopReason: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly usage: Schema.optional<Schema.Unknown>;
  readonly modelUsage: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly totalCostUsd: Schema.optional<Schema.Number>;
  readonly errorMessage: Schema.optional<Schema.Trim>;
}>;
type TurnCompletedPayload = typeof TurnCompletedPayload.Type;
declare const TurnAbortedPayload: Schema.Struct<{
  readonly reason: Schema.Trim;
}>;
type TurnAbortedPayload = typeof TurnAbortedPayload.Type;
declare const RuntimePlanStep: Schema.Struct<{
  readonly step: Schema.Trim;
  readonly status: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
}>;
type RuntimePlanStep = typeof RuntimePlanStep.Type;
declare const TurnPlanUpdatedPayload: Schema.Struct<{
  readonly explanation: Schema.optional<Schema.NullOr<Schema.Trim>>;
  readonly plan: Schema.$Array<Schema.Struct<{
    readonly step: Schema.Trim;
    readonly status: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
  }>>;
}>;
type TurnPlanUpdatedPayload = typeof TurnPlanUpdatedPayload.Type;
declare const TurnProposedDeltaPayload: Schema.Struct<{
  readonly delta: Schema.String;
}>;
type TurnProposedDeltaPayload = typeof TurnProposedDeltaPayload.Type;
declare const TurnProposedCompletedPayload: Schema.Struct<{
  readonly planMarkdown: Schema.Trim;
}>;
type TurnProposedCompletedPayload = typeof TurnProposedCompletedPayload.Type;
declare const TurnDiffUpdatedPayload: Schema.Struct<{
  readonly unifiedDiff: Schema.String;
}>;
type TurnDiffUpdatedPayload = typeof TurnDiffUpdatedPayload.Type;
declare const ItemLifecyclePayload: Schema.Struct<{
  readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
  readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
  readonly title: Schema.optional<Schema.Trim>;
  readonly detail: Schema.optional<Schema.Trim>;
  readonly data: Schema.optional<Schema.Unknown>;
}>;
type ItemLifecyclePayload = typeof ItemLifecyclePayload.Type;
declare const ContentDeltaPayload: Schema.Struct<{
  readonly streamKind: Schema.Literals<readonly ["assistant_text", "reasoning_text", "reasoning_summary_text", "plan_text", "command_output", "file_change_output", "unknown"]>;
  readonly delta: Schema.String;
  readonly contentIndex: Schema.optional<Schema.Int>;
  readonly summaryIndex: Schema.optional<Schema.Int>;
}>;
type ContentDeltaPayload = typeof ContentDeltaPayload.Type;
declare const RequestOpenedPayload: Schema.Struct<{
  readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
  readonly detail: Schema.optional<Schema.Trim>;
  readonly args: Schema.optional<Schema.Unknown>;
}>;
type RequestOpenedPayload = typeof RequestOpenedPayload.Type;
declare const RequestResolvedPayload: Schema.Struct<{
  readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
  readonly decision: Schema.optional<Schema.Trim>;
  readonly resolution: Schema.optional<Schema.Unknown>;
}>;
type RequestResolvedPayload = typeof RequestResolvedPayload.Type;
declare const UserInputQuestionOption: Schema.Struct<{
  readonly label: Schema.Trim;
  readonly description: Schema.Trim;
}>;
type UserInputQuestionOption = typeof UserInputQuestionOption.Type;
declare const UserInputQuestion: Schema.Struct<{
  readonly id: Schema.Trim;
  readonly header: Schema.Trim;
  readonly question: Schema.Trim;
  readonly options: Schema.$Array<Schema.Struct<{
    readonly label: Schema.Trim;
    readonly description: Schema.Trim;
  }>>;
  readonly multiSelect: Schema.withConstructorDefault<Schema.optional<Schema.Boolean>>;
}>;
type UserInputQuestion = typeof UserInputQuestion.Type;
declare const UserInputRequestedPayload: Schema.Struct<{
  readonly questions: Schema.$Array<Schema.Struct<{
    readonly id: Schema.Trim;
    readonly header: Schema.Trim;
    readonly question: Schema.Trim;
    readonly options: Schema.$Array<Schema.Struct<{
      readonly label: Schema.Trim;
      readonly description: Schema.Trim;
    }>>;
    readonly multiSelect: Schema.withConstructorDefault<Schema.optional<Schema.Boolean>>;
  }>>;
}>;
type UserInputRequestedPayload = typeof UserInputRequestedPayload.Type;
declare const UserInputResolvedPayload: Schema.Struct<{
  readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
}>;
type UserInputResolvedPayload = typeof UserInputResolvedPayload.Type;
declare const TaskStartedPayload: Schema.Struct<{
  readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
  readonly description: Schema.optional<Schema.Trim>;
  readonly taskType: Schema.optional<Schema.Trim>;
}>;
type TaskStartedPayload = typeof TaskStartedPayload.Type;
declare const TaskProgressPayload: Schema.Struct<{
  readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
  readonly description: Schema.Trim;
  readonly summary: Schema.optional<Schema.Trim>;
  readonly usage: Schema.optional<Schema.Unknown>;
  readonly lastToolName: Schema.optional<Schema.Trim>;
}>;
type TaskProgressPayload = typeof TaskProgressPayload.Type;
declare const TaskCompletedPayload: Schema.Struct<{
  readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
  readonly status: Schema.Literals<readonly ["completed", "failed", "stopped"]>;
  readonly summary: Schema.optional<Schema.Trim>;
  readonly usage: Schema.optional<Schema.Unknown>;
}>;
type TaskCompletedPayload = typeof TaskCompletedPayload.Type;
declare const HookStartedPayload: Schema.Struct<{
  readonly hookId: Schema.Trim;
  readonly hookName: Schema.Trim;
  readonly hookEvent: Schema.Trim;
}>;
type HookStartedPayload = typeof HookStartedPayload.Type;
declare const HookProgressPayload: Schema.Struct<{
  readonly hookId: Schema.Trim;
  readonly output: Schema.optional<Schema.String>;
  readonly stdout: Schema.optional<Schema.String>;
  readonly stderr: Schema.optional<Schema.String>;
}>;
type HookProgressPayload = typeof HookProgressPayload.Type;
declare const HookCompletedPayload: Schema.Struct<{
  readonly hookId: Schema.Trim;
  readonly outcome: Schema.Literals<readonly ["success", "error", "cancelled"]>;
  readonly output: Schema.optional<Schema.String>;
  readonly stdout: Schema.optional<Schema.String>;
  readonly stderr: Schema.optional<Schema.String>;
  readonly exitCode: Schema.optional<Schema.Int>;
}>;
type HookCompletedPayload = typeof HookCompletedPayload.Type;
declare const ToolProgressPayload: Schema.Struct<{
  readonly toolUseId: Schema.optional<Schema.Trim>;
  readonly toolName: Schema.optional<Schema.Trim>;
  readonly summary: Schema.optional<Schema.Trim>;
  readonly elapsedSeconds: Schema.optional<Schema.Number>;
}>;
type ToolProgressPayload = typeof ToolProgressPayload.Type;
declare const ToolSummaryPayload: Schema.Struct<{
  readonly summary: Schema.Trim;
  readonly precedingToolUseIds: Schema.optional<Schema.$Array<Schema.Trim>>;
}>;
type ToolSummaryPayload = typeof ToolSummaryPayload.Type;
declare const AuthStatusPayload: Schema.Struct<{
  readonly isAuthenticating: Schema.optional<Schema.Boolean>;
  readonly output: Schema.optional<Schema.$Array<Schema.String>>;
  readonly error: Schema.optional<Schema.Trim>;
}>;
type AuthStatusPayload = typeof AuthStatusPayload.Type;
declare const AccountUpdatedPayload: Schema.Struct<{
  readonly account: Schema.Unknown;
}>;
type AccountUpdatedPayload = typeof AccountUpdatedPayload.Type;
declare const AccountRateLimitsUpdatedPayload: Schema.Struct<{
  readonly rateLimits: Schema.Unknown;
}>;
type AccountRateLimitsUpdatedPayload = typeof AccountRateLimitsUpdatedPayload.Type;
declare const McpStatusUpdatedPayload: Schema.Struct<{
  readonly status: Schema.Unknown;
}>;
type McpStatusUpdatedPayload = typeof McpStatusUpdatedPayload.Type;
declare const McpOauthCompletedPayload: Schema.Struct<{
  readonly success: Schema.Boolean;
  readonly name: Schema.optional<Schema.Trim>;
  readonly error: Schema.optional<Schema.Trim>;
}>;
type McpOauthCompletedPayload = typeof McpOauthCompletedPayload.Type;
declare const ModelReroutedPayload: Schema.Struct<{
  readonly fromModel: Schema.Trim;
  readonly toModel: Schema.Trim;
  readonly reason: Schema.Trim;
}>;
type ModelReroutedPayload = typeof ModelReroutedPayload.Type;
declare const ConfigWarningPayload: Schema.Struct<{
  readonly summary: Schema.Trim;
  readonly details: Schema.optional<Schema.Trim>;
  readonly path: Schema.optional<Schema.Trim>;
  readonly range: Schema.optional<Schema.Unknown>;
}>;
type ConfigWarningPayload = typeof ConfigWarningPayload.Type;
declare const DeprecationNoticePayload: Schema.Struct<{
  readonly summary: Schema.Trim;
  readonly details: Schema.optional<Schema.Trim>;
}>;
type DeprecationNoticePayload = typeof DeprecationNoticePayload.Type;
declare const FilesPersistedPayload: Schema.Struct<{
  readonly files: Schema.$Array<Schema.Struct<{
    readonly filename: Schema.Trim;
    readonly fileId: Schema.Trim;
  }>>;
  readonly failed: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly filename: Schema.Trim;
    readonly error: Schema.Trim;
  }>>>;
}>;
type FilesPersistedPayload = typeof FilesPersistedPayload.Type;
declare const RuntimeWarningPayload: Schema.Struct<{
  readonly message: Schema.Trim;
  readonly detail: Schema.optional<Schema.Unknown>;
}>;
type RuntimeWarningPayload = typeof RuntimeWarningPayload.Type;
declare const RuntimeErrorPayload: Schema.Struct<{
  readonly message: Schema.Trim;
  readonly class: Schema.optional<Schema.Literals<readonly ["provider_error", "transport_error", "permission_error", "validation_error", "unknown"]>>;
  readonly detail: Schema.optional<Schema.Unknown>;
}>;
type RuntimeErrorPayload = typeof RuntimeErrorPayload.Type;
declare const ProviderRuntimeSessionStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"session.started">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.optional<Schema.Trim>;
    readonly resume: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeSessionStartedEvent = typeof ProviderRuntimeSessionStartedEvent.Type;
declare const ProviderRuntimeSessionConfiguredEvent: Schema.Struct<{
  readonly type: Schema.Literal<"session.configured">;
  readonly payload: Schema.Struct<{
    readonly config: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeSessionConfiguredEvent = typeof ProviderRuntimeSessionConfiguredEvent.Type;
declare const ProviderRuntimeSessionStateChangedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"session.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["starting", "ready", "running", "waiting", "stopped", "error"]>;
    readonly reason: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeSessionStateChangedEvent = typeof ProviderRuntimeSessionStateChangedEvent.Type;
declare const ProviderRuntimeSessionExitedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"session.exited">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
    readonly recoverable: Schema.optional<Schema.Boolean>;
    readonly exitKind: Schema.optional<Schema.Literals<readonly ["graceful", "error"]>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeSessionExitedEvent = typeof ProviderRuntimeSessionExitedEvent.Type;
declare const ProviderRuntimeThreadStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.started">;
  readonly payload: Schema.Struct<{
    readonly providerThreadId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadStartedEvent = typeof ProviderRuntimeThreadStartedEvent.Type;
declare const ProviderRuntimeThreadStateChangedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["active", "idle", "archived", "closed", "compacted", "error"]>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadStateChangedEvent = typeof ProviderRuntimeThreadStateChangedEvent.Type;
declare const ProviderRuntimeThreadMetadataUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.metadata.updated">;
  readonly payload: Schema.Struct<{
    readonly name: Schema.optional<Schema.Trim>;
    readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadMetadataUpdatedEvent = typeof ProviderRuntimeThreadMetadataUpdatedEvent.Type;
declare const ProviderRuntimeThreadTokenUsageUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.token-usage.updated">;
  readonly payload: Schema.Struct<{
    readonly usage: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadTokenUsageUpdatedEvent = typeof ProviderRuntimeThreadTokenUsageUpdatedEvent.Type;
declare const ProviderRuntimeThreadRealtimeStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.started">;
  readonly payload: Schema.Struct<{
    readonly realtimeSessionId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadRealtimeStartedEvent = typeof ProviderRuntimeThreadRealtimeStartedEvent.Type;
declare const ProviderRuntimeThreadRealtimeItemAddedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.item-added">;
  readonly payload: Schema.Struct<{
    readonly item: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadRealtimeItemAddedEvent = typeof ProviderRuntimeThreadRealtimeItemAddedEvent.Type;
declare const ProviderRuntimeThreadRealtimeAudioDeltaEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.audio.delta">;
  readonly payload: Schema.Struct<{
    readonly audio: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadRealtimeAudioDeltaEvent = typeof ProviderRuntimeThreadRealtimeAudioDeltaEvent.Type;
declare const ProviderRuntimeThreadRealtimeErrorEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadRealtimeErrorEvent = typeof ProviderRuntimeThreadRealtimeErrorEvent.Type;
declare const ProviderRuntimeThreadRealtimeClosedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.closed">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeThreadRealtimeClosedEvent = typeof ProviderRuntimeThreadRealtimeClosedEvent.Type;
declare const ProviderRuntimeTurnStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.started">;
  readonly payload: Schema.Struct<{
    readonly model: Schema.optional<Schema.Trim>;
    readonly effort: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnStartedEvent = typeof ProviderRuntimeTurnStartedEvent.Type;
declare const ProviderRuntimeTurnCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.completed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
    readonly stopReason: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly modelUsage: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly totalCostUsd: Schema.optional<Schema.Number>;
    readonly errorMessage: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnCompletedEvent = typeof ProviderRuntimeTurnCompletedEvent.Type;
declare const ProviderRuntimeTurnAbortedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.aborted">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnAbortedEvent = typeof ProviderRuntimeTurnAbortedEvent.Type;
declare const ProviderRuntimeTurnPlanUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.plan.updated">;
  readonly payload: Schema.Struct<{
    readonly explanation: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly plan: Schema.$Array<Schema.Struct<{
      readonly step: Schema.Trim;
      readonly status: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnPlanUpdatedEvent = typeof ProviderRuntimeTurnPlanUpdatedEvent.Type;
declare const ProviderRuntimeTurnProposedDeltaEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.delta">;
  readonly payload: Schema.Struct<{
    readonly delta: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnProposedDeltaEvent = typeof ProviderRuntimeTurnProposedDeltaEvent.Type;
declare const ProviderRuntimeTurnProposedCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.completed">;
  readonly payload: Schema.Struct<{
    readonly planMarkdown: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnProposedCompletedEvent = typeof ProviderRuntimeTurnProposedCompletedEvent.Type;
declare const ProviderRuntimeTurnDiffUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"turn.diff.updated">;
  readonly payload: Schema.Struct<{
    readonly unifiedDiff: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTurnDiffUpdatedEvent = typeof ProviderRuntimeTurnDiffUpdatedEvent.Type;
declare const ProviderRuntimeItemStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"item.started">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeItemStartedEvent = typeof ProviderRuntimeItemStartedEvent.Type;
declare const ProviderRuntimeItemUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"item.updated">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeItemUpdatedEvent = typeof ProviderRuntimeItemUpdatedEvent.Type;
declare const ProviderRuntimeItemCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"item.completed">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeItemCompletedEvent = typeof ProviderRuntimeItemCompletedEvent.Type;
declare const ProviderRuntimeContentDeltaEvent: Schema.Struct<{
  readonly type: Schema.Literal<"content.delta">;
  readonly payload: Schema.Struct<{
    readonly streamKind: Schema.Literals<readonly ["assistant_text", "reasoning_text", "reasoning_summary_text", "plan_text", "command_output", "file_change_output", "unknown"]>;
    readonly delta: Schema.String;
    readonly contentIndex: Schema.optional<Schema.Int>;
    readonly summaryIndex: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeContentDeltaEvent = typeof ProviderRuntimeContentDeltaEvent.Type;
declare const ProviderRuntimeRequestOpenedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"request.opened">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly args: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeRequestOpenedEvent = typeof ProviderRuntimeRequestOpenedEvent.Type;
declare const ProviderRuntimeRequestResolvedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"request.resolved">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly decision: Schema.optional<Schema.Trim>;
    readonly resolution: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeRequestResolvedEvent = typeof ProviderRuntimeRequestResolvedEvent.Type;
declare const ProviderRuntimeUserInputRequestedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"user-input.requested">;
  readonly payload: Schema.Struct<{
    readonly questions: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly header: Schema.Trim;
      readonly question: Schema.Trim;
      readonly options: Schema.$Array<Schema.Struct<{
        readonly label: Schema.Trim;
        readonly description: Schema.Trim;
      }>>;
      readonly multiSelect: Schema.withConstructorDefault<Schema.optional<Schema.Boolean>>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeUserInputRequestedEvent = typeof ProviderRuntimeUserInputRequestedEvent.Type;
declare const ProviderRuntimeUserInputResolvedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"user-input.resolved">;
  readonly payload: Schema.Struct<{
    readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeUserInputResolvedEvent = typeof ProviderRuntimeUserInputResolvedEvent.Type;
declare const ProviderRuntimeTaskStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"task.started">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.optional<Schema.Trim>;
    readonly taskType: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTaskStartedEvent = typeof ProviderRuntimeTaskStartedEvent.Type;
declare const ProviderRuntimeTaskProgressEvent: Schema.Struct<{
  readonly type: Schema.Literal<"task.progress">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.Trim;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly lastToolName: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTaskProgressEvent = typeof ProviderRuntimeTaskProgressEvent.Type;
declare const ProviderRuntimeTaskCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"task.completed">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly status: Schema.Literals<readonly ["completed", "failed", "stopped"]>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeTaskCompletedEvent = typeof ProviderRuntimeTaskCompletedEvent.Type;
declare const ProviderRuntimeHookStartedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"hook.started">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly hookName: Schema.Trim;
    readonly hookEvent: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeHookStartedEvent = typeof ProviderRuntimeHookStartedEvent.Type;
declare const ProviderRuntimeHookProgressEvent: Schema.Struct<{
  readonly type: Schema.Literal<"hook.progress">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeHookProgressEvent = typeof ProviderRuntimeHookProgressEvent.Type;
declare const ProviderRuntimeHookCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"hook.completed">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly outcome: Schema.Literals<readonly ["success", "error", "cancelled"]>;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
    readonly exitCode: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeHookCompletedEvent = typeof ProviderRuntimeHookCompletedEvent.Type;
declare const ProviderRuntimeToolProgressEvent: Schema.Struct<{
  readonly type: Schema.Literal<"tool.progress">;
  readonly payload: Schema.Struct<{
    readonly toolUseId: Schema.optional<Schema.Trim>;
    readonly toolName: Schema.optional<Schema.Trim>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly elapsedSeconds: Schema.optional<Schema.Number>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeToolProgressEvent = typeof ProviderRuntimeToolProgressEvent.Type;
declare const ProviderRuntimeToolSummaryEvent: Schema.Struct<{
  readonly type: Schema.Literal<"tool.summary">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly precedingToolUseIds: Schema.optional<Schema.$Array<Schema.Trim>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeToolSummaryEvent = typeof ProviderRuntimeToolSummaryEvent.Type;
declare const ProviderRuntimeAuthStatusEvent: Schema.Struct<{
  readonly type: Schema.Literal<"auth.status">;
  readonly payload: Schema.Struct<{
    readonly isAuthenticating: Schema.optional<Schema.Boolean>;
    readonly output: Schema.optional<Schema.$Array<Schema.String>>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeAuthStatusEvent = typeof ProviderRuntimeAuthStatusEvent.Type;
declare const ProviderRuntimeAccountUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"account.updated">;
  readonly payload: Schema.Struct<{
    readonly account: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeAccountUpdatedEvent = typeof ProviderRuntimeAccountUpdatedEvent.Type;
declare const ProviderRuntimeAccountRateLimitsUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"account.rate-limits.updated">;
  readonly payload: Schema.Struct<{
    readonly rateLimits: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeAccountRateLimitsUpdatedEvent = typeof ProviderRuntimeAccountRateLimitsUpdatedEvent.Type;
declare const ProviderRuntimeMcpStatusUpdatedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"mcp.status.updated">;
  readonly payload: Schema.Struct<{
    readonly status: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeMcpStatusUpdatedEvent = typeof ProviderRuntimeMcpStatusUpdatedEvent.Type;
declare const ProviderRuntimeMcpOauthCompletedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"mcp.oauth.completed">;
  readonly payload: Schema.Struct<{
    readonly success: Schema.Boolean;
    readonly name: Schema.optional<Schema.Trim>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeMcpOauthCompletedEvent = typeof ProviderRuntimeMcpOauthCompletedEvent.Type;
declare const ProviderRuntimeModelReroutedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"model.rerouted">;
  readonly payload: Schema.Struct<{
    readonly fromModel: Schema.Trim;
    readonly toModel: Schema.Trim;
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeModelReroutedEvent = typeof ProviderRuntimeModelReroutedEvent.Type;
declare const ProviderRuntimeConfigWarningEvent: Schema.Struct<{
  readonly type: Schema.Literal<"config.warning">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
    readonly path: Schema.optional<Schema.Trim>;
    readonly range: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeConfigWarningEvent = typeof ProviderRuntimeConfigWarningEvent.Type;
declare const ProviderRuntimeDeprecationNoticeEvent: Schema.Struct<{
  readonly type: Schema.Literal<"deprecation.notice">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeDeprecationNoticeEvent = typeof ProviderRuntimeDeprecationNoticeEvent.Type;
declare const ProviderRuntimeFilesPersistedEvent: Schema.Struct<{
  readonly type: Schema.Literal<"files.persisted">;
  readonly payload: Schema.Struct<{
    readonly files: Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly fileId: Schema.Trim;
    }>>;
    readonly failed: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly error: Schema.Trim;
    }>>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeFilesPersistedEvent = typeof ProviderRuntimeFilesPersistedEvent.Type;
declare const ProviderRuntimeWarningEvent: Schema.Struct<{
  readonly type: Schema.Literal<"runtime.warning">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeWarningEvent = typeof ProviderRuntimeWarningEvent.Type;
declare const ProviderRuntimeErrorEvent: Schema.Struct<{
  readonly type: Schema.Literal<"runtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly class: Schema.optional<Schema.Literals<readonly ["provider_error", "transport_error", "permission_error", "validation_error", "unknown"]>>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>;
type ProviderRuntimeErrorEvent = typeof ProviderRuntimeErrorEvent.Type;
declare const ProviderRuntimeEventV2: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"session.started">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.optional<Schema.Trim>;
    readonly resume: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.configured">;
  readonly payload: Schema.Struct<{
    readonly config: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["starting", "ready", "running", "waiting", "stopped", "error"]>;
    readonly reason: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.exited">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
    readonly recoverable: Schema.optional<Schema.Boolean>;
    readonly exitKind: Schema.optional<Schema.Literals<readonly ["graceful", "error"]>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.started">;
  readonly payload: Schema.Struct<{
    readonly providerThreadId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["active", "idle", "archived", "closed", "compacted", "error"]>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.metadata.updated">;
  readonly payload: Schema.Struct<{
    readonly name: Schema.optional<Schema.Trim>;
    readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.token-usage.updated">;
  readonly payload: Schema.Struct<{
    readonly usage: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.started">;
  readonly payload: Schema.Struct<{
    readonly realtimeSessionId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.item-added">;
  readonly payload: Schema.Struct<{
    readonly item: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.audio.delta">;
  readonly payload: Schema.Struct<{
    readonly audio: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.closed">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.started">;
  readonly payload: Schema.Struct<{
    readonly model: Schema.optional<Schema.Trim>;
    readonly effort: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.completed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
    readonly stopReason: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly modelUsage: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly totalCostUsd: Schema.optional<Schema.Number>;
    readonly errorMessage: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.aborted">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.plan.updated">;
  readonly payload: Schema.Struct<{
    readonly explanation: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly plan: Schema.$Array<Schema.Struct<{
      readonly step: Schema.Trim;
      readonly status: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.delta">;
  readonly payload: Schema.Struct<{
    readonly delta: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.completed">;
  readonly payload: Schema.Struct<{
    readonly planMarkdown: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.diff.updated">;
  readonly payload: Schema.Struct<{
    readonly unifiedDiff: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.started">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.updated">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.completed">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"content.delta">;
  readonly payload: Schema.Struct<{
    readonly streamKind: Schema.Literals<readonly ["assistant_text", "reasoning_text", "reasoning_summary_text", "plan_text", "command_output", "file_change_output", "unknown"]>;
    readonly delta: Schema.String;
    readonly contentIndex: Schema.optional<Schema.Int>;
    readonly summaryIndex: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"request.opened">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly args: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"request.resolved">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly decision: Schema.optional<Schema.Trim>;
    readonly resolution: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"user-input.requested">;
  readonly payload: Schema.Struct<{
    readonly questions: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly header: Schema.Trim;
      readonly question: Schema.Trim;
      readonly options: Schema.$Array<Schema.Struct<{
        readonly label: Schema.Trim;
        readonly description: Schema.Trim;
      }>>;
      readonly multiSelect: Schema.withConstructorDefault<Schema.optional<Schema.Boolean>>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"user-input.resolved">;
  readonly payload: Schema.Struct<{
    readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.started">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.optional<Schema.Trim>;
    readonly taskType: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.progress">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.Trim;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly lastToolName: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.completed">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly status: Schema.Literals<readonly ["completed", "failed", "stopped"]>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.started">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly hookName: Schema.Trim;
    readonly hookEvent: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.progress">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.completed">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly outcome: Schema.Literals<readonly ["success", "error", "cancelled"]>;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
    readonly exitCode: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"tool.progress">;
  readonly payload: Schema.Struct<{
    readonly toolUseId: Schema.optional<Schema.Trim>;
    readonly toolName: Schema.optional<Schema.Trim>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly elapsedSeconds: Schema.optional<Schema.Number>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"tool.summary">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly precedingToolUseIds: Schema.optional<Schema.$Array<Schema.Trim>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"auth.status">;
  readonly payload: Schema.Struct<{
    readonly isAuthenticating: Schema.optional<Schema.Boolean>;
    readonly output: Schema.optional<Schema.$Array<Schema.String>>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"account.updated">;
  readonly payload: Schema.Struct<{
    readonly account: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"account.rate-limits.updated">;
  readonly payload: Schema.Struct<{
    readonly rateLimits: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"mcp.status.updated">;
  readonly payload: Schema.Struct<{
    readonly status: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"mcp.oauth.completed">;
  readonly payload: Schema.Struct<{
    readonly success: Schema.Boolean;
    readonly name: Schema.optional<Schema.Trim>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"model.rerouted">;
  readonly payload: Schema.Struct<{
    readonly fromModel: Schema.Trim;
    readonly toModel: Schema.Trim;
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"config.warning">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
    readonly path: Schema.optional<Schema.Trim>;
    readonly range: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"deprecation.notice">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"files.persisted">;
  readonly payload: Schema.Struct<{
    readonly files: Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly fileId: Schema.Trim;
    }>>;
    readonly failed: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly error: Schema.Trim;
    }>>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"runtime.warning">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"runtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly class: Schema.optional<Schema.Literals<readonly ["provider_error", "transport_error", "permission_error", "validation_error", "unknown"]>>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>]>;
type ProviderRuntimeEventV2 = typeof ProviderRuntimeEventV2.Type;
declare const ProviderRuntimeEvent: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"session.started">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.optional<Schema.Trim>;
    readonly resume: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.configured">;
  readonly payload: Schema.Struct<{
    readonly config: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["starting", "ready", "running", "waiting", "stopped", "error"]>;
    readonly reason: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"session.exited">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
    readonly recoverable: Schema.optional<Schema.Boolean>;
    readonly exitKind: Schema.optional<Schema.Literals<readonly ["graceful", "error"]>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.started">;
  readonly payload: Schema.Struct<{
    readonly providerThreadId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.state.changed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["active", "idle", "archived", "closed", "compacted", "error"]>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.metadata.updated">;
  readonly payload: Schema.Struct<{
    readonly name: Schema.optional<Schema.Trim>;
    readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.token-usage.updated">;
  readonly payload: Schema.Struct<{
    readonly usage: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.started">;
  readonly payload: Schema.Struct<{
    readonly realtimeSessionId: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.item-added">;
  readonly payload: Schema.Struct<{
    readonly item: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.audio.delta">;
  readonly payload: Schema.Struct<{
    readonly audio: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"thread.realtime.closed">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.started">;
  readonly payload: Schema.Struct<{
    readonly model: Schema.optional<Schema.Trim>;
    readonly effort: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.completed">;
  readonly payload: Schema.Struct<{
    readonly state: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
    readonly stopReason: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly modelUsage: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly totalCostUsd: Schema.optional<Schema.Number>;
    readonly errorMessage: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.aborted">;
  readonly payload: Schema.Struct<{
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.plan.updated">;
  readonly payload: Schema.Struct<{
    readonly explanation: Schema.optional<Schema.NullOr<Schema.Trim>>;
    readonly plan: Schema.$Array<Schema.Struct<{
      readonly step: Schema.Trim;
      readonly status: Schema.Literals<readonly ["pending", "inProgress", "completed"]>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.delta">;
  readonly payload: Schema.Struct<{
    readonly delta: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.proposed.completed">;
  readonly payload: Schema.Struct<{
    readonly planMarkdown: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"turn.diff.updated">;
  readonly payload: Schema.Struct<{
    readonly unifiedDiff: Schema.String;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.started">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.updated">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"item.completed">;
  readonly payload: Schema.Struct<{
    readonly itemType: Schema.Literals<readonly ["user_message", "assistant_message", "reasoning", "plan", "command_execution", "file_change", "mcp_tool_call", "dynamic_tool_call", "collab_agent_tool_call", "web_search", "image_view", "review_entered", "review_exited", "context_compaction", "error", "unknown"]>;
    readonly status: Schema.optional<Schema.Literals<readonly ["inProgress", "completed", "failed", "declined"]>>;
    readonly title: Schema.optional<Schema.Trim>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"content.delta">;
  readonly payload: Schema.Struct<{
    readonly streamKind: Schema.Literals<readonly ["assistant_text", "reasoning_text", "reasoning_summary_text", "plan_text", "command_output", "file_change_output", "unknown"]>;
    readonly delta: Schema.String;
    readonly contentIndex: Schema.optional<Schema.Int>;
    readonly summaryIndex: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"request.opened">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly detail: Schema.optional<Schema.Trim>;
    readonly args: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"request.resolved">;
  readonly payload: Schema.Struct<{
    readonly requestType: Schema.Literals<readonly ["command_execution_approval", "file_read_approval", "file_change_approval", "apply_patch_approval", "exec_command_approval", "tool_user_input", "dynamic_tool_call", "auth_tokens_refresh", "unknown"]>;
    readonly decision: Schema.optional<Schema.Trim>;
    readonly resolution: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"user-input.requested">;
  readonly payload: Schema.Struct<{
    readonly questions: Schema.$Array<Schema.Struct<{
      readonly id: Schema.Trim;
      readonly header: Schema.Trim;
      readonly question: Schema.Trim;
      readonly options: Schema.$Array<Schema.Struct<{
        readonly label: Schema.Trim;
        readonly description: Schema.Trim;
      }>>;
      readonly multiSelect: Schema.withConstructorDefault<Schema.optional<Schema.Boolean>>;
    }>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"user-input.resolved">;
  readonly payload: Schema.Struct<{
    readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.started">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.optional<Schema.Trim>;
    readonly taskType: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.progress">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly description: Schema.Trim;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
    readonly lastToolName: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"task.completed">;
  readonly payload: Schema.Struct<{
    readonly taskId: Schema.brand<Schema.Trim, "RuntimeTaskId">;
    readonly status: Schema.Literals<readonly ["completed", "failed", "stopped"]>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly usage: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.started">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly hookName: Schema.Trim;
    readonly hookEvent: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.progress">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"hook.completed">;
  readonly payload: Schema.Struct<{
    readonly hookId: Schema.Trim;
    readonly outcome: Schema.Literals<readonly ["success", "error", "cancelled"]>;
    readonly output: Schema.optional<Schema.String>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
    readonly exitCode: Schema.optional<Schema.Int>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"tool.progress">;
  readonly payload: Schema.Struct<{
    readonly toolUseId: Schema.optional<Schema.Trim>;
    readonly toolName: Schema.optional<Schema.Trim>;
    readonly summary: Schema.optional<Schema.Trim>;
    readonly elapsedSeconds: Schema.optional<Schema.Number>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"tool.summary">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly precedingToolUseIds: Schema.optional<Schema.$Array<Schema.Trim>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"auth.status">;
  readonly payload: Schema.Struct<{
    readonly isAuthenticating: Schema.optional<Schema.Boolean>;
    readonly output: Schema.optional<Schema.$Array<Schema.String>>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"account.updated">;
  readonly payload: Schema.Struct<{
    readonly account: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"account.rate-limits.updated">;
  readonly payload: Schema.Struct<{
    readonly rateLimits: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"mcp.status.updated">;
  readonly payload: Schema.Struct<{
    readonly status: Schema.Unknown;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"mcp.oauth.completed">;
  readonly payload: Schema.Struct<{
    readonly success: Schema.Boolean;
    readonly name: Schema.optional<Schema.Trim>;
    readonly error: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"model.rerouted">;
  readonly payload: Schema.Struct<{
    readonly fromModel: Schema.Trim;
    readonly toModel: Schema.Trim;
    readonly reason: Schema.Trim;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"config.warning">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
    readonly path: Schema.optional<Schema.Trim>;
    readonly range: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"deprecation.notice">;
  readonly payload: Schema.Struct<{
    readonly summary: Schema.Trim;
    readonly details: Schema.optional<Schema.Trim>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"files.persisted">;
  readonly payload: Schema.Struct<{
    readonly files: Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly fileId: Schema.Trim;
    }>>;
    readonly failed: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly filename: Schema.Trim;
      readonly error: Schema.Trim;
    }>>>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"runtime.warning">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"runtime.error">;
  readonly payload: Schema.Struct<{
    readonly message: Schema.Trim;
    readonly class: Schema.optional<Schema.Literals<readonly ["provider_error", "transport_error", "permission_error", "validation_error", "unknown"]>>;
    readonly detail: Schema.optional<Schema.Unknown>;
  }>;
  readonly eventId: Schema.brand<Schema.Trim, "EventId">;
  readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
  readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
  readonly createdAt: Schema.String;
  readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
  readonly itemId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeItemId">>;
  readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "RuntimeRequestId">>;
  readonly providerRefs: Schema.optional<Schema.Struct<{
    readonly providerTurnId: Schema.optional<Schema.Trim>;
    readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
    readonly providerRequestId: Schema.optional<Schema.Trim>;
  }>>;
  readonly raw: Schema.optional<Schema.Struct<{
    readonly source: Schema.Literals<readonly ["codex.app-server.notification", "codex.app-server.request", "codex.eventmsg", "claude.sdk.message", "claude.sdk.permission", "codex.sdk.thread-event"]>;
    readonly method: Schema.optional<Schema.Trim>;
    readonly messageType: Schema.optional<Schema.Trim>;
    readonly payload: Schema.Unknown;
  }>>;
}>]>;
type ProviderRuntimeEvent = ProviderRuntimeEventV2;
type ProviderRuntimeMessageDeltaEvent = ProviderRuntimeContentDeltaEvent;
type ProviderRuntimeMessageCompletedEvent = ProviderRuntimeItemCompletedEvent;
type ProviderRuntimeToolStartedEvent = ProviderRuntimeItemStartedEvent;
type ProviderRuntimeToolCompletedEvent = ProviderRuntimeItemCompletedEvent;
type ProviderRuntimeApprovalRequestedEvent = ProviderRuntimeRequestOpenedEvent;
type ProviderRuntimeApprovalResolvedEvent = ProviderRuntimeRequestResolvedEvent;
declare const ProviderRuntimeToolKind: Schema.Literals<readonly ["command", "file-read", "file-change", "other"]>;
type ProviderRuntimeToolKind = typeof ProviderRuntimeToolKind.Type;
declare const ProviderRuntimeTurnStatus: Schema.Literals<readonly ["completed", "failed", "interrupted", "cancelled"]>;
type ProviderRuntimeTurnStatus = RuntimeTurnState;
//#endregion
//#region src/model.d.ts
declare const CODEX_REASONING_EFFORT_OPTIONS: readonly ["xhigh", "high", "medium", "low"];
type CodexReasoningEffort = (typeof CODEX_REASONING_EFFORT_OPTIONS)[number];
declare const CLAUDE_CODE_EFFORT_OPTIONS: readonly ["low", "medium", "high", "max", "ultrathink"];
type ClaudeCodeEffort = (typeof CLAUDE_CODE_EFFORT_OPTIONS)[number];
type ProviderReasoningEffort = CodexReasoningEffort | ClaudeCodeEffort;
declare const CodexModelOptions: Schema.Struct<{
  readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
  readonly fastMode: Schema.optional<Schema.Boolean>;
}>;
type CodexModelOptions = typeof CodexModelOptions.Type;
declare const ClaudeModelOptions: Schema.Struct<{
  readonly thinking: Schema.optional<Schema.Boolean>;
  readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
  readonly fastMode: Schema.optional<Schema.Boolean>;
}>;
type ClaudeModelOptions = typeof ClaudeModelOptions.Type;
declare const ProviderModelOptions: Schema.Struct<{
  readonly codex: Schema.optional<Schema.Struct<{
    readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
    readonly fastMode: Schema.optional<Schema.Boolean>;
  }>>;
  readonly claudeAgent: Schema.optional<Schema.Struct<{
    readonly thinking: Schema.optional<Schema.Boolean>;
    readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
    readonly fastMode: Schema.optional<Schema.Boolean>;
  }>>;
}>;
type ProviderModelOptions = typeof ProviderModelOptions.Type;
declare const MODEL_OPTIONS_BY_PROVIDER: {
  readonly codex: readonly [{
    readonly slug: "gpt-5.4";
    readonly name: "GPT-5.4";
  }, {
    readonly slug: "gpt-5.4-mini";
    readonly name: "GPT-5.4 Mini";
  }, {
    readonly slug: "gpt-5.3-codex";
    readonly name: "GPT-5.3 Codex";
  }, {
    readonly slug: "gpt-5.3-codex-spark";
    readonly name: "GPT-5.3 Codex Spark";
  }, {
    readonly slug: "gpt-5.2-codex";
    readonly name: "GPT-5.2 Codex";
  }, {
    readonly slug: "gpt-5.2";
    readonly name: "GPT-5.2";
  }];
  readonly claudeAgent: readonly [{
    readonly slug: "claude-opus-4-6";
    readonly name: "Claude Opus 4.6";
  }, {
    readonly slug: "claude-sonnet-4-6";
    readonly name: "Claude Sonnet 4.6";
  }, {
    readonly slug: "claude-haiku-4-5";
    readonly name: "Claude Haiku 4.5";
  }];
};
type ModelOptionsByProvider = typeof MODEL_OPTIONS_BY_PROVIDER;
type BuiltInModelSlug = (typeof MODEL_OPTIONS_BY_PROVIDER)[ProviderKind][number]["slug"];
type ModelSlug = BuiltInModelSlug | (string & {});
declare const DEFAULT_MODEL_BY_PROVIDER: Record<ProviderKind, ModelSlug>;
declare const MODEL_OPTIONS: readonly [{
  readonly slug: "gpt-5.4";
  readonly name: "GPT-5.4";
}, {
  readonly slug: "gpt-5.4-mini";
  readonly name: "GPT-5.4 Mini";
}, {
  readonly slug: "gpt-5.3-codex";
  readonly name: "GPT-5.3 Codex";
}, {
  readonly slug: "gpt-5.3-codex-spark";
  readonly name: "GPT-5.3 Codex Spark";
}, {
  readonly slug: "gpt-5.2-codex";
  readonly name: "GPT-5.2 Codex";
}, {
  readonly slug: "gpt-5.2";
  readonly name: "GPT-5.2";
}];
declare const DEFAULT_MODEL: ModelSlug;
declare const DEFAULT_GIT_TEXT_GENERATION_MODEL: "gpt-5.4-mini";
declare const MODEL_SLUG_ALIASES_BY_PROVIDER: Record<ProviderKind, Record<string, ModelSlug>>;
declare const REASONING_EFFORT_OPTIONS_BY_PROVIDER: {
  readonly codex: readonly ["xhigh", "high", "medium", "low"];
  readonly claudeAgent: readonly ["low", "medium", "high", "max", "ultrathink"];
};
declare const DEFAULT_REASONING_EFFORT_BY_PROVIDER: {
  readonly codex: "high";
  readonly claudeAgent: "high";
};
//#endregion
//#region src/ws.d.ts
declare const WS_METHODS: {
  readonly projectsList: "projects.list";
  readonly projectsAdd: "projects.add";
  readonly projectsRemove: "projects.remove";
  readonly projectsSearchEntries: "projects.searchEntries";
  readonly projectsWriteFile: "projects.writeFile";
  readonly shellOpenInEditor: "shell.openInEditor";
  readonly gitPull: "git.pull";
  readonly gitStatus: "git.status";
  readonly gitRunStackedAction: "git.runStackedAction";
  readonly gitListBranches: "git.listBranches";
  readonly gitCreateWorktree: "git.createWorktree";
  readonly gitRemoveWorktree: "git.removeWorktree";
  readonly gitCreateBranch: "git.createBranch";
  readonly gitCheckout: "git.checkout";
  readonly gitInit: "git.init";
  readonly gitResolvePullRequest: "git.resolvePullRequest";
  readonly gitPreparePullRequestThread: "git.preparePullRequestThread";
  readonly terminalOpen: "terminal.open";
  readonly terminalWrite: "terminal.write";
  readonly terminalResize: "terminal.resize";
  readonly terminalClear: "terminal.clear";
  readonly terminalRestart: "terminal.restart";
  readonly terminalClose: "terminal.close";
  readonly serverGetConfig: "server.getConfig";
  readonly serverUpsertKeybinding: "server.upsertKeybinding";
};
declare const WS_CHANNELS: {
  readonly terminalEvent: "terminal.event";
  readonly serverWelcome: "server.welcome";
  readonly serverConfigUpdated: "server.configUpdated";
};
declare const WebSocketRequest: Schema.Struct<{
  readonly id: Schema.Trim;
  readonly body: Schema.Union<readonly [Schema.Struct<{
    readonly command: Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"project.create">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly workspaceRoot: Schema.Trim;
      readonly defaultModel: Schema.optional<Schema.Trim>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.meta.update">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly workspaceRoot: Schema.optional<Schema.Trim>;
      readonly defaultModel: Schema.optional<Schema.Trim>;
      readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"project.delete">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.create">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly model: Schema.Trim;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly branch: Schema.NullOr<Schema.Trim>;
      readonly worktreePath: Schema.NullOr<Schema.Trim>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.delete">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.meta.update">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.runtime-mode.set">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.interaction-mode.set">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn.start">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly message: Schema.Struct<{
        readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
        readonly role: Schema.Literal<"user">;
        readonly text: Schema.String;
        readonly attachments: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly type: Schema.Literal<"image">;
          readonly name: Schema.Trim;
          readonly mimeType: Schema.Trim;
          readonly sizeBytes: Schema.Int;
          readonly dataUrl: Schema.Trim;
        }>]>>;
      }>;
      readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly modelOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly thinking: Schema.optional<Schema.Boolean>;
          readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
      }>>;
      readonly providerOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly homePath: Schema.optional<Schema.Trim>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly permissionMode: Schema.optional<Schema.Trim>;
          readonly maxThinkingTokens: Schema.optional<Schema.Int>;
        }>>;
      }>>;
      readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly interactionMode: Schema.Literals<readonly ["default", "plan"]>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.turn.interrupt">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.approval.respond">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.user-input.respond">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.checkpoint.revert">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
      readonly createdAt: Schema.String;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"thread.session.stop">;
      readonly commandId: Schema.brand<Schema.Trim, "CommandId">;
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly createdAt: Schema.String;
    }>]>;
    readonly _tag: Schema.tag<"orchestration.dispatchCommand">;
  }>, Schema.Struct<{
    readonly _tag: Schema.tag<"orchestration.getSnapshot">;
  }>, Schema.Struct<{
    readonly fromTurnCount: Schema.Int;
    readonly toTurnCount: Schema.Int;
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly _tag: Schema.tag<"orchestration.getTurnDiff">;
  }>, Schema.Struct<{
    readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
    readonly toTurnCount: Schema.Int;
    readonly _tag: Schema.tag<"orchestration.getFullThreadDiff">;
  }>, Schema.Struct<{
    readonly fromSequenceExclusive: Schema.Int;
    readonly _tag: Schema.tag<"orchestration.replayEvents">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly query: Schema.Trim;
    readonly limit: Schema.Int;
    readonly _tag: Schema.tag<"projects.searchEntries">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly relativePath: Schema.Trim;
    readonly contents: Schema.String;
    readonly _tag: Schema.tag<"projects.writeFile">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly editor: Schema.Literals<("cursor" | "vscode" | "zed" | "antigravity" | "file-manager")[]>;
    readonly _tag: Schema.tag<"shell.openInEditor">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly _tag: Schema.tag<"git.pull">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly _tag: Schema.tag<"git.status">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly action: Schema.Literals<readonly ["commit", "commit_push", "commit_push_pr"]>;
    readonly commitMessage: Schema.optional<Schema.Trim>;
    readonly featureBranch: Schema.optional<Schema.Boolean>;
    readonly filePaths: Schema.optional<Schema.$Array<Schema.Trim>>;
    readonly textGenerationModel: Schema.withConstructorDefault<Schema.optional<Schema.Trim>>;
    readonly _tag: Schema.tag<"git.runStackedAction">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly _tag: Schema.tag<"git.listBranches">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly branch: Schema.Trim;
    readonly newBranch: Schema.optional<Schema.Trim>;
    readonly path: Schema.NullOr<Schema.Trim>;
    readonly _tag: Schema.tag<"git.createWorktree">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly path: Schema.Trim;
    readonly force: Schema.optional<Schema.Boolean>;
    readonly _tag: Schema.tag<"git.removeWorktree">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly branch: Schema.Trim;
    readonly _tag: Schema.tag<"git.createBranch">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly branch: Schema.Trim;
    readonly _tag: Schema.tag<"git.checkout">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly _tag: Schema.tag<"git.init">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly reference: Schema.Trim;
    readonly _tag: Schema.tag<"git.resolvePullRequest">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly reference: Schema.Trim;
    readonly mode: Schema.Literals<readonly ["local", "worktree"]>;
    readonly _tag: Schema.tag<"git.preparePullRequestThread">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly cols: Schema.optional<Schema.Int>;
    readonly rows: Schema.optional<Schema.Int>;
    readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
    readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.open">;
  }>, Schema.Struct<{
    readonly data: Schema.String;
    readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.write">;
  }>, Schema.Struct<{
    readonly cols: Schema.Int;
    readonly rows: Schema.Int;
    readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.resize">;
  }>, Schema.Struct<{
    readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.clear">;
  }>, Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly cols: Schema.Int;
    readonly rows: Schema.Int;
    readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
    readonly terminalId: Schema.withDecodingDefault<Schema.Trim>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.restart">;
  }>, Schema.Struct<{
    readonly terminalId: Schema.optional<Schema.Trim>;
    readonly deleteHistory: Schema.optional<Schema.Boolean>;
    readonly threadId: Schema.Trim;
    readonly _tag: Schema.tag<"terminal.close">;
  }>, Schema.Struct<{
    readonly _tag: Schema.tag<"server.getConfig">;
  }>, Schema.Struct<{
    readonly key: Schema.Trim;
    readonly command: Schema.Union<readonly [Schema.Literals<readonly ["terminal.toggle", "terminal.split", "terminal.new", "terminal.close", "diff.toggle", "chat.new", "chat.newLocal", "editor.openFavorite"]>, Schema.TemplateLiteral<readonly [Schema.Literal<"script.">, Schema.String, Schema.Literal<".run">]>]>;
    readonly when: Schema.optional<Schema.Trim>;
    readonly _tag: Schema.tag<"server.upsertKeybinding">;
  }>]>;
}>;
type WebSocketRequest = typeof WebSocketRequest.Type;
declare const WebSocketResponse: Schema.Struct<{
  readonly id: Schema.Trim;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.Struct<{
    readonly message: Schema.String;
  }>>;
}>;
type WebSocketResponse = typeof WebSocketResponse.Type;
declare const WsPushSequence: Schema.Int;
type WsPushSequence = typeof WsPushSequence.Type;
declare const WsWelcomePayload: Schema.Struct<{
  readonly cwd: Schema.Trim;
  readonly projectName: Schema.Trim;
  readonly bootstrapProjectId: Schema.optional<Schema.brand<Schema.Trim, "ProjectId">>;
  readonly bootstrapThreadId: Schema.optional<Schema.brand<Schema.Trim, "ThreadId">>;
}>;
type WsWelcomePayload = typeof WsWelcomePayload.Type;
interface WsPushPayloadByChannel {
  readonly [WS_CHANNELS.serverWelcome]: WsWelcomePayload;
  readonly [WS_CHANNELS.serverConfigUpdated]: typeof ServerConfigUpdatedPayload.Type;
  readonly [WS_CHANNELS.terminalEvent]: typeof TerminalEvent.Type;
  readonly [ORCHESTRATION_WS_CHANNELS.domainEvent]: OrchestrationEvent;
}
type WsPushChannel = keyof WsPushPayloadByChannel;
type WsPushData<C extends WsPushChannel> = WsPushPayloadByChannel[C];
declare const WsPushServerWelcome: Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.welcome">;
  readonly data: Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly projectName: Schema.Trim;
    readonly bootstrapProjectId: Schema.optional<Schema.brand<Schema.Trim, "ProjectId">>;
    readonly bootstrapThreadId: Schema.optional<Schema.brand<Schema.Trim, "ThreadId">>;
  }>;
}>;
declare const WsPushServerConfigUpdated: Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.configUpdated">;
  readonly data: Schema.Struct<{
    readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.malformed-config">;
      readonly message: Schema.Trim;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.invalid-entry">;
      readonly message: Schema.Trim;
      readonly index: Schema.Number;
    }>]>>;
    readonly providers: Schema.$Array<Schema.Struct<{
      readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
      readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
      readonly available: Schema.Boolean;
      readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
      readonly checkedAt: Schema.String;
      readonly message: Schema.optional<Schema.Trim>;
    }>>;
  }>;
}>;
declare const WsPushTerminalEvent: Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"terminal.event">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"started">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"output">;
    readonly data: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"exited">;
    readonly exitCode: Schema.NullOr<Schema.Int>;
    readonly exitSignal: Schema.NullOr<Schema.Int>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"error">;
    readonly message: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"cleared">;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"restarted">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"activity">;
    readonly hasRunningSubprocess: Schema.Boolean;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>]>;
}>;
declare const WsPushOrchestrationDomainEvent: Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"orchestration.domainEvent">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"project.created">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly workspaceRoot: Schema.Trim;
      readonly defaultModel: Schema.NullOr<Schema.Trim>;
      readonly scripts: Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly workspaceRoot: Schema.optional<Schema.Trim>;
      readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.deleted">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.created">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly model: Schema.Trim;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly branch: Schema.NullOr<Schema.Trim>;
      readonly worktreePath: Schema.NullOr<Schema.Trim>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.deleted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.runtime-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.interaction-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.message-sent">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
      readonly text: Schema.String;
      readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"image">;
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly mimeType: Schema.Trim;
        readonly sizeBytes: Schema.Int;
      }>]>>>;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly streaming: Schema.Boolean;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-start-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly modelOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly thinking: Schema.optional<Schema.Boolean>;
          readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
      }>>;
      readonly providerOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly homePath: Schema.optional<Schema.Trim>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly permissionMode: Schema.optional<Schema.Trim>;
          readonly maxThinkingTokens: Schema.optional<Schema.Int>;
        }>>;
      }>>;
      readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.approval-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.user-input-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.reverted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-stop-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly session: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
        readonly providerName: Schema.NullOr<Schema.Trim>;
        readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
        readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly lastError: Schema.NullOr<Schema.Trim>;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly proposedPlan: Schema.Struct<{
        readonly id: Schema.Trim;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly planMarkdown: Schema.Trim;
        readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
        readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-diff-completed">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly checkpointTurnCount: Schema.Int;
      readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
      readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
      readonly files: Schema.$Array<Schema.Struct<{
        readonly path: Schema.Trim;
        readonly kind: Schema.Trim;
        readonly additions: Schema.Int;
        readonly deletions: Schema.Int;
      }>>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly completedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.activity-appended">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly activity: Schema.Struct<{
        readonly id: Schema.brand<Schema.Trim, "EventId">;
        readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
        readonly kind: Schema.Trim;
        readonly summary: Schema.Trim;
        readonly payload: Schema.Unknown;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly sequence: Schema.optional<Schema.Int>;
        readonly createdAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>]>;
}>;
declare const WsPushChannelSchema: Schema.Literals<readonly ["server.welcome", "server.configUpdated", "terminal.event", "orchestration.domainEvent"]>;
type WsPushChannelSchema = typeof WsPushChannelSchema.Type;
declare const WsPush: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.welcome">;
  readonly data: Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly projectName: Schema.Trim;
    readonly bootstrapProjectId: Schema.optional<Schema.brand<Schema.Trim, "ProjectId">>;
    readonly bootstrapThreadId: Schema.optional<Schema.brand<Schema.Trim, "ThreadId">>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.configUpdated">;
  readonly data: Schema.Struct<{
    readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.malformed-config">;
      readonly message: Schema.Trim;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.invalid-entry">;
      readonly message: Schema.Trim;
      readonly index: Schema.Number;
    }>]>>;
    readonly providers: Schema.$Array<Schema.Struct<{
      readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
      readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
      readonly available: Schema.Boolean;
      readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
      readonly checkedAt: Schema.String;
      readonly message: Schema.optional<Schema.Trim>;
    }>>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"terminal.event">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"started">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"output">;
    readonly data: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"exited">;
    readonly exitCode: Schema.NullOr<Schema.Int>;
    readonly exitSignal: Schema.NullOr<Schema.Int>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"error">;
    readonly message: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"cleared">;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"restarted">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"activity">;
    readonly hasRunningSubprocess: Schema.Boolean;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>]>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"orchestration.domainEvent">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"project.created">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly workspaceRoot: Schema.Trim;
      readonly defaultModel: Schema.NullOr<Schema.Trim>;
      readonly scripts: Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly workspaceRoot: Schema.optional<Schema.Trim>;
      readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.deleted">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.created">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly model: Schema.Trim;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly branch: Schema.NullOr<Schema.Trim>;
      readonly worktreePath: Schema.NullOr<Schema.Trim>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.deleted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.runtime-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.interaction-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.message-sent">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
      readonly text: Schema.String;
      readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"image">;
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly mimeType: Schema.Trim;
        readonly sizeBytes: Schema.Int;
      }>]>>>;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly streaming: Schema.Boolean;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-start-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly modelOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly thinking: Schema.optional<Schema.Boolean>;
          readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
      }>>;
      readonly providerOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly homePath: Schema.optional<Schema.Trim>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly permissionMode: Schema.optional<Schema.Trim>;
          readonly maxThinkingTokens: Schema.optional<Schema.Int>;
        }>>;
      }>>;
      readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.approval-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.user-input-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.reverted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-stop-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly session: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
        readonly providerName: Schema.NullOr<Schema.Trim>;
        readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
        readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly lastError: Schema.NullOr<Schema.Trim>;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly proposedPlan: Schema.Struct<{
        readonly id: Schema.Trim;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly planMarkdown: Schema.Trim;
        readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
        readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-diff-completed">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly checkpointTurnCount: Schema.Int;
      readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
      readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
      readonly files: Schema.$Array<Schema.Struct<{
        readonly path: Schema.Trim;
        readonly kind: Schema.Trim;
        readonly additions: Schema.Int;
        readonly deletions: Schema.Int;
      }>>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly completedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.activity-appended">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly activity: Schema.Struct<{
        readonly id: Schema.brand<Schema.Trim, "EventId">;
        readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
        readonly kind: Schema.Trim;
        readonly summary: Schema.Trim;
        readonly payload: Schema.Unknown;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly sequence: Schema.optional<Schema.Int>;
        readonly createdAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>]>;
}>]>;
type WsPush = typeof WsPush.Type;
type WsPushMessage<C extends WsPushChannel> = Extract<WsPush, {
  channel: C;
}>;
declare const WsPushEnvelopeBase: Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literals<readonly ["server.welcome", "server.configUpdated", "terminal.event", "orchestration.domainEvent"]>;
  readonly data: Schema.Unknown;
}>;
type WsPushEnvelopeBase = typeof WsPushEnvelopeBase.Type;
declare const WsResponse: Schema.Union<readonly [Schema.Struct<{
  readonly id: Schema.Trim;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.Struct<{
    readonly message: Schema.String;
  }>>;
}>, Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.welcome">;
  readonly data: Schema.Struct<{
    readonly cwd: Schema.Trim;
    readonly projectName: Schema.Trim;
    readonly bootstrapProjectId: Schema.optional<Schema.brand<Schema.Trim, "ProjectId">>;
    readonly bootstrapThreadId: Schema.optional<Schema.brand<Schema.Trim, "ThreadId">>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"server.configUpdated">;
  readonly data: Schema.Struct<{
    readonly issues: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.malformed-config">;
      readonly message: Schema.Trim;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"keybindings.invalid-entry">;
      readonly message: Schema.Trim;
      readonly index: Schema.Number;
    }>]>>;
    readonly providers: Schema.$Array<Schema.Struct<{
      readonly provider: Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>;
      readonly status: Schema.Literals<readonly ["ready", "warning", "error"]>;
      readonly available: Schema.Boolean;
      readonly authStatus: Schema.Literals<readonly ["authenticated", "unauthenticated", "unknown"]>;
      readonly checkedAt: Schema.String;
      readonly message: Schema.optional<Schema.Trim>;
    }>>;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"terminal.event">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"started">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"output">;
    readonly data: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"exited">;
    readonly exitCode: Schema.NullOr<Schema.Int>;
    readonly exitSignal: Schema.NullOr<Schema.Int>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"error">;
    readonly message: Schema.String;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"cleared">;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"restarted">;
    readonly snapshot: Schema.Struct<{
      readonly threadId: Schema.String;
      readonly terminalId: Schema.String;
      readonly cwd: Schema.String;
      readonly status: Schema.Literals<readonly ["starting", "running", "exited", "error"]>;
      readonly pid: Schema.NullOr<Schema.Int>;
      readonly history: Schema.String;
      readonly exitCode: Schema.NullOr<Schema.Int>;
      readonly exitSignal: Schema.NullOr<Schema.Int>;
      readonly updatedAt: Schema.String;
    }>;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"activity">;
    readonly hasRunningSubprocess: Schema.Boolean;
    readonly threadId: Schema.String;
    readonly terminalId: Schema.String;
    readonly createdAt: Schema.String;
  }>]>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"push">;
  readonly sequence: Schema.Int;
  readonly channel: Schema.Literal<"orchestration.domainEvent">;
  readonly data: Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"project.created">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly workspaceRoot: Schema.Trim;
      readonly defaultModel: Schema.NullOr<Schema.Trim>;
      readonly scripts: Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly workspaceRoot: Schema.optional<Schema.Trim>;
      readonly defaultModel: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly scripts: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly command: Schema.Trim;
        readonly icon: Schema.Literals<readonly ["play", "test", "lint", "configure", "build", "debug"]>;
        readonly runOnWorktreeCreate: Schema.Boolean;
      }>>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"project.deleted">;
    readonly payload: Schema.Struct<{
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.created">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly projectId: Schema.brand<Schema.Trim, "ProjectId">;
      readonly title: Schema.Trim;
      readonly model: Schema.Trim;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly branch: Schema.NullOr<Schema.Trim>;
      readonly worktreePath: Schema.NullOr<Schema.Trim>;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.deleted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly deletedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.meta-updated">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly title: Schema.optional<Schema.Trim>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly branch: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly worktreePath: Schema.optional<Schema.NullOr<Schema.Trim>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.runtime-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly runtimeMode: Schema.Literals<readonly ["approval-required", "full-access"]>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.interaction-mode-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.message-sent">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly role: Schema.Literals<readonly ["user", "assistant", "system"]>;
      readonly text: Schema.String;
      readonly attachments: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"image">;
        readonly id: Schema.Trim;
        readonly name: Schema.Trim;
        readonly mimeType: Schema.Trim;
        readonly sizeBytes: Schema.Int;
      }>]>>>;
      readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
      readonly streaming: Schema.Boolean;
      readonly createdAt: Schema.String;
      readonly updatedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-start-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly messageId: Schema.brand<Schema.Trim, "MessageId">;
      readonly provider: Schema.optional<Schema.decodeTo<Schema.toType<Schema.Literals<readonly ["codex", "claudeAgent"]>>, Schema.Literals<readonly ["codex", "claudeAgent", "claude"]>, never, never>>;
      readonly model: Schema.optional<Schema.Trim>;
      readonly modelOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly reasoningEffort: Schema.optional<Schema.Literals<readonly ["xhigh", "high", "medium", "low"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly thinking: Schema.optional<Schema.Boolean>;
          readonly effort: Schema.optional<Schema.Literals<readonly ["low", "medium", "high", "max", "ultrathink"]>>;
          readonly fastMode: Schema.optional<Schema.Boolean>;
        }>>;
      }>>;
      readonly providerOptions: Schema.optional<Schema.Struct<{
        readonly codex: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly homePath: Schema.optional<Schema.Trim>;
        }>>;
        readonly claudeAgent: Schema.optional<Schema.Struct<{
          readonly binaryPath: Schema.optional<Schema.Trim>;
          readonly permissionMode: Schema.optional<Schema.Trim>;
          readonly maxThinkingTokens: Schema.optional<Schema.Int>;
        }>>;
      }>>;
      readonly assistantDeliveryMode: Schema.optional<Schema.Literals<readonly ["buffered", "streaming"]>>;
      readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
      readonly interactionMode: Schema.withDecodingDefault<Schema.Literals<readonly ["default", "plan"]>>;
      readonly sourceProposedPlan: Schema.optional<Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly planId: Schema.Trim;
      }>>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-interrupt-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.optional<Schema.brand<Schema.Trim, "TurnId">>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.approval-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly decision: Schema.Literals<readonly ["accept", "acceptForSession", "decline", "cancel"]>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.user-input-response-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly requestId: Schema.brand<Schema.Trim, "ApprovalRequestId">;
      readonly answers: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.checkpoint-revert-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.reverted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnCount: Schema.Int;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-stop-requested">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly createdAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.session-set">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly session: Schema.Struct<{
        readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
        readonly status: Schema.Literals<readonly ["idle", "starting", "running", "ready", "interrupted", "stopped", "error"]>;
        readonly providerName: Schema.NullOr<Schema.Trim>;
        readonly runtimeMode: Schema.withDecodingDefault<Schema.Literals<readonly ["approval-required", "full-access"]>>;
        readonly activeTurnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly lastError: Schema.NullOr<Schema.Trim>;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.proposed-plan-upserted">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly proposedPlan: Schema.Struct<{
        readonly id: Schema.Trim;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly planMarkdown: Schema.Trim;
        readonly implementedAt: Schema.withDecodingDefault<Schema.NullOr<Schema.String>>;
        readonly implementationThreadId: Schema.withDecodingDefault<Schema.NullOr<Schema.brand<Schema.Trim, "ThreadId">>>;
        readonly createdAt: Schema.String;
        readonly updatedAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.turn-diff-completed">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly turnId: Schema.brand<Schema.Trim, "TurnId">;
      readonly checkpointTurnCount: Schema.Int;
      readonly checkpointRef: Schema.brand<Schema.Trim, "CheckpointRef">;
      readonly status: Schema.Literals<readonly ["ready", "missing", "error"]>;
      readonly files: Schema.$Array<Schema.Struct<{
        readonly path: Schema.Trim;
        readonly kind: Schema.Trim;
        readonly additions: Schema.Int;
        readonly deletions: Schema.Int;
      }>>;
      readonly assistantMessageId: Schema.NullOr<Schema.brand<Schema.Trim, "MessageId">>;
      readonly completedAt: Schema.String;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"thread.activity-appended">;
    readonly payload: Schema.Struct<{
      readonly threadId: Schema.brand<Schema.Trim, "ThreadId">;
      readonly activity: Schema.Struct<{
        readonly id: Schema.brand<Schema.Trim, "EventId">;
        readonly tone: Schema.Literals<readonly ["info", "tool", "approval", "error"]>;
        readonly kind: Schema.Trim;
        readonly summary: Schema.Trim;
        readonly payload: Schema.Unknown;
        readonly turnId: Schema.NullOr<Schema.brand<Schema.Trim, "TurnId">>;
        readonly sequence: Schema.optional<Schema.Int>;
        readonly createdAt: Schema.String;
      }>;
    }>;
    readonly sequence: Schema.Int;
    readonly eventId: Schema.brand<Schema.Trim, "EventId">;
    readonly aggregateKind: Schema.Literals<readonly ["project", "thread"]>;
    readonly aggregateId: Schema.Union<readonly [Schema.brand<Schema.Trim, "ProjectId">, Schema.brand<Schema.Trim, "ThreadId">]>;
    readonly occurredAt: Schema.String;
    readonly commandId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly causationEventId: Schema.NullOr<Schema.brand<Schema.Trim, "EventId">>;
    readonly correlationId: Schema.NullOr<Schema.brand<Schema.Trim, "CommandId">>;
    readonly metadata: Schema.Struct<{
      readonly providerTurnId: Schema.optional<Schema.Trim>;
      readonly providerItemId: Schema.optional<Schema.brand<Schema.Trim, "ProviderItemId">>;
      readonly adapterKey: Schema.optional<Schema.Trim>;
      readonly requestId: Schema.optional<Schema.brand<Schema.Trim, "ApprovalRequestId">>;
      readonly ingestedAt: Schema.optional<Schema.String>;
    }>;
  }>]>;
}>]>]>;
type WsResponse = typeof WsResponse.Type;
//#endregion
export { AccountRateLimitsUpdatedPayload, AccountUpdatedPayload, ApprovalRequestId, AssistantDeliveryMode, AuthStatusPayload, CLAUDE_CODE_EFFORT_OPTIONS, CODEX_REASONING_EFFORT_OPTIONS, CanonicalItemType, CanonicalRequestType, ChatAttachment, ChatAttachmentId, ChatImageAttachment, CheckpointRef, ClaudeCodeEffort, ClaudeModelOptions, ClaudeProviderStartOptions, ClientOrchestrationCommand, CodexModelOptions, CodexProviderStartOptions, CodexReasoningEffort, CommandId, ConfigWarningPayload, ContentDeltaPayload, ContextMenuItem, CorrelationId, DEFAULT_GIT_TEXT_GENERATION_MODEL, DEFAULT_MODEL, DEFAULT_MODEL_BY_PROVIDER, DEFAULT_PROVIDER_INTERACTION_MODE, DEFAULT_PROVIDER_KIND, DEFAULT_REASONING_EFFORT_BY_PROVIDER, DEFAULT_RUNTIME_MODE, DEFAULT_TERMINAL_ID, DeprecationNoticePayload, DesktopBridge, DesktopRuntimeArch, DesktopRuntimeInfo, DesktopTheme, DesktopUpdateActionResult, DesktopUpdateState, DesktopUpdateStatus, DispatchResult, DispatchableClientOrchestrationCommand, EDITORS, EditorId, EventId, FilesPersistedPayload, GitBranch, GitCheckoutInput, GitCreateBranchInput, GitCreateWorktreeInput, GitCreateWorktreeResult, GitInitInput, GitListBranchesInput, GitListBranchesResult, GitPreparePullRequestThreadInput, GitPreparePullRequestThreadResult, GitPullInput, GitPullRequestRefInput, GitPullResult, GitRemoveWorktreeInput, GitResolvePullRequestResult, GitResolvedPullRequest, GitRunStackedActionInput, GitRunStackedActionResult, GitStackedAction, GitStatusInput, GitStatusResult, HookCompletedPayload, HookProgressPayload, HookStartedPayload, InternalOrchestrationCommand, IsoDateTime, ItemLifecyclePayload, KeybindingCommand, KeybindingRule, KeybindingShortcut, KeybindingWhenNode, KeybindingsConfig, MAX_KEYBINDINGS_COUNT, MAX_KEYBINDING_VALUE_LENGTH, MAX_SCRIPT_ID_LENGTH, MAX_WHEN_EXPRESSION_DEPTH, MODEL_OPTIONS, MODEL_OPTIONS_BY_PROVIDER, MODEL_SLUG_ALIASES_BY_PROVIDER, McpOauthCompletedPayload, McpStatusUpdatedPayload, MessageId, ModelOptionsByProvider, ModelReroutedPayload, ModelSlug, NativeApi, NonNegativeInt, ORCHESTRATION_WS_CHANNELS, ORCHESTRATION_WS_METHODS, OpenInEditorInput, OrchestrationActorKind, OrchestrationAggregateKind, OrchestrationCheckpointFile, OrchestrationCheckpointStatus, OrchestrationCheckpointSummary, OrchestrationCommand, OrchestrationCommandReceiptStatus, OrchestrationEvent, OrchestrationEventMetadata, OrchestrationEventType, OrchestrationGetFullThreadDiffInput, OrchestrationGetFullThreadDiffResult, OrchestrationGetSnapshotInput, OrchestrationGetSnapshotResult, OrchestrationGetTurnDiffInput, OrchestrationGetTurnDiffResult, OrchestrationLatestTurn, OrchestrationLatestTurnState, OrchestrationMessage, OrchestrationMessageRole, OrchestrationProject, OrchestrationProposedPlan, OrchestrationProposedPlanId, OrchestrationReadModel, OrchestrationReplayEventsInput, OrchestrationReplayEventsResult, OrchestrationRpcSchemas, OrchestrationSession, OrchestrationSessionStatus, OrchestrationThread, OrchestrationThreadActivity, OrchestrationThreadActivityTone, PROVIDER_SEND_TURN_MAX_ATTACHMENTS, PROVIDER_SEND_TURN_MAX_IMAGE_BYTES, PROVIDER_SEND_TURN_MAX_INPUT_CHARS, PositiveInt, ProjectCreateCommand, ProjectCreatedPayload, ProjectDeletedPayload, ProjectEntry, ProjectId, ProjectMetaUpdatedPayload, ProjectScript, ProjectScriptIcon, ProjectSearchEntriesInput, ProjectSearchEntriesResult, ProjectWriteFileInput, ProjectWriteFileResult, ProjectionCheckpointRow, ProjectionPendingApprovalDecision, ProjectionPendingApprovalStatus, ProjectionThreadTurnStatus, ProviderApprovalDecision, ProviderApprovalPolicy, ProviderEvent, ProviderInteractionMode, ProviderInterruptTurnInput, ProviderItemId, ProviderKind, ProviderModelOptions, ProviderReasoningEffort, ProviderRefs, ProviderRequestId, ProviderRequestKind, ProviderRespondToRequestInput, ProviderRespondToUserInputInput, ProviderRuntimeAccountRateLimitsUpdatedEvent, ProviderRuntimeAccountUpdatedEvent, ProviderRuntimeApprovalRequestedEvent, ProviderRuntimeApprovalResolvedEvent, ProviderRuntimeAuthStatusEvent, ProviderRuntimeConfigWarningEvent, ProviderRuntimeContentDeltaEvent, ProviderRuntimeDeprecationNoticeEvent, ProviderRuntimeErrorEvent, ProviderRuntimeEvent, ProviderRuntimeEventBase, ProviderRuntimeEventType, ProviderRuntimeEventV2, ProviderRuntimeFilesPersistedEvent, ProviderRuntimeHookCompletedEvent, ProviderRuntimeHookProgressEvent, ProviderRuntimeHookStartedEvent, ProviderRuntimeItemCompletedEvent, ProviderRuntimeItemStartedEvent, ProviderRuntimeItemUpdatedEvent, ProviderRuntimeMcpOauthCompletedEvent, ProviderRuntimeMcpStatusUpdatedEvent, ProviderRuntimeMessageCompletedEvent, ProviderRuntimeMessageDeltaEvent, ProviderRuntimeModelReroutedEvent, ProviderRuntimeRequestOpenedEvent, ProviderRuntimeRequestResolvedEvent, ProviderRuntimeSessionConfiguredEvent, ProviderRuntimeSessionExitedEvent, ProviderRuntimeSessionStartedEvent, ProviderRuntimeSessionStateChangedEvent, ProviderRuntimeTaskCompletedEvent, ProviderRuntimeTaskProgressEvent, ProviderRuntimeTaskStartedEvent, ProviderRuntimeThreadMetadataUpdatedEvent, ProviderRuntimeThreadRealtimeAudioDeltaEvent, ProviderRuntimeThreadRealtimeClosedEvent, ProviderRuntimeThreadRealtimeErrorEvent, ProviderRuntimeThreadRealtimeItemAddedEvent, ProviderRuntimeThreadRealtimeStartedEvent, ProviderRuntimeThreadStartedEvent, ProviderRuntimeThreadStateChangedEvent, ProviderRuntimeThreadTokenUsageUpdatedEvent, ProviderRuntimeToolCompletedEvent, ProviderRuntimeToolKind, ProviderRuntimeToolProgressEvent, ProviderRuntimeToolStartedEvent, ProviderRuntimeToolSummaryEvent, ProviderRuntimeTurnAbortedEvent, ProviderRuntimeTurnCompletedEvent, ProviderRuntimeTurnDiffUpdatedEvent, ProviderRuntimeTurnPlanUpdatedEvent, ProviderRuntimeTurnProposedCompletedEvent, ProviderRuntimeTurnProposedDeltaEvent, ProviderRuntimeTurnStartedEvent, ProviderRuntimeTurnStatus, ProviderRuntimeUserInputRequestedEvent, ProviderRuntimeUserInputResolvedEvent, ProviderRuntimeWarningEvent, ProviderSandboxMode, ProviderSendTurnInput, ProviderSession, ProviderSessionRuntimeStatus, ProviderSessionStartInput, ProviderStartOptions, ProviderStopSessionInput, ProviderTurnStartResult, ProviderUserInputAnswers, REASONING_EFFORT_OPTIONS_BY_PROVIDER, RequestOpenedPayload, RequestResolvedPayload, ResolvedKeybindingRule, ResolvedKeybindingsConfig, RuntimeContentStreamKind, RuntimeErrorClass, RuntimeErrorPayload, RuntimeEventRaw, RuntimeEventRawSource, RuntimeItemId, RuntimeItemStatus, RuntimeMode, RuntimePlanStep, RuntimePlanStepStatus, RuntimeRequestId, RuntimeSessionExitKind, RuntimeSessionId, RuntimeSessionState, RuntimeTaskId, RuntimeThreadState, RuntimeTurnState, RuntimeWarningPayload, SCRIPT_RUN_COMMAND_PATTERN, ServerConfig, ServerConfigIssue, ServerConfigUpdatedPayload, ServerProviderAuthStatus, ServerProviderStatus, ServerProviderStatusState, ServerUpsertKeybindingInput, ServerUpsertKeybindingResult, SessionConfiguredPayload, SessionExitedPayload, SessionStartedPayload, SessionStateChangedPayload, TOOL_LIFECYCLE_ITEM_TYPES, TaskCompletedPayload, TaskProgressPayload, TaskStartedPayload, TerminalClearInput, TerminalCloseInput, TerminalEvent, TerminalOpenInput, TerminalResizeInput, TerminalRestartInput, TerminalSessionInput, TerminalSessionSnapshot, TerminalSessionStatus, TerminalThreadInput, TerminalWriteInput, ThreadActivityAppendedPayload, ThreadApprovalResponseRequestedPayload, ThreadCheckpointRevertRequestedPayload, ThreadCreatedPayload, ThreadDeletedPayload, ThreadId, ThreadInteractionModeSetPayload, ThreadMessageSentPayload, ThreadMetaUpdatedPayload, ThreadMetadataUpdatedPayload, ThreadProposedPlanUpsertedPayload, ThreadRealtimeAudioDeltaPayload, ThreadRealtimeClosedPayload, ThreadRealtimeErrorPayload, ThreadRealtimeItemAddedPayload, ThreadRealtimeStartedPayload, ThreadRevertedPayload, ThreadRuntimeModeSetPayload, ThreadSessionSetPayload, ThreadSessionStopRequestedPayload, ThreadStartedPayload, ThreadStateChangedPayload, ThreadTokenUsageUpdatedPayload, ThreadTurnDiff, ThreadTurnDiffCompletedPayload, ThreadTurnInterruptRequestedPayload, ThreadTurnStartCommand, ThreadTurnStartRequestedPayload, ToolLifecycleItemType, ToolProgressPayload, ToolSummaryPayload, TrimmedNonEmptyString, TrimmedString, TurnAbortedPayload, TurnCompletedPayload, TurnCountRange, TurnDiffUpdatedPayload, TurnId, TurnPlanUpdatedPayload, TurnProposedCompletedPayload, TurnProposedDeltaPayload, TurnStartedPayload, UploadChatAttachment, UploadChatImageAttachment, UserInputQuestion, UserInputQuestionOption, UserInputRequestedPayload, UserInputResolvedPayload, WS_CHANNELS, WS_METHODS, WebSocketRequest, WebSocketResponse, WsPush, WsPushChannel, WsPushChannelSchema, WsPushData, WsPushEnvelopeBase, WsPushMessage, WsPushOrchestrationDomainEvent, WsPushPayloadByChannel, WsPushSequence, WsPushServerConfigUpdated, WsPushServerWelcome, WsPushTerminalEvent, WsResponse, WsWelcomePayload, isToolLifecycleItemType };