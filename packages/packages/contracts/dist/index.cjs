Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let effect = require("effect");

//#region src/baseSchemas.ts
const TrimmedString = effect.Schema.Trim;
const TrimmedNonEmptyString = TrimmedString.check(effect.Schema.isNonEmpty());
const NonNegativeInt = effect.Schema.Int.check(effect.Schema.isGreaterThanOrEqualTo(0));
const PositiveInt = effect.Schema.Int.check(effect.Schema.isGreaterThanOrEqualTo(1));
const IsoDateTime = effect.Schema.String;
/**
* Construct a branded identifier. Enforces non-empty trimmed strings
*/
const makeEntityId = (brand) => TrimmedNonEmptyString.pipe(effect.Schema.brand(brand));
const ThreadId = makeEntityId("ThreadId");
const ProjectId = makeEntityId("ProjectId");
const CommandId = makeEntityId("CommandId");
const EventId = makeEntityId("EventId");
const MessageId = makeEntityId("MessageId");
const TurnId = makeEntityId("TurnId");
const ProviderItemId = makeEntityId("ProviderItemId");
const RuntimeSessionId = makeEntityId("RuntimeSessionId");
const RuntimeItemId = makeEntityId("RuntimeItemId");
const RuntimeRequestId = makeEntityId("RuntimeRequestId");
const RuntimeTaskId = makeEntityId("RuntimeTaskId");
const ApprovalRequestId = makeEntityId("ApprovalRequestId");
const CheckpointRef = makeEntityId("CheckpointRef");

//#endregion
//#region src/terminal.ts
const DEFAULT_TERMINAL_ID = "default";
const TrimmedNonEmptyStringSchema$2 = TrimmedNonEmptyString;
const TerminalColsSchema = effect.Schema.Int.check(effect.Schema.isGreaterThanOrEqualTo(20)).check(effect.Schema.isLessThanOrEqualTo(400));
const TerminalRowsSchema = effect.Schema.Int.check(effect.Schema.isGreaterThanOrEqualTo(5)).check(effect.Schema.isLessThanOrEqualTo(200));
const TerminalIdSchema = TrimmedNonEmptyStringSchema$2.check(effect.Schema.isMaxLength(128));
const TerminalEnvKeySchema = effect.Schema.String.check(effect.Schema.isPattern(/^[A-Za-z_][A-Za-z0-9_]*$/)).check(effect.Schema.isMaxLength(128));
const TerminalEnvValueSchema = effect.Schema.String.check(effect.Schema.isMaxLength(8192));
const TerminalEnvSchema = effect.Schema.Record(TerminalEnvKeySchema, TerminalEnvValueSchema).check(effect.Schema.isMaxProperties(128));
const TerminalIdWithDefaultSchema = TerminalIdSchema.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_TERMINAL_ID));
const TerminalThreadInput = effect.Schema.Struct({ threadId: TrimmedNonEmptyStringSchema$2 });
const TerminalSessionInput = effect.Schema.Struct({
	...TerminalThreadInput.fields,
	terminalId: TerminalIdWithDefaultSchema
});
const TerminalOpenInput = effect.Schema.Struct({
	...TerminalSessionInput.fields,
	cwd: TrimmedNonEmptyStringSchema$2,
	cols: effect.Schema.optional(TerminalColsSchema),
	rows: effect.Schema.optional(TerminalRowsSchema),
	env: effect.Schema.optional(TerminalEnvSchema)
});
const TerminalWriteInput = effect.Schema.Struct({
	...TerminalSessionInput.fields,
	data: effect.Schema.String.check(effect.Schema.isNonEmpty()).check(effect.Schema.isMaxLength(65536))
});
const TerminalResizeInput = effect.Schema.Struct({
	...TerminalSessionInput.fields,
	cols: TerminalColsSchema,
	rows: TerminalRowsSchema
});
const TerminalClearInput = TerminalSessionInput;
const TerminalRestartInput = effect.Schema.Struct({
	...TerminalSessionInput.fields,
	cwd: TrimmedNonEmptyStringSchema$2,
	cols: TerminalColsSchema,
	rows: TerminalRowsSchema,
	env: effect.Schema.optional(TerminalEnvSchema)
});
const TerminalCloseInput = effect.Schema.Struct({
	...TerminalThreadInput.fields,
	terminalId: effect.Schema.optional(TerminalIdSchema),
	deleteHistory: effect.Schema.optional(effect.Schema.Boolean)
});
const TerminalSessionStatus = effect.Schema.Literals([
	"starting",
	"running",
	"exited",
	"error"
]);
const TerminalSessionSnapshot = effect.Schema.Struct({
	threadId: effect.Schema.String.check(effect.Schema.isNonEmpty()),
	terminalId: effect.Schema.String.check(effect.Schema.isNonEmpty()),
	cwd: effect.Schema.String.check(effect.Schema.isNonEmpty()),
	status: TerminalSessionStatus,
	pid: effect.Schema.NullOr(effect.Schema.Int.check(effect.Schema.isGreaterThan(0))),
	history: effect.Schema.String,
	exitCode: effect.Schema.NullOr(effect.Schema.Int),
	exitSignal: effect.Schema.NullOr(effect.Schema.Int),
	updatedAt: effect.Schema.String
});
const TerminalEventBaseSchema = effect.Schema.Struct({
	threadId: effect.Schema.String.check(effect.Schema.isNonEmpty()),
	terminalId: effect.Schema.String.check(effect.Schema.isNonEmpty()),
	createdAt: effect.Schema.String
});
const TerminalStartedEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("started"),
	snapshot: TerminalSessionSnapshot
});
const TerminalOutputEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("output"),
	data: effect.Schema.String
});
const TerminalExitedEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("exited"),
	exitCode: effect.Schema.NullOr(effect.Schema.Int),
	exitSignal: effect.Schema.NullOr(effect.Schema.Int)
});
const TerminalErrorEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("error"),
	message: effect.Schema.String.check(effect.Schema.isNonEmpty())
});
const TerminalClearedEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("cleared")
});
const TerminalRestartedEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("restarted"),
	snapshot: TerminalSessionSnapshot
});
const TerminalActivityEvent = effect.Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: effect.Schema.Literal("activity"),
	hasRunningSubprocess: effect.Schema.Boolean
});
const TerminalEvent = effect.Schema.Union([
	TerminalStartedEvent,
	TerminalOutputEvent,
	TerminalExitedEvent,
	TerminalErrorEvent,
	TerminalClearedEvent,
	TerminalRestartedEvent,
	TerminalActivityEvent
]);

//#endregion
//#region src/model.ts
const CODEX_REASONING_EFFORT_OPTIONS = [
	"xhigh",
	"high",
	"medium",
	"low"
];
const CLAUDE_CODE_EFFORT_OPTIONS = [
	"low",
	"medium",
	"high",
	"max",
	"ultrathink"
];
const CodexModelOptions = effect.Schema.Struct({
	reasoningEffort: effect.Schema.optional(effect.Schema.Literals(CODEX_REASONING_EFFORT_OPTIONS)),
	fastMode: effect.Schema.optional(effect.Schema.Boolean)
});
const ClaudeModelOptions = effect.Schema.Struct({
	thinking: effect.Schema.optional(effect.Schema.Boolean),
	effort: effect.Schema.optional(effect.Schema.Literals(CLAUDE_CODE_EFFORT_OPTIONS)),
	fastMode: effect.Schema.optional(effect.Schema.Boolean)
});
const ProviderModelOptions = effect.Schema.Struct({
	codex: effect.Schema.optional(CodexModelOptions),
	claudeAgent: effect.Schema.optional(ClaudeModelOptions)
});
const MODEL_OPTIONS_BY_PROVIDER = {
	codex: [
		{
			slug: "gpt-5.4",
			name: "GPT-5.4"
		},
		{
			slug: "gpt-5.4-mini",
			name: "GPT-5.4 Mini"
		},
		{
			slug: "gpt-5.3-codex",
			name: "GPT-5.3 Codex"
		},
		{
			slug: "gpt-5.3-codex-spark",
			name: "GPT-5.3 Codex Spark"
		},
		{
			slug: "gpt-5.2-codex",
			name: "GPT-5.2 Codex"
		},
		{
			slug: "gpt-5.2",
			name: "GPT-5.2"
		}
	],
	claudeAgent: [
		{
			slug: "claude-opus-4-6",
			name: "Claude Opus 4.6"
		},
		{
			slug: "claude-sonnet-4-6",
			name: "Claude Sonnet 4.6"
		},
		{
			slug: "claude-haiku-4-5",
			name: "Claude Haiku 4.5"
		}
	]
};
const DEFAULT_MODEL_BY_PROVIDER = {
	codex: "gpt-5.4",
	claudeAgent: "claude-sonnet-4-6"
};
const MODEL_OPTIONS = MODEL_OPTIONS_BY_PROVIDER.codex;
const DEFAULT_MODEL = DEFAULT_MODEL_BY_PROVIDER.codex;
const DEFAULT_GIT_TEXT_GENERATION_MODEL = "gpt-5.4-mini";
const MODEL_SLUG_ALIASES_BY_PROVIDER = {
	codex: {
		"5.4": "gpt-5.4",
		"5.3": "gpt-5.3-codex",
		"gpt-5.3": "gpt-5.3-codex",
		"5.3-spark": "gpt-5.3-codex-spark",
		"gpt-5.3-spark": "gpt-5.3-codex-spark"
	},
	claudeAgent: {
		opus: "claude-opus-4-6",
		"opus-4.6": "claude-opus-4-6",
		"claude-opus-4.6": "claude-opus-4-6",
		"claude-opus-4-6-20251117": "claude-opus-4-6",
		sonnet: "claude-sonnet-4-6",
		"sonnet-4.6": "claude-sonnet-4-6",
		"claude-sonnet-4.6": "claude-sonnet-4-6",
		"claude-sonnet-4-6-20251117": "claude-sonnet-4-6",
		haiku: "claude-haiku-4-5",
		"haiku-4.5": "claude-haiku-4-5",
		"claude-haiku-4.5": "claude-haiku-4-5",
		"claude-haiku-4-5-20251001": "claude-haiku-4-5"
	}
};
const REASONING_EFFORT_OPTIONS_BY_PROVIDER = {
	codex: CODEX_REASONING_EFFORT_OPTIONS,
	claudeAgent: CLAUDE_CODE_EFFORT_OPTIONS
};
const DEFAULT_REASONING_EFFORT_BY_PROVIDER = {
	codex: "high",
	claudeAgent: "high"
};

//#endregion
//#region src/orchestration.ts
const ORCHESTRATION_WS_METHODS = {
	getSnapshot: "orchestration.getSnapshot",
	dispatchCommand: "orchestration.dispatchCommand",
	getTurnDiff: "orchestration.getTurnDiff",
	getFullThreadDiff: "orchestration.getFullThreadDiff",
	replayEvents: "orchestration.replayEvents"
};
const ORCHESTRATION_WS_CHANNELS = { domainEvent: "orchestration.domainEvent" };
const CanonicalProviderKind = effect.Schema.Literals(["codex", "claudeAgent"]);
const PersistedProviderKind = effect.Schema.Literals([
	"codex",
	"claudeAgent",
	"claude"
]);
const ProviderKind = PersistedProviderKind.pipe(effect.Schema.decodeTo(effect.Schema.toType(CanonicalProviderKind), effect.SchemaTransformation.transformOrFail({
	decode: (provider) => effect.Effect.succeed(provider === "claude" ? "claudeAgent" : provider),
	encode: (provider) => effect.Effect.succeed(provider)
})));
const ProviderApprovalPolicy = effect.Schema.Literals([
	"untrusted",
	"on-failure",
	"on-request",
	"never"
]);
const ProviderSandboxMode = effect.Schema.Literals([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const DEFAULT_PROVIDER_KIND = "codex";
const CodexProviderStartOptions = effect.Schema.Struct({
	binaryPath: effect.Schema.optional(TrimmedNonEmptyString),
	homePath: effect.Schema.optional(TrimmedNonEmptyString)
});
const ClaudeProviderStartOptions = effect.Schema.Struct({
	binaryPath: effect.Schema.optional(TrimmedNonEmptyString),
	permissionMode: effect.Schema.optional(TrimmedNonEmptyString),
	maxThinkingTokens: effect.Schema.optional(NonNegativeInt)
});
const ProviderStartOptions = effect.Schema.Struct({
	codex: effect.Schema.optional(CodexProviderStartOptions),
	claudeAgent: effect.Schema.optional(ClaudeProviderStartOptions)
});
const RuntimeMode = effect.Schema.Literals(["approval-required", "full-access"]);
const DEFAULT_RUNTIME_MODE = "full-access";
const ProviderInteractionMode = effect.Schema.Literals(["default", "plan"]);
const DEFAULT_PROVIDER_INTERACTION_MODE = "default";
const ProviderRequestKind = effect.Schema.Literals([
	"command",
	"file-read",
	"file-change"
]);
const AssistantDeliveryMode = effect.Schema.Literals(["buffered", "streaming"]);
const ProviderApprovalDecision = effect.Schema.Literals([
	"accept",
	"acceptForSession",
	"decline",
	"cancel"
]);
const ProviderUserInputAnswers = effect.Schema.Record(effect.Schema.String, effect.Schema.Unknown);
const PROVIDER_SEND_TURN_MAX_INPUT_CHARS = 12e4;
const PROVIDER_SEND_TURN_MAX_ATTACHMENTS = 8;
const PROVIDER_SEND_TURN_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const PROVIDER_SEND_TURN_MAX_IMAGE_DATA_URL_CHARS = 14e6;
const CHAT_ATTACHMENT_ID_MAX_CHARS = 128;
const CorrelationId = CommandId;
const ChatAttachmentId = TrimmedNonEmptyString.check(effect.Schema.isMaxLength(CHAT_ATTACHMENT_ID_MAX_CHARS), effect.Schema.isPattern(/^[a-z0-9_-]+$/i));
const ChatImageAttachment = effect.Schema.Struct({
	type: effect.Schema.Literal("image"),
	id: ChatAttachmentId,
	name: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(255)),
	mimeType: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(100), effect.Schema.isPattern(/^image\//i)),
	sizeBytes: NonNegativeInt.check(effect.Schema.isLessThanOrEqualTo(PROVIDER_SEND_TURN_MAX_IMAGE_BYTES))
});
const UploadChatImageAttachment = effect.Schema.Struct({
	type: effect.Schema.Literal("image"),
	name: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(255)),
	mimeType: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(100), effect.Schema.isPattern(/^image\//i)),
	sizeBytes: NonNegativeInt.check(effect.Schema.isLessThanOrEqualTo(PROVIDER_SEND_TURN_MAX_IMAGE_BYTES)),
	dataUrl: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_IMAGE_DATA_URL_CHARS))
});
const ChatAttachment = effect.Schema.Union([ChatImageAttachment]);
const UploadChatAttachment = effect.Schema.Union([UploadChatImageAttachment]);
const ProjectScriptIcon = effect.Schema.Literals([
	"play",
	"test",
	"lint",
	"configure",
	"build",
	"debug"
]);
const ProjectScript = effect.Schema.Struct({
	id: TrimmedNonEmptyString,
	name: TrimmedNonEmptyString,
	command: TrimmedNonEmptyString,
	icon: ProjectScriptIcon,
	runOnWorktreeCreate: effect.Schema.Boolean
});
const OrchestrationProject = effect.Schema.Struct({
	id: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: effect.Schema.NullOr(TrimmedNonEmptyString),
	scripts: effect.Schema.Array(ProjectScript),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	deletedAt: effect.Schema.NullOr(IsoDateTime)
});
const OrchestrationMessageRole = effect.Schema.Literals([
	"user",
	"assistant",
	"system"
]);
const OrchestrationMessage = effect.Schema.Struct({
	id: MessageId,
	role: OrchestrationMessageRole,
	text: effect.Schema.String,
	attachments: effect.Schema.optional(effect.Schema.Array(ChatAttachment)),
	turnId: effect.Schema.NullOr(TurnId),
	streaming: effect.Schema.Boolean,
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const OrchestrationProposedPlanId = TrimmedNonEmptyString;
const OrchestrationProposedPlan = effect.Schema.Struct({
	id: OrchestrationProposedPlanId,
	turnId: effect.Schema.NullOr(TurnId),
	planMarkdown: TrimmedNonEmptyString,
	implementedAt: effect.Schema.NullOr(IsoDateTime).pipe(effect.Schema.withDecodingDefault(() => null)),
	implementationThreadId: effect.Schema.NullOr(ThreadId).pipe(effect.Schema.withDecodingDefault(() => null)),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const SourceProposedPlanReference = effect.Schema.Struct({
	threadId: ThreadId,
	planId: OrchestrationProposedPlanId
});
const OrchestrationSessionStatus = effect.Schema.Literals([
	"idle",
	"starting",
	"running",
	"ready",
	"interrupted",
	"stopped",
	"error"
]);
const OrchestrationSession = effect.Schema.Struct({
	threadId: ThreadId,
	status: OrchestrationSessionStatus,
	providerName: effect.Schema.NullOr(TrimmedNonEmptyString),
	runtimeMode: RuntimeMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	activeTurnId: effect.Schema.NullOr(TurnId),
	lastError: effect.Schema.NullOr(TrimmedNonEmptyString),
	updatedAt: IsoDateTime
});
const OrchestrationCheckpointFile = effect.Schema.Struct({
	path: TrimmedNonEmptyString,
	kind: TrimmedNonEmptyString,
	additions: NonNegativeInt,
	deletions: NonNegativeInt
});
const OrchestrationCheckpointStatus = effect.Schema.Literals([
	"ready",
	"missing",
	"error"
]);
const OrchestrationCheckpointSummary = effect.Schema.Struct({
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: effect.Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: effect.Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const OrchestrationThreadActivityTone = effect.Schema.Literals([
	"info",
	"tool",
	"approval",
	"error"
]);
const OrchestrationThreadActivity = effect.Schema.Struct({
	id: EventId,
	tone: OrchestrationThreadActivityTone,
	kind: TrimmedNonEmptyString,
	summary: TrimmedNonEmptyString,
	payload: effect.Schema.Unknown,
	turnId: effect.Schema.NullOr(TurnId),
	sequence: effect.Schema.optional(NonNegativeInt),
	createdAt: IsoDateTime
});
const OrchestrationLatestTurnState = effect.Schema.Literals([
	"running",
	"interrupted",
	"completed",
	"error"
]);
const OrchestrationLatestTurn = effect.Schema.Struct({
	turnId: TurnId,
	state: OrchestrationLatestTurnState,
	requestedAt: IsoDateTime,
	startedAt: effect.Schema.NullOr(IsoDateTime),
	completedAt: effect.Schema.NullOr(IsoDateTime),
	assistantMessageId: effect.Schema.NullOr(MessageId),
	sourceProposedPlan: effect.Schema.optional(SourceProposedPlanReference)
});
const OrchestrationThread = effect.Schema.Struct({
	id: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: effect.Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: effect.Schema.NullOr(TrimmedNonEmptyString),
	latestTurn: effect.Schema.NullOr(OrchestrationLatestTurn),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	deletedAt: effect.Schema.NullOr(IsoDateTime),
	messages: effect.Schema.Array(OrchestrationMessage),
	proposedPlans: effect.Schema.Array(OrchestrationProposedPlan).pipe(effect.Schema.withDecodingDefault(() => [])),
	activities: effect.Schema.Array(OrchestrationThreadActivity),
	checkpoints: effect.Schema.Array(OrchestrationCheckpointSummary),
	session: effect.Schema.NullOr(OrchestrationSession)
});
const OrchestrationReadModel = effect.Schema.Struct({
	snapshotSequence: NonNegativeInt,
	projects: effect.Schema.Array(OrchestrationProject),
	threads: effect.Schema.Array(OrchestrationThread),
	updatedAt: IsoDateTime
});
const ProjectCreateCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("project.create"),
	commandId: CommandId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: effect.Schema.optional(TrimmedNonEmptyString),
	createdAt: IsoDateTime
});
const ProjectMetaUpdateCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("project.meta.update"),
	commandId: CommandId,
	projectId: ProjectId,
	title: effect.Schema.optional(TrimmedNonEmptyString),
	workspaceRoot: effect.Schema.optional(TrimmedNonEmptyString),
	defaultModel: effect.Schema.optional(TrimmedNonEmptyString),
	scripts: effect.Schema.optional(effect.Schema.Array(ProjectScript))
});
const ProjectDeleteCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("project.delete"),
	commandId: CommandId,
	projectId: ProjectId
});
const ThreadCreateCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.create"),
	commandId: CommandId,
	threadId: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: effect.Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: effect.Schema.NullOr(TrimmedNonEmptyString),
	createdAt: IsoDateTime
});
const ThreadDeleteCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.delete"),
	commandId: CommandId,
	threadId: ThreadId
});
const ThreadMetaUpdateCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.meta.update"),
	commandId: CommandId,
	threadId: ThreadId,
	title: effect.Schema.optional(TrimmedNonEmptyString),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	branch: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyString)),
	worktreePath: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyString))
});
const ThreadRuntimeModeSetCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.runtime-mode.set"),
	commandId: CommandId,
	threadId: ThreadId,
	runtimeMode: RuntimeMode,
	createdAt: IsoDateTime
});
const ThreadInteractionModeSetCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.interaction-mode.set"),
	commandId: CommandId,
	threadId: ThreadId,
	interactionMode: ProviderInteractionMode,
	createdAt: IsoDateTime
});
const ThreadTurnStartCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.turn.start"),
	commandId: CommandId,
	threadId: ThreadId,
	message: effect.Schema.Struct({
		messageId: MessageId,
		role: effect.Schema.Literal("user"),
		text: effect.Schema.String,
		attachments: effect.Schema.Array(ChatAttachment)
	}),
	provider: effect.Schema.optional(ProviderKind),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	modelOptions: effect.Schema.optional(ProviderModelOptions),
	providerOptions: effect.Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: effect.Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	sourceProposedPlan: effect.Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ClientThreadTurnStartCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.turn.start"),
	commandId: CommandId,
	threadId: ThreadId,
	message: effect.Schema.Struct({
		messageId: MessageId,
		role: effect.Schema.Literal("user"),
		text: effect.Schema.String,
		attachments: effect.Schema.Array(UploadChatAttachment)
	}),
	provider: effect.Schema.optional(ProviderKind),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	modelOptions: effect.Schema.optional(ProviderModelOptions),
	providerOptions: effect.Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: effect.Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode,
	sourceProposedPlan: effect.Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ThreadTurnInterruptCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.turn.interrupt"),
	commandId: CommandId,
	threadId: ThreadId,
	turnId: effect.Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadApprovalRespondCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.approval.respond"),
	commandId: CommandId,
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision,
	createdAt: IsoDateTime
});
const ThreadUserInputRespondCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.user-input.respond"),
	commandId: CommandId,
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers,
	createdAt: IsoDateTime
});
const ThreadCheckpointRevertCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.checkpoint.revert"),
	commandId: CommandId,
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadSessionStopCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.session.stop"),
	commandId: CommandId,
	threadId: ThreadId,
	createdAt: IsoDateTime
});
const DispatchableClientOrchestrationCommand = effect.Schema.Union([
	ProjectCreateCommand,
	ProjectMetaUpdateCommand,
	ProjectDeleteCommand,
	ThreadCreateCommand,
	ThreadDeleteCommand,
	ThreadMetaUpdateCommand,
	ThreadRuntimeModeSetCommand,
	ThreadInteractionModeSetCommand,
	ThreadTurnStartCommand,
	ThreadTurnInterruptCommand,
	ThreadApprovalRespondCommand,
	ThreadUserInputRespondCommand,
	ThreadCheckpointRevertCommand,
	ThreadSessionStopCommand
]);
const ClientOrchestrationCommand = effect.Schema.Union([
	ProjectCreateCommand,
	ProjectMetaUpdateCommand,
	ProjectDeleteCommand,
	ThreadCreateCommand,
	ThreadDeleteCommand,
	ThreadMetaUpdateCommand,
	ThreadRuntimeModeSetCommand,
	ThreadInteractionModeSetCommand,
	ClientThreadTurnStartCommand,
	ThreadTurnInterruptCommand,
	ThreadApprovalRespondCommand,
	ThreadUserInputRespondCommand,
	ThreadCheckpointRevertCommand,
	ThreadSessionStopCommand
]);
const ThreadSessionSetCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.session.set"),
	commandId: CommandId,
	threadId: ThreadId,
	session: OrchestrationSession,
	createdAt: IsoDateTime
});
const ThreadMessageAssistantDeltaCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.message.assistant.delta"),
	commandId: CommandId,
	threadId: ThreadId,
	messageId: MessageId,
	delta: effect.Schema.String,
	turnId: effect.Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadMessageAssistantCompleteCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.message.assistant.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	messageId: MessageId,
	turnId: effect.Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadProposedPlanUpsertCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.proposed-plan.upsert"),
	commandId: CommandId,
	threadId: ThreadId,
	proposedPlan: OrchestrationProposedPlan,
	createdAt: IsoDateTime
});
const ThreadTurnDiffCompleteCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.turn.diff.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	turnId: TurnId,
	completedAt: IsoDateTime,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: effect.Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: effect.Schema.optional(MessageId),
	checkpointTurnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadActivityAppendCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.activity.append"),
	commandId: CommandId,
	threadId: ThreadId,
	activity: OrchestrationThreadActivity,
	createdAt: IsoDateTime
});
const ThreadRevertCompleteCommand = effect.Schema.Struct({
	type: effect.Schema.Literal("thread.revert.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const InternalOrchestrationCommand = effect.Schema.Union([
	ThreadSessionSetCommand,
	ThreadMessageAssistantDeltaCommand,
	ThreadMessageAssistantCompleteCommand,
	ThreadProposedPlanUpsertCommand,
	ThreadTurnDiffCompleteCommand,
	ThreadActivityAppendCommand,
	ThreadRevertCompleteCommand
]);
const OrchestrationCommand = effect.Schema.Union([DispatchableClientOrchestrationCommand, InternalOrchestrationCommand]);
const OrchestrationEventType = effect.Schema.Literals([
	"project.created",
	"project.meta-updated",
	"project.deleted",
	"thread.created",
	"thread.deleted",
	"thread.meta-updated",
	"thread.runtime-mode-set",
	"thread.interaction-mode-set",
	"thread.message-sent",
	"thread.turn-start-requested",
	"thread.turn-interrupt-requested",
	"thread.approval-response-requested",
	"thread.user-input-response-requested",
	"thread.checkpoint-revert-requested",
	"thread.reverted",
	"thread.session-stop-requested",
	"thread.session-set",
	"thread.proposed-plan-upserted",
	"thread.turn-diff-completed",
	"thread.activity-appended"
]);
const OrchestrationAggregateKind = effect.Schema.Literals(["project", "thread"]);
const OrchestrationActorKind = effect.Schema.Literals([
	"client",
	"server",
	"provider"
]);
const ProjectCreatedPayload = effect.Schema.Struct({
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: effect.Schema.NullOr(TrimmedNonEmptyString),
	scripts: effect.Schema.Array(ProjectScript),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ProjectMetaUpdatedPayload = effect.Schema.Struct({
	projectId: ProjectId,
	title: effect.Schema.optional(TrimmedNonEmptyString),
	workspaceRoot: effect.Schema.optional(TrimmedNonEmptyString),
	defaultModel: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyString)),
	scripts: effect.Schema.optional(effect.Schema.Array(ProjectScript)),
	updatedAt: IsoDateTime
});
const ProjectDeletedPayload = effect.Schema.Struct({
	projectId: ProjectId,
	deletedAt: IsoDateTime
});
const ThreadCreatedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: effect.Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: effect.Schema.NullOr(TrimmedNonEmptyString),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ThreadDeletedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	deletedAt: IsoDateTime
});
const ThreadMetaUpdatedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	title: effect.Schema.optional(TrimmedNonEmptyString),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	branch: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyString)),
	worktreePath: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyString)),
	updatedAt: IsoDateTime
});
const ThreadRuntimeModeSetPayload = effect.Schema.Struct({
	threadId: ThreadId,
	runtimeMode: RuntimeMode,
	updatedAt: IsoDateTime
});
const ThreadInteractionModeSetPayload = effect.Schema.Struct({
	threadId: ThreadId,
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	updatedAt: IsoDateTime
});
const ThreadMessageSentPayload = effect.Schema.Struct({
	threadId: ThreadId,
	messageId: MessageId,
	role: OrchestrationMessageRole,
	text: effect.Schema.String,
	attachments: effect.Schema.optional(effect.Schema.Array(ChatAttachment)),
	turnId: effect.Schema.NullOr(TurnId),
	streaming: effect.Schema.Boolean,
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ThreadTurnStartRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	messageId: MessageId,
	provider: effect.Schema.optional(ProviderKind),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	modelOptions: effect.Schema.optional(ProviderModelOptions),
	providerOptions: effect.Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: effect.Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(effect.Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	sourceProposedPlan: effect.Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ThreadTurnInterruptRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	turnId: effect.Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadApprovalResponseRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision,
	createdAt: IsoDateTime
});
const ThreadUserInputResponseRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers,
	createdAt: IsoDateTime
});
const ThreadCheckpointRevertRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadRevertedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	turnCount: NonNegativeInt
});
const ThreadSessionStopRequestedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	createdAt: IsoDateTime
});
const ThreadSessionSetPayload = effect.Schema.Struct({
	threadId: ThreadId,
	session: OrchestrationSession
});
const ThreadProposedPlanUpsertedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	proposedPlan: OrchestrationProposedPlan
});
const ThreadTurnDiffCompletedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: effect.Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: effect.Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const ThreadActivityAppendedPayload = effect.Schema.Struct({
	threadId: ThreadId,
	activity: OrchestrationThreadActivity
});
const OrchestrationEventMetadata = effect.Schema.Struct({
	providerTurnId: effect.Schema.optional(TrimmedNonEmptyString),
	providerItemId: effect.Schema.optional(ProviderItemId),
	adapterKey: effect.Schema.optional(TrimmedNonEmptyString),
	requestId: effect.Schema.optional(ApprovalRequestId),
	ingestedAt: effect.Schema.optional(IsoDateTime)
});
const EventBaseFields = {
	sequence: NonNegativeInt,
	eventId: EventId,
	aggregateKind: OrchestrationAggregateKind,
	aggregateId: effect.Schema.Union([ProjectId, ThreadId]),
	occurredAt: IsoDateTime,
	commandId: effect.Schema.NullOr(CommandId),
	causationEventId: effect.Schema.NullOr(EventId),
	correlationId: effect.Schema.NullOr(CommandId),
	metadata: OrchestrationEventMetadata
};
const OrchestrationEvent = effect.Schema.Union([
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("project.created"),
		payload: ProjectCreatedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("project.meta-updated"),
		payload: ProjectMetaUpdatedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("project.deleted"),
		payload: ProjectDeletedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.created"),
		payload: ThreadCreatedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.deleted"),
		payload: ThreadDeletedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.meta-updated"),
		payload: ThreadMetaUpdatedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.runtime-mode-set"),
		payload: ThreadRuntimeModeSetPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.interaction-mode-set"),
		payload: ThreadInteractionModeSetPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.message-sent"),
		payload: ThreadMessageSentPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.turn-start-requested"),
		payload: ThreadTurnStartRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.turn-interrupt-requested"),
		payload: ThreadTurnInterruptRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.approval-response-requested"),
		payload: ThreadApprovalResponseRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.user-input-response-requested"),
		payload: ThreadUserInputResponseRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.checkpoint-revert-requested"),
		payload: ThreadCheckpointRevertRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.reverted"),
		payload: ThreadRevertedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.session-stop-requested"),
		payload: ThreadSessionStopRequestedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.session-set"),
		payload: ThreadSessionSetPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.proposed-plan-upserted"),
		payload: ThreadProposedPlanUpsertedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.turn-diff-completed"),
		payload: ThreadTurnDiffCompletedPayload
	}),
	effect.Schema.Struct({
		...EventBaseFields,
		type: effect.Schema.Literal("thread.activity-appended"),
		payload: ThreadActivityAppendedPayload
	})
]);
const OrchestrationCommandReceiptStatus = effect.Schema.Literals(["accepted", "rejected"]);
const TurnCountRange = effect.Schema.Struct({
	fromTurnCount: NonNegativeInt,
	toTurnCount: NonNegativeInt
}).check(effect.Schema.makeFilter((input) => input.fromTurnCount <= input.toTurnCount || new effect.SchemaIssue.InvalidValue(effect.Option.some(input.fromTurnCount), { message: "fromTurnCount must be less than or equal to toTurnCount" }), { identifier: "OrchestrationTurnDiffRange" }));
const ThreadTurnDiff = TurnCountRange.mapFields(effect.Struct.assign({
	threadId: ThreadId,
	diff: effect.Schema.String
}), { unsafePreserveChecks: true });
const ProviderSessionRuntimeStatus = effect.Schema.Literals([
	"starting",
	"running",
	"stopped",
	"error"
]);
effect.Schema.Literals([
	"running",
	"completed",
	"interrupted",
	"error"
]);
effect.Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: effect.Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: effect.Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const ProjectionPendingApprovalStatus = effect.Schema.Literals(["pending", "resolved"]);
const ProjectionPendingApprovalDecision = effect.Schema.NullOr(ProviderApprovalDecision);
const DispatchResult = effect.Schema.Struct({ sequence: NonNegativeInt });
const OrchestrationGetSnapshotInput = effect.Schema.Struct({});
const OrchestrationGetSnapshotResult = OrchestrationReadModel;
const OrchestrationGetTurnDiffInput = TurnCountRange.mapFields(effect.Struct.assign({ threadId: ThreadId }), { unsafePreserveChecks: true });
const OrchestrationGetTurnDiffResult = ThreadTurnDiff;
const OrchestrationGetFullThreadDiffInput = effect.Schema.Struct({
	threadId: ThreadId,
	toTurnCount: NonNegativeInt
});
const OrchestrationGetFullThreadDiffResult = ThreadTurnDiff;
const OrchestrationReplayEventsInput = effect.Schema.Struct({ fromSequenceExclusive: NonNegativeInt });
const OrchestrationReplayEventsResult = effect.Schema.Array(OrchestrationEvent);
const OrchestrationRpcSchemas = {
	getSnapshot: {
		input: OrchestrationGetSnapshotInput,
		output: OrchestrationGetSnapshotResult
	},
	dispatchCommand: {
		input: ClientOrchestrationCommand,
		output: DispatchResult
	},
	getTurnDiff: {
		input: OrchestrationGetTurnDiffInput,
		output: OrchestrationGetTurnDiffResult
	},
	getFullThreadDiff: {
		input: OrchestrationGetFullThreadDiffInput,
		output: OrchestrationGetFullThreadDiffResult
	},
	replayEvents: {
		input: OrchestrationReplayEventsInput,
		output: OrchestrationReplayEventsResult
	}
};

//#endregion
//#region src/provider.ts
const ProviderSessionStatus = effect.Schema.Literals([
	"connecting",
	"ready",
	"running",
	"error",
	"closed"
]);
const ProviderSession = effect.Schema.Struct({
	provider: ProviderKind,
	status: ProviderSessionStatus,
	runtimeMode: RuntimeMode,
	cwd: effect.Schema.optional(TrimmedNonEmptyString),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	threadId: ThreadId,
	resumeCursor: effect.Schema.optional(effect.Schema.Unknown),
	activeTurnId: effect.Schema.optional(TurnId),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	lastError: effect.Schema.optional(TrimmedNonEmptyString)
});
const ProviderSessionStartInput = effect.Schema.Struct({
	threadId: ThreadId,
	provider: effect.Schema.optional(ProviderKind),
	cwd: effect.Schema.optional(TrimmedNonEmptyString),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	modelOptions: effect.Schema.optional(ProviderModelOptions),
	resumeCursor: effect.Schema.optional(effect.Schema.Unknown),
	approvalPolicy: effect.Schema.optional(ProviderApprovalPolicy),
	sandboxMode: effect.Schema.optional(ProviderSandboxMode),
	providerOptions: effect.Schema.optional(ProviderStartOptions),
	runtimeMode: RuntimeMode
});
const ProviderSendTurnInput = effect.Schema.Struct({
	threadId: ThreadId,
	input: effect.Schema.optional(TrimmedNonEmptyString.check(effect.Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_INPUT_CHARS))),
	attachments: effect.Schema.optional(effect.Schema.Array(ChatAttachment).check(effect.Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_ATTACHMENTS))),
	model: effect.Schema.optional(TrimmedNonEmptyString),
	modelOptions: effect.Schema.optional(ProviderModelOptions),
	interactionMode: effect.Schema.optional(ProviderInteractionMode)
});
const ProviderTurnStartResult = effect.Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	resumeCursor: effect.Schema.optional(effect.Schema.Unknown)
});
const ProviderInterruptTurnInput = effect.Schema.Struct({
	threadId: ThreadId,
	turnId: effect.Schema.optional(TurnId)
});
const ProviderStopSessionInput = effect.Schema.Struct({ threadId: ThreadId });
const ProviderRespondToRequestInput = effect.Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision
});
const ProviderRespondToUserInputInput = effect.Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers
});
const ProviderEventKind = effect.Schema.Literals([
	"session",
	"notification",
	"request",
	"error"
]);
const ProviderEvent = effect.Schema.Struct({
	id: EventId,
	kind: ProviderEventKind,
	provider: ProviderKind,
	threadId: ThreadId,
	createdAt: IsoDateTime,
	method: TrimmedNonEmptyString,
	message: effect.Schema.optional(TrimmedNonEmptyString),
	turnId: effect.Schema.optional(TurnId),
	itemId: effect.Schema.optional(ProviderItemId),
	requestId: effect.Schema.optional(ApprovalRequestId),
	requestKind: effect.Schema.optional(ProviderRequestKind),
	textDelta: effect.Schema.optional(effect.Schema.String),
	payload: effect.Schema.optional(effect.Schema.Unknown)
});

//#endregion
//#region src/providerRuntime.ts
const TrimmedNonEmptyStringSchema$1 = TrimmedNonEmptyString;
const UnknownRecordSchema = effect.Schema.Record(effect.Schema.String, effect.Schema.Unknown);
const RuntimeEventRawSource = effect.Schema.Literals([
	"codex.app-server.notification",
	"codex.app-server.request",
	"codex.eventmsg",
	"claude.sdk.message",
	"claude.sdk.permission",
	"codex.sdk.thread-event"
]);
const RuntimeEventRaw = effect.Schema.Struct({
	source: RuntimeEventRawSource,
	method: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	messageType: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	payload: effect.Schema.Unknown
});
const ProviderRequestId = TrimmedNonEmptyStringSchema$1;
const ProviderRefs = effect.Schema.Struct({
	providerTurnId: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	providerItemId: effect.Schema.optional(ProviderItemId),
	providerRequestId: effect.Schema.optional(ProviderRequestId)
});
const RuntimeSessionState = effect.Schema.Literals([
	"starting",
	"ready",
	"running",
	"waiting",
	"stopped",
	"error"
]);
const RuntimeThreadState = effect.Schema.Literals([
	"active",
	"idle",
	"archived",
	"closed",
	"compacted",
	"error"
]);
const RuntimeTurnState = effect.Schema.Literals([
	"completed",
	"failed",
	"interrupted",
	"cancelled"
]);
const RuntimePlanStepStatus = effect.Schema.Literals([
	"pending",
	"inProgress",
	"completed"
]);
const RuntimeItemStatus = effect.Schema.Literals([
	"inProgress",
	"completed",
	"failed",
	"declined"
]);
const RuntimeContentStreamKind = effect.Schema.Literals([
	"assistant_text",
	"reasoning_text",
	"reasoning_summary_text",
	"plan_text",
	"command_output",
	"file_change_output",
	"unknown"
]);
const RuntimeSessionExitKind = effect.Schema.Literals(["graceful", "error"]);
const RuntimeErrorClass = effect.Schema.Literals([
	"provider_error",
	"transport_error",
	"permission_error",
	"validation_error",
	"unknown"
]);
const TOOL_LIFECYCLE_ITEM_TYPES = [
	"command_execution",
	"file_change",
	"mcp_tool_call",
	"dynamic_tool_call",
	"collab_agent_tool_call",
	"web_search",
	"image_view"
];
const ToolLifecycleItemType = effect.Schema.Literals(TOOL_LIFECYCLE_ITEM_TYPES);
function isToolLifecycleItemType(value) {
	return TOOL_LIFECYCLE_ITEM_TYPES.includes(value);
}
const CanonicalItemType = effect.Schema.Literals([
	"user_message",
	"assistant_message",
	"reasoning",
	"plan",
	...TOOL_LIFECYCLE_ITEM_TYPES,
	"review_entered",
	"review_exited",
	"context_compaction",
	"error",
	"unknown"
]);
const CanonicalRequestType = effect.Schema.Literals([
	"command_execution_approval",
	"file_read_approval",
	"file_change_approval",
	"apply_patch_approval",
	"exec_command_approval",
	"tool_user_input",
	"dynamic_tool_call",
	"auth_tokens_refresh",
	"unknown"
]);
effect.Schema.Literals([
	"session.started",
	"session.configured",
	"session.state.changed",
	"session.exited",
	"thread.started",
	"thread.state.changed",
	"thread.metadata.updated",
	"thread.token-usage.updated",
	"thread.realtime.started",
	"thread.realtime.item-added",
	"thread.realtime.audio.delta",
	"thread.realtime.error",
	"thread.realtime.closed",
	"turn.started",
	"turn.completed",
	"turn.aborted",
	"turn.plan.updated",
	"turn.proposed.delta",
	"turn.proposed.completed",
	"turn.diff.updated",
	"item.started",
	"item.updated",
	"item.completed",
	"content.delta",
	"request.opened",
	"request.resolved",
	"user-input.requested",
	"user-input.resolved",
	"task.started",
	"task.progress",
	"task.completed",
	"hook.started",
	"hook.progress",
	"hook.completed",
	"tool.progress",
	"tool.summary",
	"auth.status",
	"account.updated",
	"account.rate-limits.updated",
	"mcp.status.updated",
	"mcp.oauth.completed",
	"model.rerouted",
	"config.warning",
	"deprecation.notice",
	"files.persisted",
	"runtime.warning",
	"runtime.error"
]);
const SessionStartedType = effect.Schema.Literal("session.started");
const SessionConfiguredType = effect.Schema.Literal("session.configured");
const SessionStateChangedType = effect.Schema.Literal("session.state.changed");
const SessionExitedType = effect.Schema.Literal("session.exited");
const ThreadStartedType = effect.Schema.Literal("thread.started");
const ThreadStateChangedType = effect.Schema.Literal("thread.state.changed");
const ThreadMetadataUpdatedType = effect.Schema.Literal("thread.metadata.updated");
const ThreadTokenUsageUpdatedType = effect.Schema.Literal("thread.token-usage.updated");
const ThreadRealtimeStartedType = effect.Schema.Literal("thread.realtime.started");
const ThreadRealtimeItemAddedType = effect.Schema.Literal("thread.realtime.item-added");
const ThreadRealtimeAudioDeltaType = effect.Schema.Literal("thread.realtime.audio.delta");
const ThreadRealtimeErrorType = effect.Schema.Literal("thread.realtime.error");
const ThreadRealtimeClosedType = effect.Schema.Literal("thread.realtime.closed");
const TurnStartedType = effect.Schema.Literal("turn.started");
const TurnCompletedType = effect.Schema.Literal("turn.completed");
const TurnAbortedType = effect.Schema.Literal("turn.aborted");
const TurnPlanUpdatedType = effect.Schema.Literal("turn.plan.updated");
const TurnProposedDeltaType = effect.Schema.Literal("turn.proposed.delta");
const TurnProposedCompletedType = effect.Schema.Literal("turn.proposed.completed");
const TurnDiffUpdatedType = effect.Schema.Literal("turn.diff.updated");
const ItemStartedType = effect.Schema.Literal("item.started");
const ItemUpdatedType = effect.Schema.Literal("item.updated");
const ItemCompletedType = effect.Schema.Literal("item.completed");
const ContentDeltaType = effect.Schema.Literal("content.delta");
const RequestOpenedType = effect.Schema.Literal("request.opened");
const RequestResolvedType = effect.Schema.Literal("request.resolved");
const UserInputRequestedType = effect.Schema.Literal("user-input.requested");
const UserInputResolvedType = effect.Schema.Literal("user-input.resolved");
const TaskStartedType = effect.Schema.Literal("task.started");
const TaskProgressType = effect.Schema.Literal("task.progress");
const TaskCompletedType = effect.Schema.Literal("task.completed");
const HookStartedType = effect.Schema.Literal("hook.started");
const HookProgressType = effect.Schema.Literal("hook.progress");
const HookCompletedType = effect.Schema.Literal("hook.completed");
const ToolProgressType = effect.Schema.Literal("tool.progress");
const ToolSummaryType = effect.Schema.Literal("tool.summary");
const AuthStatusType = effect.Schema.Literal("auth.status");
const AccountUpdatedType = effect.Schema.Literal("account.updated");
const AccountRateLimitsUpdatedType = effect.Schema.Literal("account.rate-limits.updated");
const McpStatusUpdatedType = effect.Schema.Literal("mcp.status.updated");
const McpOauthCompletedType = effect.Schema.Literal("mcp.oauth.completed");
const ModelReroutedType = effect.Schema.Literal("model.rerouted");
const ConfigWarningType = effect.Schema.Literal("config.warning");
const DeprecationNoticeType = effect.Schema.Literal("deprecation.notice");
const FilesPersistedType = effect.Schema.Literal("files.persisted");
const RuntimeWarningType = effect.Schema.Literal("runtime.warning");
const RuntimeErrorType = effect.Schema.Literal("runtime.error");
const ProviderRuntimeEventBase = effect.Schema.Struct({
	eventId: EventId,
	provider: ProviderKind,
	threadId: ThreadId,
	createdAt: IsoDateTime,
	turnId: effect.Schema.optional(TurnId),
	itemId: effect.Schema.optional(RuntimeItemId),
	requestId: effect.Schema.optional(RuntimeRequestId),
	providerRefs: effect.Schema.optional(ProviderRefs),
	raw: effect.Schema.optional(RuntimeEventRaw)
});
const SessionStartedPayload = effect.Schema.Struct({
	message: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	resume: effect.Schema.optional(effect.Schema.Unknown)
});
const SessionConfiguredPayload = effect.Schema.Struct({ config: UnknownRecordSchema });
const SessionStateChangedPayload = effect.Schema.Struct({
	state: RuntimeSessionState,
	reason: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	detail: effect.Schema.optional(effect.Schema.Unknown)
});
const SessionExitedPayload = effect.Schema.Struct({
	reason: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	recoverable: effect.Schema.optional(effect.Schema.Boolean),
	exitKind: effect.Schema.optional(RuntimeSessionExitKind)
});
const ThreadStartedPayload = effect.Schema.Struct({ providerThreadId: effect.Schema.optional(TrimmedNonEmptyStringSchema$1) });
const ThreadStateChangedPayload = effect.Schema.Struct({
	state: RuntimeThreadState,
	detail: effect.Schema.optional(effect.Schema.Unknown)
});
const ThreadMetadataUpdatedPayload = effect.Schema.Struct({
	name: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	metadata: effect.Schema.optional(UnknownRecordSchema)
});
const ThreadTokenUsageUpdatedPayload = effect.Schema.Struct({ usage: effect.Schema.Unknown });
const ThreadRealtimeStartedPayload = effect.Schema.Struct({ realtimeSessionId: effect.Schema.optional(TrimmedNonEmptyStringSchema$1) });
const ThreadRealtimeItemAddedPayload = effect.Schema.Struct({ item: effect.Schema.Unknown });
const ThreadRealtimeAudioDeltaPayload = effect.Schema.Struct({ audio: effect.Schema.Unknown });
const ThreadRealtimeErrorPayload = effect.Schema.Struct({ message: TrimmedNonEmptyStringSchema$1 });
const ThreadRealtimeClosedPayload = effect.Schema.Struct({ reason: effect.Schema.optional(TrimmedNonEmptyStringSchema$1) });
const TurnStartedPayload = effect.Schema.Struct({
	model: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	effort: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TurnCompletedPayload = effect.Schema.Struct({
	state: RuntimeTurnState,
	stopReason: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyStringSchema$1)),
	usage: effect.Schema.optional(effect.Schema.Unknown),
	modelUsage: effect.Schema.optional(UnknownRecordSchema),
	totalCostUsd: effect.Schema.optional(effect.Schema.Number),
	errorMessage: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TurnAbortedPayload = effect.Schema.Struct({ reason: TrimmedNonEmptyStringSchema$1 });
const RuntimePlanStep = effect.Schema.Struct({
	step: TrimmedNonEmptyStringSchema$1,
	status: RuntimePlanStepStatus
});
const TurnPlanUpdatedPayload = effect.Schema.Struct({
	explanation: effect.Schema.optional(effect.Schema.NullOr(TrimmedNonEmptyStringSchema$1)),
	plan: effect.Schema.Array(RuntimePlanStep)
});
const TurnProposedDeltaPayload = effect.Schema.Struct({ delta: effect.Schema.String });
const TurnProposedCompletedPayload = effect.Schema.Struct({ planMarkdown: TrimmedNonEmptyStringSchema$1 });
const TurnDiffUpdatedPayload = effect.Schema.Struct({ unifiedDiff: effect.Schema.String });
const ItemLifecyclePayload = effect.Schema.Struct({
	itemType: CanonicalItemType,
	status: effect.Schema.optional(RuntimeItemStatus),
	title: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	detail: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	data: effect.Schema.optional(effect.Schema.Unknown)
});
const ContentDeltaPayload = effect.Schema.Struct({
	streamKind: RuntimeContentStreamKind,
	delta: effect.Schema.String,
	contentIndex: effect.Schema.optional(effect.Schema.Int),
	summaryIndex: effect.Schema.optional(effect.Schema.Int)
});
const RequestOpenedPayload = effect.Schema.Struct({
	requestType: CanonicalRequestType,
	detail: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	args: effect.Schema.optional(effect.Schema.Unknown)
});
const RequestResolvedPayload = effect.Schema.Struct({
	requestType: CanonicalRequestType,
	decision: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	resolution: effect.Schema.optional(effect.Schema.Unknown)
});
const UserInputQuestionOption = effect.Schema.Struct({
	label: TrimmedNonEmptyStringSchema$1,
	description: TrimmedNonEmptyStringSchema$1
});
const UserInputQuestion = effect.Schema.Struct({
	id: TrimmedNonEmptyStringSchema$1,
	header: TrimmedNonEmptyStringSchema$1,
	question: TrimmedNonEmptyStringSchema$1,
	options: effect.Schema.Array(UserInputQuestionOption),
	multiSelect: effect.Schema.optional(effect.Schema.Boolean).pipe(effect.Schema.withConstructorDefault(() => effect.Option.some(false)))
});
const UserInputRequestedPayload = effect.Schema.Struct({ questions: effect.Schema.Array(UserInputQuestion) });
const UserInputResolvedPayload = effect.Schema.Struct({ answers: UnknownRecordSchema });
const TaskStartedPayload = effect.Schema.Struct({
	taskId: RuntimeTaskId,
	description: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	taskType: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TaskProgressPayload = effect.Schema.Struct({
	taskId: RuntimeTaskId,
	description: TrimmedNonEmptyStringSchema$1,
	summary: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	usage: effect.Schema.optional(effect.Schema.Unknown),
	lastToolName: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TaskCompletedPayload = effect.Schema.Struct({
	taskId: RuntimeTaskId,
	status: effect.Schema.Literals([
		"completed",
		"failed",
		"stopped"
	]),
	summary: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	usage: effect.Schema.optional(effect.Schema.Unknown)
});
const HookStartedPayload = effect.Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	hookName: TrimmedNonEmptyStringSchema$1,
	hookEvent: TrimmedNonEmptyStringSchema$1
});
const HookProgressPayload = effect.Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	output: effect.Schema.optional(effect.Schema.String),
	stdout: effect.Schema.optional(effect.Schema.String),
	stderr: effect.Schema.optional(effect.Schema.String)
});
const HookCompletedPayload = effect.Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	outcome: effect.Schema.Literals([
		"success",
		"error",
		"cancelled"
	]),
	output: effect.Schema.optional(effect.Schema.String),
	stdout: effect.Schema.optional(effect.Schema.String),
	stderr: effect.Schema.optional(effect.Schema.String),
	exitCode: effect.Schema.optional(effect.Schema.Int)
});
const ToolProgressPayload = effect.Schema.Struct({
	toolUseId: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	toolName: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	summary: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	elapsedSeconds: effect.Schema.optional(effect.Schema.Number)
});
const ToolSummaryPayload = effect.Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	precedingToolUseIds: effect.Schema.optional(effect.Schema.Array(TrimmedNonEmptyStringSchema$1))
});
const AuthStatusPayload = effect.Schema.Struct({
	isAuthenticating: effect.Schema.optional(effect.Schema.Boolean),
	output: effect.Schema.optional(effect.Schema.Array(effect.Schema.String)),
	error: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const AccountUpdatedPayload = effect.Schema.Struct({ account: effect.Schema.Unknown });
const AccountRateLimitsUpdatedPayload = effect.Schema.Struct({ rateLimits: effect.Schema.Unknown });
const McpStatusUpdatedPayload = effect.Schema.Struct({ status: effect.Schema.Unknown });
const McpOauthCompletedPayload = effect.Schema.Struct({
	success: effect.Schema.Boolean,
	name: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	error: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const ModelReroutedPayload = effect.Schema.Struct({
	fromModel: TrimmedNonEmptyStringSchema$1,
	toModel: TrimmedNonEmptyStringSchema$1,
	reason: TrimmedNonEmptyStringSchema$1
});
const ConfigWarningPayload = effect.Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	details: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	path: effect.Schema.optional(TrimmedNonEmptyStringSchema$1),
	range: effect.Schema.optional(effect.Schema.Unknown)
});
const DeprecationNoticePayload = effect.Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	details: effect.Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const FilesPersistedPayload = effect.Schema.Struct({
	files: effect.Schema.Array(effect.Schema.Struct({
		filename: TrimmedNonEmptyStringSchema$1,
		fileId: TrimmedNonEmptyStringSchema$1
	})),
	failed: effect.Schema.optional(effect.Schema.Array(effect.Schema.Struct({
		filename: TrimmedNonEmptyStringSchema$1,
		error: TrimmedNonEmptyStringSchema$1
	})))
});
const RuntimeWarningPayload = effect.Schema.Struct({
	message: TrimmedNonEmptyStringSchema$1,
	detail: effect.Schema.optional(effect.Schema.Unknown)
});
const RuntimeErrorPayload = effect.Schema.Struct({
	message: TrimmedNonEmptyStringSchema$1,
	class: effect.Schema.optional(RuntimeErrorClass),
	detail: effect.Schema.optional(effect.Schema.Unknown)
});
const ProviderRuntimeSessionStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionStartedType,
	payload: SessionStartedPayload
});
const ProviderRuntimeSessionConfiguredEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionConfiguredType,
	payload: SessionConfiguredPayload
});
const ProviderRuntimeSessionStateChangedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionStateChangedType,
	payload: SessionStateChangedPayload
});
const ProviderRuntimeSessionExitedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionExitedType,
	payload: SessionExitedPayload
});
const ProviderRuntimeThreadStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadStartedType,
	payload: ThreadStartedPayload
});
const ProviderRuntimeThreadStateChangedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadStateChangedType,
	payload: ThreadStateChangedPayload
});
const ProviderRuntimeThreadMetadataUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadMetadataUpdatedType,
	payload: ThreadMetadataUpdatedPayload
});
const ProviderRuntimeThreadTokenUsageUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadTokenUsageUpdatedType,
	payload: ThreadTokenUsageUpdatedPayload
});
const ProviderRuntimeThreadRealtimeStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeStartedType,
	payload: ThreadRealtimeStartedPayload
});
const ProviderRuntimeThreadRealtimeItemAddedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeItemAddedType,
	payload: ThreadRealtimeItemAddedPayload
});
const ProviderRuntimeThreadRealtimeAudioDeltaEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeAudioDeltaType,
	payload: ThreadRealtimeAudioDeltaPayload
});
const ProviderRuntimeThreadRealtimeErrorEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeErrorType,
	payload: ThreadRealtimeErrorPayload
});
const ProviderRuntimeThreadRealtimeClosedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeClosedType,
	payload: ThreadRealtimeClosedPayload
});
const ProviderRuntimeTurnStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnStartedType,
	payload: TurnStartedPayload
});
const ProviderRuntimeTurnCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnCompletedType,
	payload: TurnCompletedPayload
});
const ProviderRuntimeTurnAbortedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnAbortedType,
	payload: TurnAbortedPayload
});
const ProviderRuntimeTurnPlanUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnPlanUpdatedType,
	payload: TurnPlanUpdatedPayload
});
const ProviderRuntimeTurnProposedDeltaEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnProposedDeltaType,
	payload: TurnProposedDeltaPayload
});
const ProviderRuntimeTurnProposedCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnProposedCompletedType,
	payload: TurnProposedCompletedPayload
});
const ProviderRuntimeTurnDiffUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnDiffUpdatedType,
	payload: TurnDiffUpdatedPayload
});
const ProviderRuntimeItemStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemStartedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeItemUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemUpdatedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeItemCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemCompletedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeContentDeltaEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ContentDeltaType,
	payload: ContentDeltaPayload
});
const ProviderRuntimeRequestOpenedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RequestOpenedType,
	payload: RequestOpenedPayload
});
const ProviderRuntimeRequestResolvedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RequestResolvedType,
	payload: RequestResolvedPayload
});
const ProviderRuntimeUserInputRequestedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: UserInputRequestedType,
	payload: UserInputRequestedPayload
});
const ProviderRuntimeUserInputResolvedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: UserInputResolvedType,
	payload: UserInputResolvedPayload
});
const ProviderRuntimeTaskStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskStartedType,
	payload: TaskStartedPayload
});
const ProviderRuntimeTaskProgressEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskProgressType,
	payload: TaskProgressPayload
});
const ProviderRuntimeTaskCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskCompletedType,
	payload: TaskCompletedPayload
});
const ProviderRuntimeHookStartedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookStartedType,
	payload: HookStartedPayload
});
const ProviderRuntimeHookProgressEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookProgressType,
	payload: HookProgressPayload
});
const ProviderRuntimeHookCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookCompletedType,
	payload: HookCompletedPayload
});
const ProviderRuntimeToolProgressEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ToolProgressType,
	payload: ToolProgressPayload
});
const ProviderRuntimeToolSummaryEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ToolSummaryType,
	payload: ToolSummaryPayload
});
const ProviderRuntimeAuthStatusEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AuthStatusType,
	payload: AuthStatusPayload
});
const ProviderRuntimeAccountUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AccountUpdatedType,
	payload: AccountUpdatedPayload
});
const ProviderRuntimeAccountRateLimitsUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AccountRateLimitsUpdatedType,
	payload: AccountRateLimitsUpdatedPayload
});
const ProviderRuntimeMcpStatusUpdatedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: McpStatusUpdatedType,
	payload: McpStatusUpdatedPayload
});
const ProviderRuntimeMcpOauthCompletedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: McpOauthCompletedType,
	payload: McpOauthCompletedPayload
});
const ProviderRuntimeModelReroutedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ModelReroutedType,
	payload: ModelReroutedPayload
});
const ProviderRuntimeConfigWarningEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ConfigWarningType,
	payload: ConfigWarningPayload
});
const ProviderRuntimeDeprecationNoticeEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: DeprecationNoticeType,
	payload: DeprecationNoticePayload
});
const ProviderRuntimeFilesPersistedEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: FilesPersistedType,
	payload: FilesPersistedPayload
});
const ProviderRuntimeWarningEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RuntimeWarningType,
	payload: RuntimeWarningPayload
});
const ProviderRuntimeErrorEvent = effect.Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RuntimeErrorType,
	payload: RuntimeErrorPayload
});
const ProviderRuntimeEventV2 = effect.Schema.Union([
	ProviderRuntimeSessionStartedEvent,
	ProviderRuntimeSessionConfiguredEvent,
	ProviderRuntimeSessionStateChangedEvent,
	ProviderRuntimeSessionExitedEvent,
	ProviderRuntimeThreadStartedEvent,
	ProviderRuntimeThreadStateChangedEvent,
	ProviderRuntimeThreadMetadataUpdatedEvent,
	ProviderRuntimeThreadTokenUsageUpdatedEvent,
	ProviderRuntimeThreadRealtimeStartedEvent,
	ProviderRuntimeThreadRealtimeItemAddedEvent,
	ProviderRuntimeThreadRealtimeAudioDeltaEvent,
	ProviderRuntimeThreadRealtimeErrorEvent,
	ProviderRuntimeThreadRealtimeClosedEvent,
	ProviderRuntimeTurnStartedEvent,
	ProviderRuntimeTurnCompletedEvent,
	ProviderRuntimeTurnAbortedEvent,
	ProviderRuntimeTurnPlanUpdatedEvent,
	ProviderRuntimeTurnProposedDeltaEvent,
	ProviderRuntimeTurnProposedCompletedEvent,
	ProviderRuntimeTurnDiffUpdatedEvent,
	ProviderRuntimeItemStartedEvent,
	ProviderRuntimeItemUpdatedEvent,
	ProviderRuntimeItemCompletedEvent,
	ProviderRuntimeContentDeltaEvent,
	ProviderRuntimeRequestOpenedEvent,
	ProviderRuntimeRequestResolvedEvent,
	ProviderRuntimeUserInputRequestedEvent,
	ProviderRuntimeUserInputResolvedEvent,
	ProviderRuntimeTaskStartedEvent,
	ProviderRuntimeTaskProgressEvent,
	ProviderRuntimeTaskCompletedEvent,
	ProviderRuntimeHookStartedEvent,
	ProviderRuntimeHookProgressEvent,
	ProviderRuntimeHookCompletedEvent,
	ProviderRuntimeToolProgressEvent,
	ProviderRuntimeToolSummaryEvent,
	ProviderRuntimeAuthStatusEvent,
	ProviderRuntimeAccountUpdatedEvent,
	ProviderRuntimeAccountRateLimitsUpdatedEvent,
	ProviderRuntimeMcpStatusUpdatedEvent,
	ProviderRuntimeMcpOauthCompletedEvent,
	ProviderRuntimeModelReroutedEvent,
	ProviderRuntimeConfigWarningEvent,
	ProviderRuntimeDeprecationNoticeEvent,
	ProviderRuntimeFilesPersistedEvent,
	ProviderRuntimeWarningEvent,
	ProviderRuntimeErrorEvent
]);
const ProviderRuntimeEvent = ProviderRuntimeEventV2;
effect.Schema.Literals([
	"command",
	"file-read",
	"file-change",
	"other"
]);
const ProviderRuntimeTurnStatus = RuntimeTurnState;

//#endregion
//#region src/git.ts
const TrimmedNonEmptyStringSchema = TrimmedNonEmptyString;
const GitStackedAction = effect.Schema.Literals([
	"commit",
	"commit_push",
	"commit_push_pr"
]);
const GitCommitStepStatus = effect.Schema.Literals(["created", "skipped_no_changes"]);
const GitPushStepStatus = effect.Schema.Literals([
	"pushed",
	"skipped_not_requested",
	"skipped_up_to_date"
]);
const GitBranchStepStatus = effect.Schema.Literals(["created", "skipped_not_requested"]);
const GitPrStepStatus = effect.Schema.Literals([
	"created",
	"opened_existing",
	"skipped_not_requested"
]);
const GitStatusPrState = effect.Schema.Literals([
	"open",
	"closed",
	"merged"
]);
const GitPullRequestReference = TrimmedNonEmptyStringSchema;
const GitPullRequestState = effect.Schema.Literals([
	"open",
	"closed",
	"merged"
]);
const GitPreparePullRequestThreadMode = effect.Schema.Literals(["local", "worktree"]);
const GitBranch = effect.Schema.Struct({
	name: TrimmedNonEmptyStringSchema,
	isRemote: effect.Schema.optional(effect.Schema.Boolean),
	remoteName: effect.Schema.optional(TrimmedNonEmptyStringSchema),
	current: effect.Schema.Boolean,
	isDefault: effect.Schema.Boolean,
	worktreePath: TrimmedNonEmptyStringSchema.pipe(effect.Schema.NullOr)
});
const GitWorktree = effect.Schema.Struct({
	path: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitResolvedPullRequest = effect.Schema.Struct({
	number: PositiveInt,
	title: TrimmedNonEmptyStringSchema,
	url: effect.Schema.String,
	baseBranch: TrimmedNonEmptyStringSchema,
	headBranch: TrimmedNonEmptyStringSchema,
	state: GitPullRequestState
});
const GitStatusInput = effect.Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitPullInput = effect.Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitRunStackedActionInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	action: GitStackedAction,
	commitMessage: effect.Schema.optional(TrimmedNonEmptyStringSchema.check(effect.Schema.isMaxLength(1e4))),
	featureBranch: effect.Schema.optional(effect.Schema.Boolean),
	filePaths: effect.Schema.optional(effect.Schema.Array(TrimmedNonEmptyStringSchema).check(effect.Schema.isMinLength(1))),
	textGenerationModel: effect.Schema.optional(TrimmedNonEmptyStringSchema).pipe(effect.Schema.withConstructorDefault(() => effect.Option.some(DEFAULT_GIT_TEXT_GENERATION_MODEL)))
});
const GitListBranchesInput = effect.Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitCreateWorktreeInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema,
	newBranch: effect.Schema.optional(TrimmedNonEmptyStringSchema),
	path: effect.Schema.NullOr(TrimmedNonEmptyStringSchema)
});
const GitPullRequestRefInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	reference: GitPullRequestReference
});
const GitPreparePullRequestThreadInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	reference: GitPullRequestReference,
	mode: GitPreparePullRequestThreadMode
});
const GitRemoveWorktreeInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	path: TrimmedNonEmptyStringSchema,
	force: effect.Schema.optional(effect.Schema.Boolean)
});
const GitCreateBranchInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitCheckoutInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitInitInput = effect.Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitStatusPr = effect.Schema.Struct({
	number: PositiveInt,
	title: TrimmedNonEmptyStringSchema,
	url: effect.Schema.String,
	baseBranch: TrimmedNonEmptyStringSchema,
	headBranch: TrimmedNonEmptyStringSchema,
	state: GitStatusPrState
});
const GitStatusResult = effect.Schema.Struct({
	branch: TrimmedNonEmptyStringSchema.pipe(effect.Schema.NullOr),
	hasWorkingTreeChanges: effect.Schema.Boolean,
	workingTree: effect.Schema.Struct({
		files: effect.Schema.Array(effect.Schema.Struct({
			path: TrimmedNonEmptyStringSchema,
			insertions: NonNegativeInt,
			deletions: NonNegativeInt
		})),
		insertions: NonNegativeInt,
		deletions: NonNegativeInt
	}),
	hasUpstream: effect.Schema.Boolean,
	aheadCount: NonNegativeInt,
	behindCount: NonNegativeInt,
	pr: effect.Schema.NullOr(GitStatusPr)
});
const GitListBranchesResult = effect.Schema.Struct({
	branches: effect.Schema.Array(GitBranch),
	isRepo: effect.Schema.Boolean,
	hasOriginRemote: effect.Schema.Boolean
});
const GitCreateWorktreeResult = effect.Schema.Struct({ worktree: GitWorktree });
const GitResolvePullRequestResult = effect.Schema.Struct({ pullRequest: GitResolvedPullRequest });
const GitPreparePullRequestThreadResult = effect.Schema.Struct({
	pullRequest: GitResolvedPullRequest,
	branch: TrimmedNonEmptyStringSchema,
	worktreePath: TrimmedNonEmptyStringSchema.pipe(effect.Schema.NullOr)
});
const GitRunStackedActionResult = effect.Schema.Struct({
	action: GitStackedAction,
	branch: effect.Schema.Struct({
		status: GitBranchStepStatus,
		name: effect.Schema.optional(TrimmedNonEmptyStringSchema)
	}),
	commit: effect.Schema.Struct({
		status: GitCommitStepStatus,
		commitSha: effect.Schema.optional(TrimmedNonEmptyStringSchema),
		subject: effect.Schema.optional(TrimmedNonEmptyStringSchema)
	}),
	push: effect.Schema.Struct({
		status: GitPushStepStatus,
		branch: effect.Schema.optional(TrimmedNonEmptyStringSchema),
		upstreamBranch: effect.Schema.optional(TrimmedNonEmptyStringSchema),
		setUpstream: effect.Schema.optional(effect.Schema.Boolean)
	}),
	pr: effect.Schema.Struct({
		status: GitPrStepStatus,
		url: effect.Schema.optional(effect.Schema.String),
		number: effect.Schema.optional(PositiveInt),
		baseBranch: effect.Schema.optional(TrimmedNonEmptyStringSchema),
		headBranch: effect.Schema.optional(TrimmedNonEmptyStringSchema),
		title: effect.Schema.optional(TrimmedNonEmptyStringSchema)
	})
});
const GitPullResult = effect.Schema.Struct({
	status: effect.Schema.Literals(["pulled", "skipped_up_to_date"]),
	branch: TrimmedNonEmptyStringSchema,
	upstreamBranch: TrimmedNonEmptyStringSchema.pipe(effect.Schema.NullOr)
});

//#endregion
//#region src/keybindings.ts
const MAX_KEYBINDING_VALUE_LENGTH = 64;
const MAX_KEYBINDING_WHEN_LENGTH = 256;
const MAX_WHEN_EXPRESSION_DEPTH = 64;
const MAX_SCRIPT_ID_LENGTH = 24;
const MAX_KEYBINDINGS_COUNT = 256;
const STATIC_KEYBINDING_COMMANDS = [
	"terminal.toggle",
	"terminal.split",
	"terminal.new",
	"terminal.close",
	"diff.toggle",
	"chat.new",
	"chat.newLocal",
	"editor.openFavorite"
];
const SCRIPT_RUN_COMMAND_PATTERN = effect.Schema.TemplateLiteral([
	effect.Schema.Literal("script."),
	effect.Schema.NonEmptyString.check(effect.Schema.isMaxLength(MAX_SCRIPT_ID_LENGTH), effect.Schema.isPattern(/^[a-z0-9][a-z0-9-]*$/)),
	effect.Schema.Literal(".run")
]);
const KeybindingCommand = effect.Schema.Union([effect.Schema.Literals(STATIC_KEYBINDING_COMMANDS), SCRIPT_RUN_COMMAND_PATTERN]);
const KeybindingValue = TrimmedString.check(effect.Schema.isMinLength(1), effect.Schema.isMaxLength(MAX_KEYBINDING_VALUE_LENGTH));
const KeybindingWhen = TrimmedString.check(effect.Schema.isMinLength(1), effect.Schema.isMaxLength(MAX_KEYBINDING_WHEN_LENGTH));
const KeybindingRule = effect.Schema.Struct({
	key: KeybindingValue,
	command: KeybindingCommand,
	when: effect.Schema.optional(KeybindingWhen)
});
const KeybindingsConfig = effect.Schema.Array(KeybindingRule).check(effect.Schema.isMaxLength(MAX_KEYBINDINGS_COUNT));
const KeybindingShortcut = effect.Schema.Struct({
	key: KeybindingValue,
	metaKey: effect.Schema.Boolean,
	ctrlKey: effect.Schema.Boolean,
	shiftKey: effect.Schema.Boolean,
	altKey: effect.Schema.Boolean,
	modKey: effect.Schema.Boolean
});
const KeybindingWhenNode = effect.Schema.Union([
	effect.Schema.Struct({
		type: effect.Schema.Literal("identifier"),
		name: effect.Schema.NonEmptyString
	}),
	effect.Schema.Struct({
		type: effect.Schema.Literal("not"),
		node: effect.Schema.suspend(() => KeybindingWhenNode)
	}),
	effect.Schema.Struct({
		type: effect.Schema.Literal("and"),
		left: effect.Schema.suspend(() => KeybindingWhenNode),
		right: effect.Schema.suspend(() => KeybindingWhenNode)
	}),
	effect.Schema.Struct({
		type: effect.Schema.Literal("or"),
		left: effect.Schema.suspend(() => KeybindingWhenNode),
		right: effect.Schema.suspend(() => KeybindingWhenNode)
	})
]);
const ResolvedKeybindingRule = effect.Schema.Struct({
	command: KeybindingCommand,
	shortcut: KeybindingShortcut,
	whenAst: effect.Schema.optional(KeybindingWhenNode)
}).annotate({ parseOptions: { onExcessProperty: "ignore" } });
const ResolvedKeybindingsConfig = effect.Schema.Array(ResolvedKeybindingRule).check(effect.Schema.isMaxLength(MAX_KEYBINDINGS_COUNT));

//#endregion
//#region src/project.ts
const PROJECT_SEARCH_ENTRIES_MAX_LIMIT = 200;
const PROJECT_WRITE_FILE_PATH_MAX_LENGTH = 512;
const ProjectSearchEntriesInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyString,
	query: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(256)),
	limit: PositiveInt.check(effect.Schema.isLessThanOrEqualTo(PROJECT_SEARCH_ENTRIES_MAX_LIMIT))
});
const ProjectEntryKind = effect.Schema.Literals(["file", "directory"]);
const ProjectEntry = effect.Schema.Struct({
	path: TrimmedNonEmptyString,
	kind: ProjectEntryKind,
	parentPath: effect.Schema.optional(TrimmedNonEmptyString)
});
const ProjectSearchEntriesResult = effect.Schema.Struct({
	entries: effect.Schema.Array(ProjectEntry),
	truncated: effect.Schema.Boolean
});
const ProjectWriteFileInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyString,
	relativePath: TrimmedNonEmptyString.check(effect.Schema.isMaxLength(PROJECT_WRITE_FILE_PATH_MAX_LENGTH)),
	contents: effect.Schema.String
});
const ProjectWriteFileResult = effect.Schema.Struct({ relativePath: TrimmedNonEmptyString });

//#endregion
//#region src/editor.ts
const EDITORS = [
	{
		id: "cursor",
		label: "Cursor",
		command: "cursor"
	},
	{
		id: "vscode",
		label: "VS Code",
		command: "code"
	},
	{
		id: "zed",
		label: "Zed",
		command: "zed"
	},
	{
		id: "antigravity",
		label: "Antigravity",
		command: "agy"
	},
	{
		id: "file-manager",
		label: "File Manager",
		command: null
	}
];
const EditorId = effect.Schema.Literals(EDITORS.map((e) => e.id));
const OpenInEditorInput = effect.Schema.Struct({
	cwd: TrimmedNonEmptyString,
	editor: EditorId
});

//#endregion
//#region src/server.ts
const KeybindingsMalformedConfigIssue = effect.Schema.Struct({
	kind: effect.Schema.Literal("keybindings.malformed-config"),
	message: TrimmedNonEmptyString
});
const KeybindingsInvalidEntryIssue = effect.Schema.Struct({
	kind: effect.Schema.Literal("keybindings.invalid-entry"),
	message: TrimmedNonEmptyString,
	index: effect.Schema.Number
});
const ServerConfigIssue = effect.Schema.Union([KeybindingsMalformedConfigIssue, KeybindingsInvalidEntryIssue]);
const ServerConfigIssues = effect.Schema.Array(ServerConfigIssue);
const ServerProviderStatusState = effect.Schema.Literals([
	"ready",
	"warning",
	"error"
]);
const ServerProviderAuthStatus = effect.Schema.Literals([
	"authenticated",
	"unauthenticated",
	"unknown"
]);
const ServerProviderStatus = effect.Schema.Struct({
	provider: ProviderKind,
	status: ServerProviderStatusState,
	available: effect.Schema.Boolean,
	authStatus: ServerProviderAuthStatus,
	checkedAt: IsoDateTime,
	message: effect.Schema.optional(TrimmedNonEmptyString)
});
const ServerProviderStatuses = effect.Schema.Array(ServerProviderStatus);
const ServerConfig = effect.Schema.Struct({
	cwd: TrimmedNonEmptyString,
	keybindingsConfigPath: TrimmedNonEmptyString,
	keybindings: ResolvedKeybindingsConfig,
	issues: ServerConfigIssues,
	providers: ServerProviderStatuses,
	availableEditors: effect.Schema.Array(EditorId)
});
const ServerUpsertKeybindingInput = KeybindingRule;
const ServerUpsertKeybindingResult = effect.Schema.Struct({
	keybindings: ResolvedKeybindingsConfig,
	issues: ServerConfigIssues
});
const ServerConfigUpdatedPayload = effect.Schema.Struct({
	issues: ServerConfigIssues,
	providers: ServerProviderStatuses
});

//#endregion
//#region src/ws.ts
const WS_METHODS = {
	projectsList: "projects.list",
	projectsAdd: "projects.add",
	projectsRemove: "projects.remove",
	projectsSearchEntries: "projects.searchEntries",
	projectsWriteFile: "projects.writeFile",
	shellOpenInEditor: "shell.openInEditor",
	gitPull: "git.pull",
	gitStatus: "git.status",
	gitRunStackedAction: "git.runStackedAction",
	gitListBranches: "git.listBranches",
	gitCreateWorktree: "git.createWorktree",
	gitRemoveWorktree: "git.removeWorktree",
	gitCreateBranch: "git.createBranch",
	gitCheckout: "git.checkout",
	gitInit: "git.init",
	gitResolvePullRequest: "git.resolvePullRequest",
	gitPreparePullRequestThread: "git.preparePullRequestThread",
	terminalOpen: "terminal.open",
	terminalWrite: "terminal.write",
	terminalResize: "terminal.resize",
	terminalClear: "terminal.clear",
	terminalRestart: "terminal.restart",
	terminalClose: "terminal.close",
	serverGetConfig: "server.getConfig",
	serverUpsertKeybinding: "server.upsertKeybinding"
};
const WS_CHANNELS = {
	terminalEvent: "terminal.event",
	serverWelcome: "server.welcome",
	serverConfigUpdated: "server.configUpdated"
};
const tagRequestBody = (tag, schema) => schema.mapFields(effect.Struct.assign({ _tag: effect.Schema.tag(tag) }), { unsafePreserveChecks: true });
const WebSocketRequestBody = effect.Schema.Union([
	tagRequestBody(ORCHESTRATION_WS_METHODS.dispatchCommand, effect.Schema.Struct({ command: ClientOrchestrationCommand })),
	tagRequestBody(ORCHESTRATION_WS_METHODS.getSnapshot, OrchestrationGetSnapshotInput),
	tagRequestBody(ORCHESTRATION_WS_METHODS.getTurnDiff, OrchestrationGetTurnDiffInput),
	tagRequestBody(ORCHESTRATION_WS_METHODS.getFullThreadDiff, OrchestrationGetFullThreadDiffInput),
	tagRequestBody(ORCHESTRATION_WS_METHODS.replayEvents, OrchestrationReplayEventsInput),
	tagRequestBody(WS_METHODS.projectsSearchEntries, ProjectSearchEntriesInput),
	tagRequestBody(WS_METHODS.projectsWriteFile, ProjectWriteFileInput),
	tagRequestBody(WS_METHODS.shellOpenInEditor, OpenInEditorInput),
	tagRequestBody(WS_METHODS.gitPull, GitPullInput),
	tagRequestBody(WS_METHODS.gitStatus, GitStatusInput),
	tagRequestBody(WS_METHODS.gitRunStackedAction, GitRunStackedActionInput),
	tagRequestBody(WS_METHODS.gitListBranches, GitListBranchesInput),
	tagRequestBody(WS_METHODS.gitCreateWorktree, GitCreateWorktreeInput),
	tagRequestBody(WS_METHODS.gitRemoveWorktree, GitRemoveWorktreeInput),
	tagRequestBody(WS_METHODS.gitCreateBranch, GitCreateBranchInput),
	tagRequestBody(WS_METHODS.gitCheckout, GitCheckoutInput),
	tagRequestBody(WS_METHODS.gitInit, GitInitInput),
	tagRequestBody(WS_METHODS.gitResolvePullRequest, GitPullRequestRefInput),
	tagRequestBody(WS_METHODS.gitPreparePullRequestThread, GitPreparePullRequestThreadInput),
	tagRequestBody(WS_METHODS.terminalOpen, TerminalOpenInput),
	tagRequestBody(WS_METHODS.terminalWrite, TerminalWriteInput),
	tagRequestBody(WS_METHODS.terminalResize, TerminalResizeInput),
	tagRequestBody(WS_METHODS.terminalClear, TerminalClearInput),
	tagRequestBody(WS_METHODS.terminalRestart, TerminalRestartInput),
	tagRequestBody(WS_METHODS.terminalClose, TerminalCloseInput),
	tagRequestBody(WS_METHODS.serverGetConfig, effect.Schema.Struct({})),
	tagRequestBody(WS_METHODS.serverUpsertKeybinding, KeybindingRule)
]);
const WebSocketRequest = effect.Schema.Struct({
	id: TrimmedNonEmptyString,
	body: WebSocketRequestBody
});
const WebSocketResponse = effect.Schema.Struct({
	id: TrimmedNonEmptyString,
	result: effect.Schema.optional(effect.Schema.Unknown),
	error: effect.Schema.optional(effect.Schema.Struct({ message: effect.Schema.String }))
});
const WsPushSequence = NonNegativeInt;
const WsWelcomePayload = effect.Schema.Struct({
	cwd: TrimmedNonEmptyString,
	projectName: TrimmedNonEmptyString,
	bootstrapProjectId: effect.Schema.optional(ProjectId),
	bootstrapThreadId: effect.Schema.optional(ThreadId)
});
const makeWsPushSchema = (channel, payload) => effect.Schema.Struct({
	type: effect.Schema.Literal("push"),
	sequence: WsPushSequence,
	channel: effect.Schema.Literal(channel),
	data: payload
});
const WsPushServerWelcome = makeWsPushSchema(WS_CHANNELS.serverWelcome, WsWelcomePayload);
const WsPushServerConfigUpdated = makeWsPushSchema(WS_CHANNELS.serverConfigUpdated, ServerConfigUpdatedPayload);
const WsPushTerminalEvent = makeWsPushSchema(WS_CHANNELS.terminalEvent, TerminalEvent);
const WsPushOrchestrationDomainEvent = makeWsPushSchema(ORCHESTRATION_WS_CHANNELS.domainEvent, OrchestrationEvent);
const WsPushChannelSchema = effect.Schema.Literals([
	WS_CHANNELS.serverWelcome,
	WS_CHANNELS.serverConfigUpdated,
	WS_CHANNELS.terminalEvent,
	ORCHESTRATION_WS_CHANNELS.domainEvent
]);
const WsPush = effect.Schema.Union([
	WsPushServerWelcome,
	WsPushServerConfigUpdated,
	WsPushTerminalEvent,
	WsPushOrchestrationDomainEvent
]);
const WsPushEnvelopeBase = effect.Schema.Struct({
	type: effect.Schema.Literal("push"),
	sequence: WsPushSequence,
	channel: WsPushChannelSchema,
	data: effect.Schema.Unknown
});
const WsResponse = effect.Schema.Union([WebSocketResponse, WsPush]);

//#endregion
exports.ApprovalRequestId = ApprovalRequestId;
exports.AssistantDeliveryMode = AssistantDeliveryMode;
exports.CLAUDE_CODE_EFFORT_OPTIONS = CLAUDE_CODE_EFFORT_OPTIONS;
exports.CODEX_REASONING_EFFORT_OPTIONS = CODEX_REASONING_EFFORT_OPTIONS;
exports.CanonicalItemType = CanonicalItemType;
exports.CanonicalRequestType = CanonicalRequestType;
exports.ChatAttachment = ChatAttachment;
exports.ChatImageAttachment = ChatImageAttachment;
exports.CheckpointRef = CheckpointRef;
exports.ClaudeModelOptions = ClaudeModelOptions;
exports.ClaudeProviderStartOptions = ClaudeProviderStartOptions;
exports.ClientOrchestrationCommand = ClientOrchestrationCommand;
exports.CodexModelOptions = CodexModelOptions;
exports.CodexProviderStartOptions = CodexProviderStartOptions;
exports.CommandId = CommandId;
exports.CorrelationId = CorrelationId;
exports.DEFAULT_GIT_TEXT_GENERATION_MODEL = DEFAULT_GIT_TEXT_GENERATION_MODEL;
exports.DEFAULT_MODEL = DEFAULT_MODEL;
exports.DEFAULT_MODEL_BY_PROVIDER = DEFAULT_MODEL_BY_PROVIDER;
exports.DEFAULT_PROVIDER_INTERACTION_MODE = DEFAULT_PROVIDER_INTERACTION_MODE;
exports.DEFAULT_PROVIDER_KIND = DEFAULT_PROVIDER_KIND;
exports.DEFAULT_REASONING_EFFORT_BY_PROVIDER = DEFAULT_REASONING_EFFORT_BY_PROVIDER;
exports.DEFAULT_RUNTIME_MODE = DEFAULT_RUNTIME_MODE;
exports.DEFAULT_TERMINAL_ID = DEFAULT_TERMINAL_ID;
exports.DispatchResult = DispatchResult;
exports.EDITORS = EDITORS;
exports.EditorId = EditorId;
exports.EventId = EventId;
exports.GitBranch = GitBranch;
exports.GitCheckoutInput = GitCheckoutInput;
exports.GitCreateBranchInput = GitCreateBranchInput;
exports.GitCreateWorktreeInput = GitCreateWorktreeInput;
exports.GitCreateWorktreeResult = GitCreateWorktreeResult;
exports.GitInitInput = GitInitInput;
exports.GitListBranchesInput = GitListBranchesInput;
exports.GitListBranchesResult = GitListBranchesResult;
exports.GitPreparePullRequestThreadInput = GitPreparePullRequestThreadInput;
exports.GitPreparePullRequestThreadResult = GitPreparePullRequestThreadResult;
exports.GitPullInput = GitPullInput;
exports.GitPullRequestRefInput = GitPullRequestRefInput;
exports.GitPullResult = GitPullResult;
exports.GitRemoveWorktreeInput = GitRemoveWorktreeInput;
exports.GitResolvePullRequestResult = GitResolvePullRequestResult;
exports.GitRunStackedActionInput = GitRunStackedActionInput;
exports.GitRunStackedActionResult = GitRunStackedActionResult;
exports.GitStackedAction = GitStackedAction;
exports.GitStatusInput = GitStatusInput;
exports.GitStatusResult = GitStatusResult;
exports.IsoDateTime = IsoDateTime;
exports.ItemLifecyclePayload = ItemLifecyclePayload;
exports.KeybindingCommand = KeybindingCommand;
exports.KeybindingRule = KeybindingRule;
exports.KeybindingShortcut = KeybindingShortcut;
exports.KeybindingWhenNode = KeybindingWhenNode;
exports.KeybindingsConfig = KeybindingsConfig;
exports.MAX_KEYBINDINGS_COUNT = MAX_KEYBINDINGS_COUNT;
exports.MAX_KEYBINDING_VALUE_LENGTH = MAX_KEYBINDING_VALUE_LENGTH;
exports.MAX_SCRIPT_ID_LENGTH = MAX_SCRIPT_ID_LENGTH;
exports.MAX_WHEN_EXPRESSION_DEPTH = MAX_WHEN_EXPRESSION_DEPTH;
exports.MODEL_OPTIONS = MODEL_OPTIONS;
exports.MODEL_OPTIONS_BY_PROVIDER = MODEL_OPTIONS_BY_PROVIDER;
exports.MODEL_SLUG_ALIASES_BY_PROVIDER = MODEL_SLUG_ALIASES_BY_PROVIDER;
exports.MessageId = MessageId;
exports.NonNegativeInt = NonNegativeInt;
exports.ORCHESTRATION_WS_CHANNELS = ORCHESTRATION_WS_CHANNELS;
exports.ORCHESTRATION_WS_METHODS = ORCHESTRATION_WS_METHODS;
exports.OpenInEditorInput = OpenInEditorInput;
exports.OrchestrationActorKind = OrchestrationActorKind;
exports.OrchestrationAggregateKind = OrchestrationAggregateKind;
exports.OrchestrationCheckpointFile = OrchestrationCheckpointFile;
exports.OrchestrationCheckpointStatus = OrchestrationCheckpointStatus;
exports.OrchestrationCheckpointSummary = OrchestrationCheckpointSummary;
exports.OrchestrationCommand = OrchestrationCommand;
exports.OrchestrationCommandReceiptStatus = OrchestrationCommandReceiptStatus;
exports.OrchestrationEvent = OrchestrationEvent;
exports.OrchestrationEventMetadata = OrchestrationEventMetadata;
exports.OrchestrationEventType = OrchestrationEventType;
exports.OrchestrationGetFullThreadDiffInput = OrchestrationGetFullThreadDiffInput;
exports.OrchestrationGetFullThreadDiffResult = OrchestrationGetFullThreadDiffResult;
exports.OrchestrationGetSnapshotInput = OrchestrationGetSnapshotInput;
exports.OrchestrationGetTurnDiffInput = OrchestrationGetTurnDiffInput;
exports.OrchestrationGetTurnDiffResult = OrchestrationGetTurnDiffResult;
exports.OrchestrationLatestTurn = OrchestrationLatestTurn;
exports.OrchestrationMessage = OrchestrationMessage;
exports.OrchestrationMessageRole = OrchestrationMessageRole;
exports.OrchestrationProject = OrchestrationProject;
exports.OrchestrationProposedPlan = OrchestrationProposedPlan;
exports.OrchestrationProposedPlanId = OrchestrationProposedPlanId;
exports.OrchestrationReadModel = OrchestrationReadModel;
exports.OrchestrationReplayEventsInput = OrchestrationReplayEventsInput;
exports.OrchestrationRpcSchemas = OrchestrationRpcSchemas;
exports.OrchestrationSession = OrchestrationSession;
exports.OrchestrationSessionStatus = OrchestrationSessionStatus;
exports.OrchestrationThread = OrchestrationThread;
exports.OrchestrationThreadActivity = OrchestrationThreadActivity;
exports.OrchestrationThreadActivityTone = OrchestrationThreadActivityTone;
exports.PROVIDER_SEND_TURN_MAX_ATTACHMENTS = PROVIDER_SEND_TURN_MAX_ATTACHMENTS;
exports.PROVIDER_SEND_TURN_MAX_IMAGE_BYTES = PROVIDER_SEND_TURN_MAX_IMAGE_BYTES;
exports.PROVIDER_SEND_TURN_MAX_INPUT_CHARS = PROVIDER_SEND_TURN_MAX_INPUT_CHARS;
exports.PositiveInt = PositiveInt;
exports.ProjectCreateCommand = ProjectCreateCommand;
exports.ProjectCreatedPayload = ProjectCreatedPayload;
exports.ProjectDeletedPayload = ProjectDeletedPayload;
exports.ProjectEntry = ProjectEntry;
exports.ProjectId = ProjectId;
exports.ProjectMetaUpdatedPayload = ProjectMetaUpdatedPayload;
exports.ProjectScript = ProjectScript;
exports.ProjectScriptIcon = ProjectScriptIcon;
exports.ProjectSearchEntriesInput = ProjectSearchEntriesInput;
exports.ProjectSearchEntriesResult = ProjectSearchEntriesResult;
exports.ProjectWriteFileInput = ProjectWriteFileInput;
exports.ProjectWriteFileResult = ProjectWriteFileResult;
exports.ProjectionPendingApprovalDecision = ProjectionPendingApprovalDecision;
exports.ProjectionPendingApprovalStatus = ProjectionPendingApprovalStatus;
exports.ProviderApprovalDecision = ProviderApprovalDecision;
exports.ProviderApprovalPolicy = ProviderApprovalPolicy;
exports.ProviderEvent = ProviderEvent;
exports.ProviderInteractionMode = ProviderInteractionMode;
exports.ProviderInterruptTurnInput = ProviderInterruptTurnInput;
exports.ProviderItemId = ProviderItemId;
exports.ProviderKind = ProviderKind;
exports.ProviderModelOptions = ProviderModelOptions;
exports.ProviderRequestKind = ProviderRequestKind;
exports.ProviderRespondToRequestInput = ProviderRespondToRequestInput;
exports.ProviderRespondToUserInputInput = ProviderRespondToUserInputInput;
exports.ProviderRuntimeEvent = ProviderRuntimeEvent;
exports.ProviderRuntimeEventV2 = ProviderRuntimeEventV2;
exports.ProviderRuntimeTurnStatus = ProviderRuntimeTurnStatus;
exports.ProviderSandboxMode = ProviderSandboxMode;
exports.ProviderSendTurnInput = ProviderSendTurnInput;
exports.ProviderSession = ProviderSession;
exports.ProviderSessionRuntimeStatus = ProviderSessionRuntimeStatus;
exports.ProviderSessionStartInput = ProviderSessionStartInput;
exports.ProviderStartOptions = ProviderStartOptions;
exports.ProviderStopSessionInput = ProviderStopSessionInput;
exports.ProviderTurnStartResult = ProviderTurnStartResult;
exports.ProviderUserInputAnswers = ProviderUserInputAnswers;
exports.REASONING_EFFORT_OPTIONS_BY_PROVIDER = REASONING_EFFORT_OPTIONS_BY_PROVIDER;
exports.ResolvedKeybindingRule = ResolvedKeybindingRule;
exports.ResolvedKeybindingsConfig = ResolvedKeybindingsConfig;
exports.RuntimeEventRaw = RuntimeEventRaw;
exports.RuntimeItemId = RuntimeItemId;
exports.RuntimeMode = RuntimeMode;
exports.RuntimeRequestId = RuntimeRequestId;
exports.RuntimeSessionId = RuntimeSessionId;
exports.RuntimeTaskId = RuntimeTaskId;
exports.SCRIPT_RUN_COMMAND_PATTERN = SCRIPT_RUN_COMMAND_PATTERN;
exports.ServerConfig = ServerConfig;
exports.ServerConfigIssue = ServerConfigIssue;
exports.ServerConfigUpdatedPayload = ServerConfigUpdatedPayload;
exports.ServerProviderAuthStatus = ServerProviderAuthStatus;
exports.ServerProviderStatus = ServerProviderStatus;
exports.ServerProviderStatusState = ServerProviderStatusState;
exports.ServerUpsertKeybindingInput = ServerUpsertKeybindingInput;
exports.ServerUpsertKeybindingResult = ServerUpsertKeybindingResult;
exports.TOOL_LIFECYCLE_ITEM_TYPES = TOOL_LIFECYCLE_ITEM_TYPES;
exports.TerminalClearInput = TerminalClearInput;
exports.TerminalCloseInput = TerminalCloseInput;
exports.TerminalEvent = TerminalEvent;
exports.TerminalOpenInput = TerminalOpenInput;
exports.TerminalResizeInput = TerminalResizeInput;
exports.TerminalRestartInput = TerminalRestartInput;
exports.TerminalSessionSnapshot = TerminalSessionSnapshot;
exports.TerminalSessionStatus = TerminalSessionStatus;
exports.TerminalThreadInput = TerminalThreadInput;
exports.TerminalWriteInput = TerminalWriteInput;
exports.ThreadActivityAppendedPayload = ThreadActivityAppendedPayload;
exports.ThreadApprovalResponseRequestedPayload = ThreadApprovalResponseRequestedPayload;
exports.ThreadCheckpointRevertRequestedPayload = ThreadCheckpointRevertRequestedPayload;
exports.ThreadCreatedPayload = ThreadCreatedPayload;
exports.ThreadDeletedPayload = ThreadDeletedPayload;
exports.ThreadId = ThreadId;
exports.ThreadInteractionModeSetPayload = ThreadInteractionModeSetPayload;
exports.ThreadMessageSentPayload = ThreadMessageSentPayload;
exports.ThreadMetaUpdatedPayload = ThreadMetaUpdatedPayload;
exports.ThreadProposedPlanUpsertedPayload = ThreadProposedPlanUpsertedPayload;
exports.ThreadRevertedPayload = ThreadRevertedPayload;
exports.ThreadRuntimeModeSetPayload = ThreadRuntimeModeSetPayload;
exports.ThreadSessionSetPayload = ThreadSessionSetPayload;
exports.ThreadSessionStopRequestedPayload = ThreadSessionStopRequestedPayload;
exports.ThreadTurnDiff = ThreadTurnDiff;
exports.ThreadTurnDiffCompletedPayload = ThreadTurnDiffCompletedPayload;
exports.ThreadTurnInterruptRequestedPayload = ThreadTurnInterruptRequestedPayload;
exports.ThreadTurnStartCommand = ThreadTurnStartCommand;
exports.ThreadTurnStartRequestedPayload = ThreadTurnStartRequestedPayload;
exports.ToolLifecycleItemType = ToolLifecycleItemType;
exports.TrimmedNonEmptyString = TrimmedNonEmptyString;
exports.TrimmedString = TrimmedString;
exports.TurnCountRange = TurnCountRange;
exports.TurnId = TurnId;
exports.UserInputQuestion = UserInputQuestion;
exports.WS_CHANNELS = WS_CHANNELS;
exports.WS_METHODS = WS_METHODS;
exports.WebSocketRequest = WebSocketRequest;
exports.WebSocketResponse = WebSocketResponse;
exports.WsPush = WsPush;
exports.WsPushChannelSchema = WsPushChannelSchema;
exports.WsPushEnvelopeBase = WsPushEnvelopeBase;
exports.WsPushOrchestrationDomainEvent = WsPushOrchestrationDomainEvent;
exports.WsPushSequence = WsPushSequence;
exports.WsPushServerConfigUpdated = WsPushServerConfigUpdated;
exports.WsPushServerWelcome = WsPushServerWelcome;
exports.WsPushTerminalEvent = WsPushTerminalEvent;
exports.WsResponse = WsResponse;
exports.WsWelcomePayload = WsWelcomePayload;
exports.isToolLifecycleItemType = isToolLifecycleItemType;