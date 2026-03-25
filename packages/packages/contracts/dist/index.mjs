import { Effect, Option, Schema, SchemaIssue, SchemaTransformation, Struct } from "effect";

//#region src/baseSchemas.ts
const TrimmedString = Schema.Trim;
const TrimmedNonEmptyString = TrimmedString.check(Schema.isNonEmpty());
const NonNegativeInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));
const PositiveInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(1));
const IsoDateTime = Schema.String;
/**
* Construct a branded identifier. Enforces non-empty trimmed strings
*/
const makeEntityId = (brand) => TrimmedNonEmptyString.pipe(Schema.brand(brand));
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
const TerminalColsSchema = Schema.Int.check(Schema.isGreaterThanOrEqualTo(20)).check(Schema.isLessThanOrEqualTo(400));
const TerminalRowsSchema = Schema.Int.check(Schema.isGreaterThanOrEqualTo(5)).check(Schema.isLessThanOrEqualTo(200));
const TerminalIdSchema = TrimmedNonEmptyStringSchema$2.check(Schema.isMaxLength(128));
const TerminalEnvKeySchema = Schema.String.check(Schema.isPattern(/^[A-Za-z_][A-Za-z0-9_]*$/)).check(Schema.isMaxLength(128));
const TerminalEnvValueSchema = Schema.String.check(Schema.isMaxLength(8192));
const TerminalEnvSchema = Schema.Record(TerminalEnvKeySchema, TerminalEnvValueSchema).check(Schema.isMaxProperties(128));
const TerminalIdWithDefaultSchema = TerminalIdSchema.pipe(Schema.withDecodingDefault(() => DEFAULT_TERMINAL_ID));
const TerminalThreadInput = Schema.Struct({ threadId: TrimmedNonEmptyStringSchema$2 });
const TerminalSessionInput = Schema.Struct({
	...TerminalThreadInput.fields,
	terminalId: TerminalIdWithDefaultSchema
});
const TerminalOpenInput = Schema.Struct({
	...TerminalSessionInput.fields,
	cwd: TrimmedNonEmptyStringSchema$2,
	cols: Schema.optional(TerminalColsSchema),
	rows: Schema.optional(TerminalRowsSchema),
	env: Schema.optional(TerminalEnvSchema)
});
const TerminalWriteInput = Schema.Struct({
	...TerminalSessionInput.fields,
	data: Schema.String.check(Schema.isNonEmpty()).check(Schema.isMaxLength(65536))
});
const TerminalResizeInput = Schema.Struct({
	...TerminalSessionInput.fields,
	cols: TerminalColsSchema,
	rows: TerminalRowsSchema
});
const TerminalClearInput = TerminalSessionInput;
const TerminalRestartInput = Schema.Struct({
	...TerminalSessionInput.fields,
	cwd: TrimmedNonEmptyStringSchema$2,
	cols: TerminalColsSchema,
	rows: TerminalRowsSchema,
	env: Schema.optional(TerminalEnvSchema)
});
const TerminalCloseInput = Schema.Struct({
	...TerminalThreadInput.fields,
	terminalId: Schema.optional(TerminalIdSchema),
	deleteHistory: Schema.optional(Schema.Boolean)
});
const TerminalSessionStatus = Schema.Literals([
	"starting",
	"running",
	"exited",
	"error"
]);
const TerminalSessionSnapshot = Schema.Struct({
	threadId: Schema.String.check(Schema.isNonEmpty()),
	terminalId: Schema.String.check(Schema.isNonEmpty()),
	cwd: Schema.String.check(Schema.isNonEmpty()),
	status: TerminalSessionStatus,
	pid: Schema.NullOr(Schema.Int.check(Schema.isGreaterThan(0))),
	history: Schema.String,
	exitCode: Schema.NullOr(Schema.Int),
	exitSignal: Schema.NullOr(Schema.Int),
	updatedAt: Schema.String
});
const TerminalEventBaseSchema = Schema.Struct({
	threadId: Schema.String.check(Schema.isNonEmpty()),
	terminalId: Schema.String.check(Schema.isNonEmpty()),
	createdAt: Schema.String
});
const TerminalStartedEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("started"),
	snapshot: TerminalSessionSnapshot
});
const TerminalOutputEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("output"),
	data: Schema.String
});
const TerminalExitedEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("exited"),
	exitCode: Schema.NullOr(Schema.Int),
	exitSignal: Schema.NullOr(Schema.Int)
});
const TerminalErrorEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("error"),
	message: Schema.String.check(Schema.isNonEmpty())
});
const TerminalClearedEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("cleared")
});
const TerminalRestartedEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("restarted"),
	snapshot: TerminalSessionSnapshot
});
const TerminalActivityEvent = Schema.Struct({
	...TerminalEventBaseSchema.fields,
	type: Schema.Literal("activity"),
	hasRunningSubprocess: Schema.Boolean
});
const TerminalEvent = Schema.Union([
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
const CodexModelOptions = Schema.Struct({
	reasoningEffort: Schema.optional(Schema.Literals(CODEX_REASONING_EFFORT_OPTIONS)),
	fastMode: Schema.optional(Schema.Boolean)
});
const ClaudeModelOptions = Schema.Struct({
	thinking: Schema.optional(Schema.Boolean),
	effort: Schema.optional(Schema.Literals(CLAUDE_CODE_EFFORT_OPTIONS)),
	fastMode: Schema.optional(Schema.Boolean)
});
const ProviderModelOptions = Schema.Struct({
	codex: Schema.optional(CodexModelOptions),
	claudeAgent: Schema.optional(ClaudeModelOptions)
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
const CanonicalProviderKind = Schema.Literals(["codex", "claudeAgent"]);
const PersistedProviderKind = Schema.Literals([
	"codex",
	"claudeAgent",
	"claude"
]);
const ProviderKind = PersistedProviderKind.pipe(Schema.decodeTo(Schema.toType(CanonicalProviderKind), SchemaTransformation.transformOrFail({
	decode: (provider) => Effect.succeed(provider === "claude" ? "claudeAgent" : provider),
	encode: (provider) => Effect.succeed(provider)
})));
const ProviderApprovalPolicy = Schema.Literals([
	"untrusted",
	"on-failure",
	"on-request",
	"never"
]);
const ProviderSandboxMode = Schema.Literals([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const DEFAULT_PROVIDER_KIND = "codex";
const CodexProviderStartOptions = Schema.Struct({
	binaryPath: Schema.optional(TrimmedNonEmptyString),
	homePath: Schema.optional(TrimmedNonEmptyString)
});
const ClaudeProviderStartOptions = Schema.Struct({
	binaryPath: Schema.optional(TrimmedNonEmptyString),
	permissionMode: Schema.optional(TrimmedNonEmptyString),
	maxThinkingTokens: Schema.optional(NonNegativeInt)
});
const ProviderStartOptions = Schema.Struct({
	codex: Schema.optional(CodexProviderStartOptions),
	claudeAgent: Schema.optional(ClaudeProviderStartOptions)
});
const RuntimeMode = Schema.Literals(["approval-required", "full-access"]);
const DEFAULT_RUNTIME_MODE = "full-access";
const ProviderInteractionMode = Schema.Literals(["default", "plan"]);
const DEFAULT_PROVIDER_INTERACTION_MODE = "default";
const ProviderRequestKind = Schema.Literals([
	"command",
	"file-read",
	"file-change"
]);
const AssistantDeliveryMode = Schema.Literals(["buffered", "streaming"]);
const ProviderApprovalDecision = Schema.Literals([
	"accept",
	"acceptForSession",
	"decline",
	"cancel"
]);
const ProviderUserInputAnswers = Schema.Record(Schema.String, Schema.Unknown);
const PROVIDER_SEND_TURN_MAX_INPUT_CHARS = 12e4;
const PROVIDER_SEND_TURN_MAX_ATTACHMENTS = 8;
const PROVIDER_SEND_TURN_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const PROVIDER_SEND_TURN_MAX_IMAGE_DATA_URL_CHARS = 14e6;
const CHAT_ATTACHMENT_ID_MAX_CHARS = 128;
const CorrelationId = CommandId;
const ChatAttachmentId = TrimmedNonEmptyString.check(Schema.isMaxLength(CHAT_ATTACHMENT_ID_MAX_CHARS), Schema.isPattern(/^[a-z0-9_-]+$/i));
const ChatImageAttachment = Schema.Struct({
	type: Schema.Literal("image"),
	id: ChatAttachmentId,
	name: TrimmedNonEmptyString.check(Schema.isMaxLength(255)),
	mimeType: TrimmedNonEmptyString.check(Schema.isMaxLength(100), Schema.isPattern(/^image\//i)),
	sizeBytes: NonNegativeInt.check(Schema.isLessThanOrEqualTo(PROVIDER_SEND_TURN_MAX_IMAGE_BYTES))
});
const UploadChatImageAttachment = Schema.Struct({
	type: Schema.Literal("image"),
	name: TrimmedNonEmptyString.check(Schema.isMaxLength(255)),
	mimeType: TrimmedNonEmptyString.check(Schema.isMaxLength(100), Schema.isPattern(/^image\//i)),
	sizeBytes: NonNegativeInt.check(Schema.isLessThanOrEqualTo(PROVIDER_SEND_TURN_MAX_IMAGE_BYTES)),
	dataUrl: TrimmedNonEmptyString.check(Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_IMAGE_DATA_URL_CHARS))
});
const ChatAttachment = Schema.Union([ChatImageAttachment]);
const UploadChatAttachment = Schema.Union([UploadChatImageAttachment]);
const ProjectScriptIcon = Schema.Literals([
	"play",
	"test",
	"lint",
	"configure",
	"build",
	"debug"
]);
const ProjectScript = Schema.Struct({
	id: TrimmedNonEmptyString,
	name: TrimmedNonEmptyString,
	command: TrimmedNonEmptyString,
	icon: ProjectScriptIcon,
	runOnWorktreeCreate: Schema.Boolean
});
const OrchestrationProject = Schema.Struct({
	id: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: Schema.NullOr(TrimmedNonEmptyString),
	scripts: Schema.Array(ProjectScript),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	deletedAt: Schema.NullOr(IsoDateTime)
});
const OrchestrationMessageRole = Schema.Literals([
	"user",
	"assistant",
	"system"
]);
const OrchestrationMessage = Schema.Struct({
	id: MessageId,
	role: OrchestrationMessageRole,
	text: Schema.String,
	attachments: Schema.optional(Schema.Array(ChatAttachment)),
	turnId: Schema.NullOr(TurnId),
	streaming: Schema.Boolean,
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const OrchestrationProposedPlanId = TrimmedNonEmptyString;
const OrchestrationProposedPlan = Schema.Struct({
	id: OrchestrationProposedPlanId,
	turnId: Schema.NullOr(TurnId),
	planMarkdown: TrimmedNonEmptyString,
	implementedAt: Schema.NullOr(IsoDateTime).pipe(Schema.withDecodingDefault(() => null)),
	implementationThreadId: Schema.NullOr(ThreadId).pipe(Schema.withDecodingDefault(() => null)),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const SourceProposedPlanReference = Schema.Struct({
	threadId: ThreadId,
	planId: OrchestrationProposedPlanId
});
const OrchestrationSessionStatus = Schema.Literals([
	"idle",
	"starting",
	"running",
	"ready",
	"interrupted",
	"stopped",
	"error"
]);
const OrchestrationSession = Schema.Struct({
	threadId: ThreadId,
	status: OrchestrationSessionStatus,
	providerName: Schema.NullOr(TrimmedNonEmptyString),
	runtimeMode: RuntimeMode.pipe(Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	activeTurnId: Schema.NullOr(TurnId),
	lastError: Schema.NullOr(TrimmedNonEmptyString),
	updatedAt: IsoDateTime
});
const OrchestrationCheckpointFile = Schema.Struct({
	path: TrimmedNonEmptyString,
	kind: TrimmedNonEmptyString,
	additions: NonNegativeInt,
	deletions: NonNegativeInt
});
const OrchestrationCheckpointStatus = Schema.Literals([
	"ready",
	"missing",
	"error"
]);
const OrchestrationCheckpointSummary = Schema.Struct({
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const OrchestrationThreadActivityTone = Schema.Literals([
	"info",
	"tool",
	"approval",
	"error"
]);
const OrchestrationThreadActivity = Schema.Struct({
	id: EventId,
	tone: OrchestrationThreadActivityTone,
	kind: TrimmedNonEmptyString,
	summary: TrimmedNonEmptyString,
	payload: Schema.Unknown,
	turnId: Schema.NullOr(TurnId),
	sequence: Schema.optional(NonNegativeInt),
	createdAt: IsoDateTime
});
const OrchestrationLatestTurnState = Schema.Literals([
	"running",
	"interrupted",
	"completed",
	"error"
]);
const OrchestrationLatestTurn = Schema.Struct({
	turnId: TurnId,
	state: OrchestrationLatestTurnState,
	requestedAt: IsoDateTime,
	startedAt: Schema.NullOr(IsoDateTime),
	completedAt: Schema.NullOr(IsoDateTime),
	assistantMessageId: Schema.NullOr(MessageId),
	sourceProposedPlan: Schema.optional(SourceProposedPlanReference)
});
const OrchestrationThread = Schema.Struct({
	id: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: Schema.NullOr(TrimmedNonEmptyString),
	latestTurn: Schema.NullOr(OrchestrationLatestTurn),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	deletedAt: Schema.NullOr(IsoDateTime),
	messages: Schema.Array(OrchestrationMessage),
	proposedPlans: Schema.Array(OrchestrationProposedPlan).pipe(Schema.withDecodingDefault(() => [])),
	activities: Schema.Array(OrchestrationThreadActivity),
	checkpoints: Schema.Array(OrchestrationCheckpointSummary),
	session: Schema.NullOr(OrchestrationSession)
});
const OrchestrationReadModel = Schema.Struct({
	snapshotSequence: NonNegativeInt,
	projects: Schema.Array(OrchestrationProject),
	threads: Schema.Array(OrchestrationThread),
	updatedAt: IsoDateTime
});
const ProjectCreateCommand = Schema.Struct({
	type: Schema.Literal("project.create"),
	commandId: CommandId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: Schema.optional(TrimmedNonEmptyString),
	createdAt: IsoDateTime
});
const ProjectMetaUpdateCommand = Schema.Struct({
	type: Schema.Literal("project.meta.update"),
	commandId: CommandId,
	projectId: ProjectId,
	title: Schema.optional(TrimmedNonEmptyString),
	workspaceRoot: Schema.optional(TrimmedNonEmptyString),
	defaultModel: Schema.optional(TrimmedNonEmptyString),
	scripts: Schema.optional(Schema.Array(ProjectScript))
});
const ProjectDeleteCommand = Schema.Struct({
	type: Schema.Literal("project.delete"),
	commandId: CommandId,
	projectId: ProjectId
});
const ThreadCreateCommand = Schema.Struct({
	type: Schema.Literal("thread.create"),
	commandId: CommandId,
	threadId: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: Schema.NullOr(TrimmedNonEmptyString),
	createdAt: IsoDateTime
});
const ThreadDeleteCommand = Schema.Struct({
	type: Schema.Literal("thread.delete"),
	commandId: CommandId,
	threadId: ThreadId
});
const ThreadMetaUpdateCommand = Schema.Struct({
	type: Schema.Literal("thread.meta.update"),
	commandId: CommandId,
	threadId: ThreadId,
	title: Schema.optional(TrimmedNonEmptyString),
	model: Schema.optional(TrimmedNonEmptyString),
	branch: Schema.optional(Schema.NullOr(TrimmedNonEmptyString)),
	worktreePath: Schema.optional(Schema.NullOr(TrimmedNonEmptyString))
});
const ThreadRuntimeModeSetCommand = Schema.Struct({
	type: Schema.Literal("thread.runtime-mode.set"),
	commandId: CommandId,
	threadId: ThreadId,
	runtimeMode: RuntimeMode,
	createdAt: IsoDateTime
});
const ThreadInteractionModeSetCommand = Schema.Struct({
	type: Schema.Literal("thread.interaction-mode.set"),
	commandId: CommandId,
	threadId: ThreadId,
	interactionMode: ProviderInteractionMode,
	createdAt: IsoDateTime
});
const ThreadTurnStartCommand = Schema.Struct({
	type: Schema.Literal("thread.turn.start"),
	commandId: CommandId,
	threadId: ThreadId,
	message: Schema.Struct({
		messageId: MessageId,
		role: Schema.Literal("user"),
		text: Schema.String,
		attachments: Schema.Array(ChatAttachment)
	}),
	provider: Schema.optional(ProviderKind),
	model: Schema.optional(TrimmedNonEmptyString),
	modelOptions: Schema.optional(ProviderModelOptions),
	providerOptions: Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode.pipe(Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	sourceProposedPlan: Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ClientThreadTurnStartCommand = Schema.Struct({
	type: Schema.Literal("thread.turn.start"),
	commandId: CommandId,
	threadId: ThreadId,
	message: Schema.Struct({
		messageId: MessageId,
		role: Schema.Literal("user"),
		text: Schema.String,
		attachments: Schema.Array(UploadChatAttachment)
	}),
	provider: Schema.optional(ProviderKind),
	model: Schema.optional(TrimmedNonEmptyString),
	modelOptions: Schema.optional(ProviderModelOptions),
	providerOptions: Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode,
	interactionMode: ProviderInteractionMode,
	sourceProposedPlan: Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ThreadTurnInterruptCommand = Schema.Struct({
	type: Schema.Literal("thread.turn.interrupt"),
	commandId: CommandId,
	threadId: ThreadId,
	turnId: Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadApprovalRespondCommand = Schema.Struct({
	type: Schema.Literal("thread.approval.respond"),
	commandId: CommandId,
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision,
	createdAt: IsoDateTime
});
const ThreadUserInputRespondCommand = Schema.Struct({
	type: Schema.Literal("thread.user-input.respond"),
	commandId: CommandId,
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers,
	createdAt: IsoDateTime
});
const ThreadCheckpointRevertCommand = Schema.Struct({
	type: Schema.Literal("thread.checkpoint.revert"),
	commandId: CommandId,
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadSessionStopCommand = Schema.Struct({
	type: Schema.Literal("thread.session.stop"),
	commandId: CommandId,
	threadId: ThreadId,
	createdAt: IsoDateTime
});
const DispatchableClientOrchestrationCommand = Schema.Union([
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
const ClientOrchestrationCommand = Schema.Union([
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
const ThreadSessionSetCommand = Schema.Struct({
	type: Schema.Literal("thread.session.set"),
	commandId: CommandId,
	threadId: ThreadId,
	session: OrchestrationSession,
	createdAt: IsoDateTime
});
const ThreadMessageAssistantDeltaCommand = Schema.Struct({
	type: Schema.Literal("thread.message.assistant.delta"),
	commandId: CommandId,
	threadId: ThreadId,
	messageId: MessageId,
	delta: Schema.String,
	turnId: Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadMessageAssistantCompleteCommand = Schema.Struct({
	type: Schema.Literal("thread.message.assistant.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	messageId: MessageId,
	turnId: Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadProposedPlanUpsertCommand = Schema.Struct({
	type: Schema.Literal("thread.proposed-plan.upsert"),
	commandId: CommandId,
	threadId: ThreadId,
	proposedPlan: OrchestrationProposedPlan,
	createdAt: IsoDateTime
});
const ThreadTurnDiffCompleteCommand = Schema.Struct({
	type: Schema.Literal("thread.turn.diff.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	turnId: TurnId,
	completedAt: IsoDateTime,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: Schema.optional(MessageId),
	checkpointTurnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadActivityAppendCommand = Schema.Struct({
	type: Schema.Literal("thread.activity.append"),
	commandId: CommandId,
	threadId: ThreadId,
	activity: OrchestrationThreadActivity,
	createdAt: IsoDateTime
});
const ThreadRevertCompleteCommand = Schema.Struct({
	type: Schema.Literal("thread.revert.complete"),
	commandId: CommandId,
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const InternalOrchestrationCommand = Schema.Union([
	ThreadSessionSetCommand,
	ThreadMessageAssistantDeltaCommand,
	ThreadMessageAssistantCompleteCommand,
	ThreadProposedPlanUpsertCommand,
	ThreadTurnDiffCompleteCommand,
	ThreadActivityAppendCommand,
	ThreadRevertCompleteCommand
]);
const OrchestrationCommand = Schema.Union([DispatchableClientOrchestrationCommand, InternalOrchestrationCommand]);
const OrchestrationEventType = Schema.Literals([
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
const OrchestrationAggregateKind = Schema.Literals(["project", "thread"]);
const OrchestrationActorKind = Schema.Literals([
	"client",
	"server",
	"provider"
]);
const ProjectCreatedPayload = Schema.Struct({
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	workspaceRoot: TrimmedNonEmptyString,
	defaultModel: Schema.NullOr(TrimmedNonEmptyString),
	scripts: Schema.Array(ProjectScript),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ProjectMetaUpdatedPayload = Schema.Struct({
	projectId: ProjectId,
	title: Schema.optional(TrimmedNonEmptyString),
	workspaceRoot: Schema.optional(TrimmedNonEmptyString),
	defaultModel: Schema.optional(Schema.NullOr(TrimmedNonEmptyString)),
	scripts: Schema.optional(Schema.Array(ProjectScript)),
	updatedAt: IsoDateTime
});
const ProjectDeletedPayload = Schema.Struct({
	projectId: ProjectId,
	deletedAt: IsoDateTime
});
const ThreadCreatedPayload = Schema.Struct({
	threadId: ThreadId,
	projectId: ProjectId,
	title: TrimmedNonEmptyString,
	model: TrimmedNonEmptyString,
	runtimeMode: RuntimeMode.pipe(Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	branch: Schema.NullOr(TrimmedNonEmptyString),
	worktreePath: Schema.NullOr(TrimmedNonEmptyString),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ThreadDeletedPayload = Schema.Struct({
	threadId: ThreadId,
	deletedAt: IsoDateTime
});
const ThreadMetaUpdatedPayload = Schema.Struct({
	threadId: ThreadId,
	title: Schema.optional(TrimmedNonEmptyString),
	model: Schema.optional(TrimmedNonEmptyString),
	branch: Schema.optional(Schema.NullOr(TrimmedNonEmptyString)),
	worktreePath: Schema.optional(Schema.NullOr(TrimmedNonEmptyString)),
	updatedAt: IsoDateTime
});
const ThreadRuntimeModeSetPayload = Schema.Struct({
	threadId: ThreadId,
	runtimeMode: RuntimeMode,
	updatedAt: IsoDateTime
});
const ThreadInteractionModeSetPayload = Schema.Struct({
	threadId: ThreadId,
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	updatedAt: IsoDateTime
});
const ThreadMessageSentPayload = Schema.Struct({
	threadId: ThreadId,
	messageId: MessageId,
	role: OrchestrationMessageRole,
	text: Schema.String,
	attachments: Schema.optional(Schema.Array(ChatAttachment)),
	turnId: Schema.NullOr(TurnId),
	streaming: Schema.Boolean,
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime
});
const ThreadTurnStartRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	messageId: MessageId,
	provider: Schema.optional(ProviderKind),
	model: Schema.optional(TrimmedNonEmptyString),
	modelOptions: Schema.optional(ProviderModelOptions),
	providerOptions: Schema.optional(ProviderStartOptions),
	assistantDeliveryMode: Schema.optional(AssistantDeliveryMode),
	runtimeMode: RuntimeMode.pipe(Schema.withDecodingDefault(() => DEFAULT_RUNTIME_MODE)),
	interactionMode: ProviderInteractionMode.pipe(Schema.withDecodingDefault(() => DEFAULT_PROVIDER_INTERACTION_MODE)),
	sourceProposedPlan: Schema.optional(SourceProposedPlanReference),
	createdAt: IsoDateTime
});
const ThreadTurnInterruptRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	turnId: Schema.optional(TurnId),
	createdAt: IsoDateTime
});
const ThreadApprovalResponseRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision,
	createdAt: IsoDateTime
});
const ThreadUserInputResponseRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers,
	createdAt: IsoDateTime
});
const ThreadCheckpointRevertRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	turnCount: NonNegativeInt,
	createdAt: IsoDateTime
});
const ThreadRevertedPayload = Schema.Struct({
	threadId: ThreadId,
	turnCount: NonNegativeInt
});
const ThreadSessionStopRequestedPayload = Schema.Struct({
	threadId: ThreadId,
	createdAt: IsoDateTime
});
const ThreadSessionSetPayload = Schema.Struct({
	threadId: ThreadId,
	session: OrchestrationSession
});
const ThreadProposedPlanUpsertedPayload = Schema.Struct({
	threadId: ThreadId,
	proposedPlan: OrchestrationProposedPlan
});
const ThreadTurnDiffCompletedPayload = Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const ThreadActivityAppendedPayload = Schema.Struct({
	threadId: ThreadId,
	activity: OrchestrationThreadActivity
});
const OrchestrationEventMetadata = Schema.Struct({
	providerTurnId: Schema.optional(TrimmedNonEmptyString),
	providerItemId: Schema.optional(ProviderItemId),
	adapterKey: Schema.optional(TrimmedNonEmptyString),
	requestId: Schema.optional(ApprovalRequestId),
	ingestedAt: Schema.optional(IsoDateTime)
});
const EventBaseFields = {
	sequence: NonNegativeInt,
	eventId: EventId,
	aggregateKind: OrchestrationAggregateKind,
	aggregateId: Schema.Union([ProjectId, ThreadId]),
	occurredAt: IsoDateTime,
	commandId: Schema.NullOr(CommandId),
	causationEventId: Schema.NullOr(EventId),
	correlationId: Schema.NullOr(CommandId),
	metadata: OrchestrationEventMetadata
};
const OrchestrationEvent = Schema.Union([
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("project.created"),
		payload: ProjectCreatedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("project.meta-updated"),
		payload: ProjectMetaUpdatedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("project.deleted"),
		payload: ProjectDeletedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.created"),
		payload: ThreadCreatedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.deleted"),
		payload: ThreadDeletedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.meta-updated"),
		payload: ThreadMetaUpdatedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.runtime-mode-set"),
		payload: ThreadRuntimeModeSetPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.interaction-mode-set"),
		payload: ThreadInteractionModeSetPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.message-sent"),
		payload: ThreadMessageSentPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.turn-start-requested"),
		payload: ThreadTurnStartRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.turn-interrupt-requested"),
		payload: ThreadTurnInterruptRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.approval-response-requested"),
		payload: ThreadApprovalResponseRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.user-input-response-requested"),
		payload: ThreadUserInputResponseRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.checkpoint-revert-requested"),
		payload: ThreadCheckpointRevertRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.reverted"),
		payload: ThreadRevertedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.session-stop-requested"),
		payload: ThreadSessionStopRequestedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.session-set"),
		payload: ThreadSessionSetPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.proposed-plan-upserted"),
		payload: ThreadProposedPlanUpsertedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.turn-diff-completed"),
		payload: ThreadTurnDiffCompletedPayload
	}),
	Schema.Struct({
		...EventBaseFields,
		type: Schema.Literal("thread.activity-appended"),
		payload: ThreadActivityAppendedPayload
	})
]);
const OrchestrationCommandReceiptStatus = Schema.Literals(["accepted", "rejected"]);
const TurnCountRange = Schema.Struct({
	fromTurnCount: NonNegativeInt,
	toTurnCount: NonNegativeInt
}).check(Schema.makeFilter((input) => input.fromTurnCount <= input.toTurnCount || new SchemaIssue.InvalidValue(Option.some(input.fromTurnCount), { message: "fromTurnCount must be less than or equal to toTurnCount" }), { identifier: "OrchestrationTurnDiffRange" }));
const ThreadTurnDiff = TurnCountRange.mapFields(Struct.assign({
	threadId: ThreadId,
	diff: Schema.String
}), { unsafePreserveChecks: true });
const ProviderSessionRuntimeStatus = Schema.Literals([
	"starting",
	"running",
	"stopped",
	"error"
]);
Schema.Literals([
	"running",
	"completed",
	"interrupted",
	"error"
]);
Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	checkpointTurnCount: NonNegativeInt,
	checkpointRef: CheckpointRef,
	status: OrchestrationCheckpointStatus,
	files: Schema.Array(OrchestrationCheckpointFile),
	assistantMessageId: Schema.NullOr(MessageId),
	completedAt: IsoDateTime
});
const ProjectionPendingApprovalStatus = Schema.Literals(["pending", "resolved"]);
const ProjectionPendingApprovalDecision = Schema.NullOr(ProviderApprovalDecision);
const DispatchResult = Schema.Struct({ sequence: NonNegativeInt });
const OrchestrationGetSnapshotInput = Schema.Struct({});
const OrchestrationGetSnapshotResult = OrchestrationReadModel;
const OrchestrationGetTurnDiffInput = TurnCountRange.mapFields(Struct.assign({ threadId: ThreadId }), { unsafePreserveChecks: true });
const OrchestrationGetTurnDiffResult = ThreadTurnDiff;
const OrchestrationGetFullThreadDiffInput = Schema.Struct({
	threadId: ThreadId,
	toTurnCount: NonNegativeInt
});
const OrchestrationGetFullThreadDiffResult = ThreadTurnDiff;
const OrchestrationReplayEventsInput = Schema.Struct({ fromSequenceExclusive: NonNegativeInt });
const OrchestrationReplayEventsResult = Schema.Array(OrchestrationEvent);
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
const ProviderSessionStatus = Schema.Literals([
	"connecting",
	"ready",
	"running",
	"error",
	"closed"
]);
const ProviderSession = Schema.Struct({
	provider: ProviderKind,
	status: ProviderSessionStatus,
	runtimeMode: RuntimeMode,
	cwd: Schema.optional(TrimmedNonEmptyString),
	model: Schema.optional(TrimmedNonEmptyString),
	threadId: ThreadId,
	resumeCursor: Schema.optional(Schema.Unknown),
	activeTurnId: Schema.optional(TurnId),
	createdAt: IsoDateTime,
	updatedAt: IsoDateTime,
	lastError: Schema.optional(TrimmedNonEmptyString)
});
const ProviderSessionStartInput = Schema.Struct({
	threadId: ThreadId,
	provider: Schema.optional(ProviderKind),
	cwd: Schema.optional(TrimmedNonEmptyString),
	model: Schema.optional(TrimmedNonEmptyString),
	modelOptions: Schema.optional(ProviderModelOptions),
	resumeCursor: Schema.optional(Schema.Unknown),
	approvalPolicy: Schema.optional(ProviderApprovalPolicy),
	sandboxMode: Schema.optional(ProviderSandboxMode),
	providerOptions: Schema.optional(ProviderStartOptions),
	runtimeMode: RuntimeMode
});
const ProviderSendTurnInput = Schema.Struct({
	threadId: ThreadId,
	input: Schema.optional(TrimmedNonEmptyString.check(Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_INPUT_CHARS))),
	attachments: Schema.optional(Schema.Array(ChatAttachment).check(Schema.isMaxLength(PROVIDER_SEND_TURN_MAX_ATTACHMENTS))),
	model: Schema.optional(TrimmedNonEmptyString),
	modelOptions: Schema.optional(ProviderModelOptions),
	interactionMode: Schema.optional(ProviderInteractionMode)
});
const ProviderTurnStartResult = Schema.Struct({
	threadId: ThreadId,
	turnId: TurnId,
	resumeCursor: Schema.optional(Schema.Unknown)
});
const ProviderInterruptTurnInput = Schema.Struct({
	threadId: ThreadId,
	turnId: Schema.optional(TurnId)
});
const ProviderStopSessionInput = Schema.Struct({ threadId: ThreadId });
const ProviderRespondToRequestInput = Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	decision: ProviderApprovalDecision
});
const ProviderRespondToUserInputInput = Schema.Struct({
	threadId: ThreadId,
	requestId: ApprovalRequestId,
	answers: ProviderUserInputAnswers
});
const ProviderEventKind = Schema.Literals([
	"session",
	"notification",
	"request",
	"error"
]);
const ProviderEvent = Schema.Struct({
	id: EventId,
	kind: ProviderEventKind,
	provider: ProviderKind,
	threadId: ThreadId,
	createdAt: IsoDateTime,
	method: TrimmedNonEmptyString,
	message: Schema.optional(TrimmedNonEmptyString),
	turnId: Schema.optional(TurnId),
	itemId: Schema.optional(ProviderItemId),
	requestId: Schema.optional(ApprovalRequestId),
	requestKind: Schema.optional(ProviderRequestKind),
	textDelta: Schema.optional(Schema.String),
	payload: Schema.optional(Schema.Unknown)
});

//#endregion
//#region src/providerRuntime.ts
const TrimmedNonEmptyStringSchema$1 = TrimmedNonEmptyString;
const UnknownRecordSchema = Schema.Record(Schema.String, Schema.Unknown);
const RuntimeEventRawSource = Schema.Literals([
	"codex.app-server.notification",
	"codex.app-server.request",
	"codex.eventmsg",
	"claude.sdk.message",
	"claude.sdk.permission",
	"codex.sdk.thread-event"
]);
const RuntimeEventRaw = Schema.Struct({
	source: RuntimeEventRawSource,
	method: Schema.optional(TrimmedNonEmptyStringSchema$1),
	messageType: Schema.optional(TrimmedNonEmptyStringSchema$1),
	payload: Schema.Unknown
});
const ProviderRequestId = TrimmedNonEmptyStringSchema$1;
const ProviderRefs = Schema.Struct({
	providerTurnId: Schema.optional(TrimmedNonEmptyStringSchema$1),
	providerItemId: Schema.optional(ProviderItemId),
	providerRequestId: Schema.optional(ProviderRequestId)
});
const RuntimeSessionState = Schema.Literals([
	"starting",
	"ready",
	"running",
	"waiting",
	"stopped",
	"error"
]);
const RuntimeThreadState = Schema.Literals([
	"active",
	"idle",
	"archived",
	"closed",
	"compacted",
	"error"
]);
const RuntimeTurnState = Schema.Literals([
	"completed",
	"failed",
	"interrupted",
	"cancelled"
]);
const RuntimePlanStepStatus = Schema.Literals([
	"pending",
	"inProgress",
	"completed"
]);
const RuntimeItemStatus = Schema.Literals([
	"inProgress",
	"completed",
	"failed",
	"declined"
]);
const RuntimeContentStreamKind = Schema.Literals([
	"assistant_text",
	"reasoning_text",
	"reasoning_summary_text",
	"plan_text",
	"command_output",
	"file_change_output",
	"unknown"
]);
const RuntimeSessionExitKind = Schema.Literals(["graceful", "error"]);
const RuntimeErrorClass = Schema.Literals([
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
const ToolLifecycleItemType = Schema.Literals(TOOL_LIFECYCLE_ITEM_TYPES);
function isToolLifecycleItemType(value) {
	return TOOL_LIFECYCLE_ITEM_TYPES.includes(value);
}
const CanonicalItemType = Schema.Literals([
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
const CanonicalRequestType = Schema.Literals([
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
Schema.Literals([
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
const SessionStartedType = Schema.Literal("session.started");
const SessionConfiguredType = Schema.Literal("session.configured");
const SessionStateChangedType = Schema.Literal("session.state.changed");
const SessionExitedType = Schema.Literal("session.exited");
const ThreadStartedType = Schema.Literal("thread.started");
const ThreadStateChangedType = Schema.Literal("thread.state.changed");
const ThreadMetadataUpdatedType = Schema.Literal("thread.metadata.updated");
const ThreadTokenUsageUpdatedType = Schema.Literal("thread.token-usage.updated");
const ThreadRealtimeStartedType = Schema.Literal("thread.realtime.started");
const ThreadRealtimeItemAddedType = Schema.Literal("thread.realtime.item-added");
const ThreadRealtimeAudioDeltaType = Schema.Literal("thread.realtime.audio.delta");
const ThreadRealtimeErrorType = Schema.Literal("thread.realtime.error");
const ThreadRealtimeClosedType = Schema.Literal("thread.realtime.closed");
const TurnStartedType = Schema.Literal("turn.started");
const TurnCompletedType = Schema.Literal("turn.completed");
const TurnAbortedType = Schema.Literal("turn.aborted");
const TurnPlanUpdatedType = Schema.Literal("turn.plan.updated");
const TurnProposedDeltaType = Schema.Literal("turn.proposed.delta");
const TurnProposedCompletedType = Schema.Literal("turn.proposed.completed");
const TurnDiffUpdatedType = Schema.Literal("turn.diff.updated");
const ItemStartedType = Schema.Literal("item.started");
const ItemUpdatedType = Schema.Literal("item.updated");
const ItemCompletedType = Schema.Literal("item.completed");
const ContentDeltaType = Schema.Literal("content.delta");
const RequestOpenedType = Schema.Literal("request.opened");
const RequestResolvedType = Schema.Literal("request.resolved");
const UserInputRequestedType = Schema.Literal("user-input.requested");
const UserInputResolvedType = Schema.Literal("user-input.resolved");
const TaskStartedType = Schema.Literal("task.started");
const TaskProgressType = Schema.Literal("task.progress");
const TaskCompletedType = Schema.Literal("task.completed");
const HookStartedType = Schema.Literal("hook.started");
const HookProgressType = Schema.Literal("hook.progress");
const HookCompletedType = Schema.Literal("hook.completed");
const ToolProgressType = Schema.Literal("tool.progress");
const ToolSummaryType = Schema.Literal("tool.summary");
const AuthStatusType = Schema.Literal("auth.status");
const AccountUpdatedType = Schema.Literal("account.updated");
const AccountRateLimitsUpdatedType = Schema.Literal("account.rate-limits.updated");
const McpStatusUpdatedType = Schema.Literal("mcp.status.updated");
const McpOauthCompletedType = Schema.Literal("mcp.oauth.completed");
const ModelReroutedType = Schema.Literal("model.rerouted");
const ConfigWarningType = Schema.Literal("config.warning");
const DeprecationNoticeType = Schema.Literal("deprecation.notice");
const FilesPersistedType = Schema.Literal("files.persisted");
const RuntimeWarningType = Schema.Literal("runtime.warning");
const RuntimeErrorType = Schema.Literal("runtime.error");
const ProviderRuntimeEventBase = Schema.Struct({
	eventId: EventId,
	provider: ProviderKind,
	threadId: ThreadId,
	createdAt: IsoDateTime,
	turnId: Schema.optional(TurnId),
	itemId: Schema.optional(RuntimeItemId),
	requestId: Schema.optional(RuntimeRequestId),
	providerRefs: Schema.optional(ProviderRefs),
	raw: Schema.optional(RuntimeEventRaw)
});
const SessionStartedPayload = Schema.Struct({
	message: Schema.optional(TrimmedNonEmptyStringSchema$1),
	resume: Schema.optional(Schema.Unknown)
});
const SessionConfiguredPayload = Schema.Struct({ config: UnknownRecordSchema });
const SessionStateChangedPayload = Schema.Struct({
	state: RuntimeSessionState,
	reason: Schema.optional(TrimmedNonEmptyStringSchema$1),
	detail: Schema.optional(Schema.Unknown)
});
const SessionExitedPayload = Schema.Struct({
	reason: Schema.optional(TrimmedNonEmptyStringSchema$1),
	recoverable: Schema.optional(Schema.Boolean),
	exitKind: Schema.optional(RuntimeSessionExitKind)
});
const ThreadStartedPayload = Schema.Struct({ providerThreadId: Schema.optional(TrimmedNonEmptyStringSchema$1) });
const ThreadStateChangedPayload = Schema.Struct({
	state: RuntimeThreadState,
	detail: Schema.optional(Schema.Unknown)
});
const ThreadMetadataUpdatedPayload = Schema.Struct({
	name: Schema.optional(TrimmedNonEmptyStringSchema$1),
	metadata: Schema.optional(UnknownRecordSchema)
});
const ThreadTokenUsageUpdatedPayload = Schema.Struct({ usage: Schema.Unknown });
const ThreadRealtimeStartedPayload = Schema.Struct({ realtimeSessionId: Schema.optional(TrimmedNonEmptyStringSchema$1) });
const ThreadRealtimeItemAddedPayload = Schema.Struct({ item: Schema.Unknown });
const ThreadRealtimeAudioDeltaPayload = Schema.Struct({ audio: Schema.Unknown });
const ThreadRealtimeErrorPayload = Schema.Struct({ message: TrimmedNonEmptyStringSchema$1 });
const ThreadRealtimeClosedPayload = Schema.Struct({ reason: Schema.optional(TrimmedNonEmptyStringSchema$1) });
const TurnStartedPayload = Schema.Struct({
	model: Schema.optional(TrimmedNonEmptyStringSchema$1),
	effort: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TurnCompletedPayload = Schema.Struct({
	state: RuntimeTurnState,
	stopReason: Schema.optional(Schema.NullOr(TrimmedNonEmptyStringSchema$1)),
	usage: Schema.optional(Schema.Unknown),
	modelUsage: Schema.optional(UnknownRecordSchema),
	totalCostUsd: Schema.optional(Schema.Number),
	errorMessage: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TurnAbortedPayload = Schema.Struct({ reason: TrimmedNonEmptyStringSchema$1 });
const RuntimePlanStep = Schema.Struct({
	step: TrimmedNonEmptyStringSchema$1,
	status: RuntimePlanStepStatus
});
const TurnPlanUpdatedPayload = Schema.Struct({
	explanation: Schema.optional(Schema.NullOr(TrimmedNonEmptyStringSchema$1)),
	plan: Schema.Array(RuntimePlanStep)
});
const TurnProposedDeltaPayload = Schema.Struct({ delta: Schema.String });
const TurnProposedCompletedPayload = Schema.Struct({ planMarkdown: TrimmedNonEmptyStringSchema$1 });
const TurnDiffUpdatedPayload = Schema.Struct({ unifiedDiff: Schema.String });
const ItemLifecyclePayload = Schema.Struct({
	itemType: CanonicalItemType,
	status: Schema.optional(RuntimeItemStatus),
	title: Schema.optional(TrimmedNonEmptyStringSchema$1),
	detail: Schema.optional(TrimmedNonEmptyStringSchema$1),
	data: Schema.optional(Schema.Unknown)
});
const ContentDeltaPayload = Schema.Struct({
	streamKind: RuntimeContentStreamKind,
	delta: Schema.String,
	contentIndex: Schema.optional(Schema.Int),
	summaryIndex: Schema.optional(Schema.Int)
});
const RequestOpenedPayload = Schema.Struct({
	requestType: CanonicalRequestType,
	detail: Schema.optional(TrimmedNonEmptyStringSchema$1),
	args: Schema.optional(Schema.Unknown)
});
const RequestResolvedPayload = Schema.Struct({
	requestType: CanonicalRequestType,
	decision: Schema.optional(TrimmedNonEmptyStringSchema$1),
	resolution: Schema.optional(Schema.Unknown)
});
const UserInputQuestionOption = Schema.Struct({
	label: TrimmedNonEmptyStringSchema$1,
	description: TrimmedNonEmptyStringSchema$1
});
const UserInputQuestion = Schema.Struct({
	id: TrimmedNonEmptyStringSchema$1,
	header: TrimmedNonEmptyStringSchema$1,
	question: TrimmedNonEmptyStringSchema$1,
	options: Schema.Array(UserInputQuestionOption),
	multiSelect: Schema.optional(Schema.Boolean).pipe(Schema.withConstructorDefault(() => Option.some(false)))
});
const UserInputRequestedPayload = Schema.Struct({ questions: Schema.Array(UserInputQuestion) });
const UserInputResolvedPayload = Schema.Struct({ answers: UnknownRecordSchema });
const TaskStartedPayload = Schema.Struct({
	taskId: RuntimeTaskId,
	description: Schema.optional(TrimmedNonEmptyStringSchema$1),
	taskType: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TaskProgressPayload = Schema.Struct({
	taskId: RuntimeTaskId,
	description: TrimmedNonEmptyStringSchema$1,
	summary: Schema.optional(TrimmedNonEmptyStringSchema$1),
	usage: Schema.optional(Schema.Unknown),
	lastToolName: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const TaskCompletedPayload = Schema.Struct({
	taskId: RuntimeTaskId,
	status: Schema.Literals([
		"completed",
		"failed",
		"stopped"
	]),
	summary: Schema.optional(TrimmedNonEmptyStringSchema$1),
	usage: Schema.optional(Schema.Unknown)
});
const HookStartedPayload = Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	hookName: TrimmedNonEmptyStringSchema$1,
	hookEvent: TrimmedNonEmptyStringSchema$1
});
const HookProgressPayload = Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	output: Schema.optional(Schema.String),
	stdout: Schema.optional(Schema.String),
	stderr: Schema.optional(Schema.String)
});
const HookCompletedPayload = Schema.Struct({
	hookId: TrimmedNonEmptyStringSchema$1,
	outcome: Schema.Literals([
		"success",
		"error",
		"cancelled"
	]),
	output: Schema.optional(Schema.String),
	stdout: Schema.optional(Schema.String),
	stderr: Schema.optional(Schema.String),
	exitCode: Schema.optional(Schema.Int)
});
const ToolProgressPayload = Schema.Struct({
	toolUseId: Schema.optional(TrimmedNonEmptyStringSchema$1),
	toolName: Schema.optional(TrimmedNonEmptyStringSchema$1),
	summary: Schema.optional(TrimmedNonEmptyStringSchema$1),
	elapsedSeconds: Schema.optional(Schema.Number)
});
const ToolSummaryPayload = Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	precedingToolUseIds: Schema.optional(Schema.Array(TrimmedNonEmptyStringSchema$1))
});
const AuthStatusPayload = Schema.Struct({
	isAuthenticating: Schema.optional(Schema.Boolean),
	output: Schema.optional(Schema.Array(Schema.String)),
	error: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const AccountUpdatedPayload = Schema.Struct({ account: Schema.Unknown });
const AccountRateLimitsUpdatedPayload = Schema.Struct({ rateLimits: Schema.Unknown });
const McpStatusUpdatedPayload = Schema.Struct({ status: Schema.Unknown });
const McpOauthCompletedPayload = Schema.Struct({
	success: Schema.Boolean,
	name: Schema.optional(TrimmedNonEmptyStringSchema$1),
	error: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const ModelReroutedPayload = Schema.Struct({
	fromModel: TrimmedNonEmptyStringSchema$1,
	toModel: TrimmedNonEmptyStringSchema$1,
	reason: TrimmedNonEmptyStringSchema$1
});
const ConfigWarningPayload = Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	details: Schema.optional(TrimmedNonEmptyStringSchema$1),
	path: Schema.optional(TrimmedNonEmptyStringSchema$1),
	range: Schema.optional(Schema.Unknown)
});
const DeprecationNoticePayload = Schema.Struct({
	summary: TrimmedNonEmptyStringSchema$1,
	details: Schema.optional(TrimmedNonEmptyStringSchema$1)
});
const FilesPersistedPayload = Schema.Struct({
	files: Schema.Array(Schema.Struct({
		filename: TrimmedNonEmptyStringSchema$1,
		fileId: TrimmedNonEmptyStringSchema$1
	})),
	failed: Schema.optional(Schema.Array(Schema.Struct({
		filename: TrimmedNonEmptyStringSchema$1,
		error: TrimmedNonEmptyStringSchema$1
	})))
});
const RuntimeWarningPayload = Schema.Struct({
	message: TrimmedNonEmptyStringSchema$1,
	detail: Schema.optional(Schema.Unknown)
});
const RuntimeErrorPayload = Schema.Struct({
	message: TrimmedNonEmptyStringSchema$1,
	class: Schema.optional(RuntimeErrorClass),
	detail: Schema.optional(Schema.Unknown)
});
const ProviderRuntimeSessionStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionStartedType,
	payload: SessionStartedPayload
});
const ProviderRuntimeSessionConfiguredEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionConfiguredType,
	payload: SessionConfiguredPayload
});
const ProviderRuntimeSessionStateChangedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionStateChangedType,
	payload: SessionStateChangedPayload
});
const ProviderRuntimeSessionExitedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: SessionExitedType,
	payload: SessionExitedPayload
});
const ProviderRuntimeThreadStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadStartedType,
	payload: ThreadStartedPayload
});
const ProviderRuntimeThreadStateChangedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadStateChangedType,
	payload: ThreadStateChangedPayload
});
const ProviderRuntimeThreadMetadataUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadMetadataUpdatedType,
	payload: ThreadMetadataUpdatedPayload
});
const ProviderRuntimeThreadTokenUsageUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadTokenUsageUpdatedType,
	payload: ThreadTokenUsageUpdatedPayload
});
const ProviderRuntimeThreadRealtimeStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeStartedType,
	payload: ThreadRealtimeStartedPayload
});
const ProviderRuntimeThreadRealtimeItemAddedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeItemAddedType,
	payload: ThreadRealtimeItemAddedPayload
});
const ProviderRuntimeThreadRealtimeAudioDeltaEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeAudioDeltaType,
	payload: ThreadRealtimeAudioDeltaPayload
});
const ProviderRuntimeThreadRealtimeErrorEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeErrorType,
	payload: ThreadRealtimeErrorPayload
});
const ProviderRuntimeThreadRealtimeClosedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ThreadRealtimeClosedType,
	payload: ThreadRealtimeClosedPayload
});
const ProviderRuntimeTurnStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnStartedType,
	payload: TurnStartedPayload
});
const ProviderRuntimeTurnCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnCompletedType,
	payload: TurnCompletedPayload
});
const ProviderRuntimeTurnAbortedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnAbortedType,
	payload: TurnAbortedPayload
});
const ProviderRuntimeTurnPlanUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnPlanUpdatedType,
	payload: TurnPlanUpdatedPayload
});
const ProviderRuntimeTurnProposedDeltaEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnProposedDeltaType,
	payload: TurnProposedDeltaPayload
});
const ProviderRuntimeTurnProposedCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnProposedCompletedType,
	payload: TurnProposedCompletedPayload
});
const ProviderRuntimeTurnDiffUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TurnDiffUpdatedType,
	payload: TurnDiffUpdatedPayload
});
const ProviderRuntimeItemStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemStartedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeItemUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemUpdatedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeItemCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ItemCompletedType,
	payload: ItemLifecyclePayload
});
const ProviderRuntimeContentDeltaEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ContentDeltaType,
	payload: ContentDeltaPayload
});
const ProviderRuntimeRequestOpenedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RequestOpenedType,
	payload: RequestOpenedPayload
});
const ProviderRuntimeRequestResolvedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RequestResolvedType,
	payload: RequestResolvedPayload
});
const ProviderRuntimeUserInputRequestedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: UserInputRequestedType,
	payload: UserInputRequestedPayload
});
const ProviderRuntimeUserInputResolvedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: UserInputResolvedType,
	payload: UserInputResolvedPayload
});
const ProviderRuntimeTaskStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskStartedType,
	payload: TaskStartedPayload
});
const ProviderRuntimeTaskProgressEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskProgressType,
	payload: TaskProgressPayload
});
const ProviderRuntimeTaskCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: TaskCompletedType,
	payload: TaskCompletedPayload
});
const ProviderRuntimeHookStartedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookStartedType,
	payload: HookStartedPayload
});
const ProviderRuntimeHookProgressEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookProgressType,
	payload: HookProgressPayload
});
const ProviderRuntimeHookCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: HookCompletedType,
	payload: HookCompletedPayload
});
const ProviderRuntimeToolProgressEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ToolProgressType,
	payload: ToolProgressPayload
});
const ProviderRuntimeToolSummaryEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ToolSummaryType,
	payload: ToolSummaryPayload
});
const ProviderRuntimeAuthStatusEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AuthStatusType,
	payload: AuthStatusPayload
});
const ProviderRuntimeAccountUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AccountUpdatedType,
	payload: AccountUpdatedPayload
});
const ProviderRuntimeAccountRateLimitsUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: AccountRateLimitsUpdatedType,
	payload: AccountRateLimitsUpdatedPayload
});
const ProviderRuntimeMcpStatusUpdatedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: McpStatusUpdatedType,
	payload: McpStatusUpdatedPayload
});
const ProviderRuntimeMcpOauthCompletedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: McpOauthCompletedType,
	payload: McpOauthCompletedPayload
});
const ProviderRuntimeModelReroutedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ModelReroutedType,
	payload: ModelReroutedPayload
});
const ProviderRuntimeConfigWarningEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: ConfigWarningType,
	payload: ConfigWarningPayload
});
const ProviderRuntimeDeprecationNoticeEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: DeprecationNoticeType,
	payload: DeprecationNoticePayload
});
const ProviderRuntimeFilesPersistedEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: FilesPersistedType,
	payload: FilesPersistedPayload
});
const ProviderRuntimeWarningEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RuntimeWarningType,
	payload: RuntimeWarningPayload
});
const ProviderRuntimeErrorEvent = Schema.Struct({
	...ProviderRuntimeEventBase.fields,
	type: RuntimeErrorType,
	payload: RuntimeErrorPayload
});
const ProviderRuntimeEventV2 = Schema.Union([
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
Schema.Literals([
	"command",
	"file-read",
	"file-change",
	"other"
]);
const ProviderRuntimeTurnStatus = RuntimeTurnState;

//#endregion
//#region src/git.ts
const TrimmedNonEmptyStringSchema = TrimmedNonEmptyString;
const GitStackedAction = Schema.Literals([
	"commit",
	"commit_push",
	"commit_push_pr"
]);
const GitCommitStepStatus = Schema.Literals(["created", "skipped_no_changes"]);
const GitPushStepStatus = Schema.Literals([
	"pushed",
	"skipped_not_requested",
	"skipped_up_to_date"
]);
const GitBranchStepStatus = Schema.Literals(["created", "skipped_not_requested"]);
const GitPrStepStatus = Schema.Literals([
	"created",
	"opened_existing",
	"skipped_not_requested"
]);
const GitStatusPrState = Schema.Literals([
	"open",
	"closed",
	"merged"
]);
const GitPullRequestReference = TrimmedNonEmptyStringSchema;
const GitPullRequestState = Schema.Literals([
	"open",
	"closed",
	"merged"
]);
const GitPreparePullRequestThreadMode = Schema.Literals(["local", "worktree"]);
const GitBranch = Schema.Struct({
	name: TrimmedNonEmptyStringSchema,
	isRemote: Schema.optional(Schema.Boolean),
	remoteName: Schema.optional(TrimmedNonEmptyStringSchema),
	current: Schema.Boolean,
	isDefault: Schema.Boolean,
	worktreePath: TrimmedNonEmptyStringSchema.pipe(Schema.NullOr)
});
const GitWorktree = Schema.Struct({
	path: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitResolvedPullRequest = Schema.Struct({
	number: PositiveInt,
	title: TrimmedNonEmptyStringSchema,
	url: Schema.String,
	baseBranch: TrimmedNonEmptyStringSchema,
	headBranch: TrimmedNonEmptyStringSchema,
	state: GitPullRequestState
});
const GitStatusInput = Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitPullInput = Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitRunStackedActionInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	action: GitStackedAction,
	commitMessage: Schema.optional(TrimmedNonEmptyStringSchema.check(Schema.isMaxLength(1e4))),
	featureBranch: Schema.optional(Schema.Boolean),
	filePaths: Schema.optional(Schema.Array(TrimmedNonEmptyStringSchema).check(Schema.isMinLength(1))),
	textGenerationModel: Schema.optional(TrimmedNonEmptyStringSchema).pipe(Schema.withConstructorDefault(() => Option.some(DEFAULT_GIT_TEXT_GENERATION_MODEL)))
});
const GitListBranchesInput = Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitCreateWorktreeInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema,
	newBranch: Schema.optional(TrimmedNonEmptyStringSchema),
	path: Schema.NullOr(TrimmedNonEmptyStringSchema)
});
const GitPullRequestRefInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	reference: GitPullRequestReference
});
const GitPreparePullRequestThreadInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	reference: GitPullRequestReference,
	mode: GitPreparePullRequestThreadMode
});
const GitRemoveWorktreeInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	path: TrimmedNonEmptyStringSchema,
	force: Schema.optional(Schema.Boolean)
});
const GitCreateBranchInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitCheckoutInput = Schema.Struct({
	cwd: TrimmedNonEmptyStringSchema,
	branch: TrimmedNonEmptyStringSchema
});
const GitInitInput = Schema.Struct({ cwd: TrimmedNonEmptyStringSchema });
const GitStatusPr = Schema.Struct({
	number: PositiveInt,
	title: TrimmedNonEmptyStringSchema,
	url: Schema.String,
	baseBranch: TrimmedNonEmptyStringSchema,
	headBranch: TrimmedNonEmptyStringSchema,
	state: GitStatusPrState
});
const GitStatusResult = Schema.Struct({
	branch: TrimmedNonEmptyStringSchema.pipe(Schema.NullOr),
	hasWorkingTreeChanges: Schema.Boolean,
	workingTree: Schema.Struct({
		files: Schema.Array(Schema.Struct({
			path: TrimmedNonEmptyStringSchema,
			insertions: NonNegativeInt,
			deletions: NonNegativeInt
		})),
		insertions: NonNegativeInt,
		deletions: NonNegativeInt
	}),
	hasUpstream: Schema.Boolean,
	aheadCount: NonNegativeInt,
	behindCount: NonNegativeInt,
	pr: Schema.NullOr(GitStatusPr)
});
const GitListBranchesResult = Schema.Struct({
	branches: Schema.Array(GitBranch),
	isRepo: Schema.Boolean,
	hasOriginRemote: Schema.Boolean
});
const GitCreateWorktreeResult = Schema.Struct({ worktree: GitWorktree });
const GitResolvePullRequestResult = Schema.Struct({ pullRequest: GitResolvedPullRequest });
const GitPreparePullRequestThreadResult = Schema.Struct({
	pullRequest: GitResolvedPullRequest,
	branch: TrimmedNonEmptyStringSchema,
	worktreePath: TrimmedNonEmptyStringSchema.pipe(Schema.NullOr)
});
const GitRunStackedActionResult = Schema.Struct({
	action: GitStackedAction,
	branch: Schema.Struct({
		status: GitBranchStepStatus,
		name: Schema.optional(TrimmedNonEmptyStringSchema)
	}),
	commit: Schema.Struct({
		status: GitCommitStepStatus,
		commitSha: Schema.optional(TrimmedNonEmptyStringSchema),
		subject: Schema.optional(TrimmedNonEmptyStringSchema)
	}),
	push: Schema.Struct({
		status: GitPushStepStatus,
		branch: Schema.optional(TrimmedNonEmptyStringSchema),
		upstreamBranch: Schema.optional(TrimmedNonEmptyStringSchema),
		setUpstream: Schema.optional(Schema.Boolean)
	}),
	pr: Schema.Struct({
		status: GitPrStepStatus,
		url: Schema.optional(Schema.String),
		number: Schema.optional(PositiveInt),
		baseBranch: Schema.optional(TrimmedNonEmptyStringSchema),
		headBranch: Schema.optional(TrimmedNonEmptyStringSchema),
		title: Schema.optional(TrimmedNonEmptyStringSchema)
	})
});
const GitPullResult = Schema.Struct({
	status: Schema.Literals(["pulled", "skipped_up_to_date"]),
	branch: TrimmedNonEmptyStringSchema,
	upstreamBranch: TrimmedNonEmptyStringSchema.pipe(Schema.NullOr)
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
const SCRIPT_RUN_COMMAND_PATTERN = Schema.TemplateLiteral([
	Schema.Literal("script."),
	Schema.NonEmptyString.check(Schema.isMaxLength(MAX_SCRIPT_ID_LENGTH), Schema.isPattern(/^[a-z0-9][a-z0-9-]*$/)),
	Schema.Literal(".run")
]);
const KeybindingCommand = Schema.Union([Schema.Literals(STATIC_KEYBINDING_COMMANDS), SCRIPT_RUN_COMMAND_PATTERN]);
const KeybindingValue = TrimmedString.check(Schema.isMinLength(1), Schema.isMaxLength(MAX_KEYBINDING_VALUE_LENGTH));
const KeybindingWhen = TrimmedString.check(Schema.isMinLength(1), Schema.isMaxLength(MAX_KEYBINDING_WHEN_LENGTH));
const KeybindingRule = Schema.Struct({
	key: KeybindingValue,
	command: KeybindingCommand,
	when: Schema.optional(KeybindingWhen)
});
const KeybindingsConfig = Schema.Array(KeybindingRule).check(Schema.isMaxLength(MAX_KEYBINDINGS_COUNT));
const KeybindingShortcut = Schema.Struct({
	key: KeybindingValue,
	metaKey: Schema.Boolean,
	ctrlKey: Schema.Boolean,
	shiftKey: Schema.Boolean,
	altKey: Schema.Boolean,
	modKey: Schema.Boolean
});
const KeybindingWhenNode = Schema.Union([
	Schema.Struct({
		type: Schema.Literal("identifier"),
		name: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("not"),
		node: Schema.suspend(() => KeybindingWhenNode)
	}),
	Schema.Struct({
		type: Schema.Literal("and"),
		left: Schema.suspend(() => KeybindingWhenNode),
		right: Schema.suspend(() => KeybindingWhenNode)
	}),
	Schema.Struct({
		type: Schema.Literal("or"),
		left: Schema.suspend(() => KeybindingWhenNode),
		right: Schema.suspend(() => KeybindingWhenNode)
	})
]);
const ResolvedKeybindingRule = Schema.Struct({
	command: KeybindingCommand,
	shortcut: KeybindingShortcut,
	whenAst: Schema.optional(KeybindingWhenNode)
}).annotate({ parseOptions: { onExcessProperty: "ignore" } });
const ResolvedKeybindingsConfig = Schema.Array(ResolvedKeybindingRule).check(Schema.isMaxLength(MAX_KEYBINDINGS_COUNT));

//#endregion
//#region src/project.ts
const PROJECT_SEARCH_ENTRIES_MAX_LIMIT = 200;
const PROJECT_WRITE_FILE_PATH_MAX_LENGTH = 512;
const ProjectSearchEntriesInput = Schema.Struct({
	cwd: TrimmedNonEmptyString,
	query: TrimmedNonEmptyString.check(Schema.isMaxLength(256)),
	limit: PositiveInt.check(Schema.isLessThanOrEqualTo(PROJECT_SEARCH_ENTRIES_MAX_LIMIT))
});
const ProjectEntryKind = Schema.Literals(["file", "directory"]);
const ProjectEntry = Schema.Struct({
	path: TrimmedNonEmptyString,
	kind: ProjectEntryKind,
	parentPath: Schema.optional(TrimmedNonEmptyString)
});
const ProjectSearchEntriesResult = Schema.Struct({
	entries: Schema.Array(ProjectEntry),
	truncated: Schema.Boolean
});
const ProjectWriteFileInput = Schema.Struct({
	cwd: TrimmedNonEmptyString,
	relativePath: TrimmedNonEmptyString.check(Schema.isMaxLength(PROJECT_WRITE_FILE_PATH_MAX_LENGTH)),
	contents: Schema.String
});
const ProjectWriteFileResult = Schema.Struct({ relativePath: TrimmedNonEmptyString });

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
const EditorId = Schema.Literals(EDITORS.map((e) => e.id));
const OpenInEditorInput = Schema.Struct({
	cwd: TrimmedNonEmptyString,
	editor: EditorId
});

//#endregion
//#region src/server.ts
const KeybindingsMalformedConfigIssue = Schema.Struct({
	kind: Schema.Literal("keybindings.malformed-config"),
	message: TrimmedNonEmptyString
});
const KeybindingsInvalidEntryIssue = Schema.Struct({
	kind: Schema.Literal("keybindings.invalid-entry"),
	message: TrimmedNonEmptyString,
	index: Schema.Number
});
const ServerConfigIssue = Schema.Union([KeybindingsMalformedConfigIssue, KeybindingsInvalidEntryIssue]);
const ServerConfigIssues = Schema.Array(ServerConfigIssue);
const ServerProviderStatusState = Schema.Literals([
	"ready",
	"warning",
	"error"
]);
const ServerProviderAuthStatus = Schema.Literals([
	"authenticated",
	"unauthenticated",
	"unknown"
]);
const ServerProviderStatus = Schema.Struct({
	provider: ProviderKind,
	status: ServerProviderStatusState,
	available: Schema.Boolean,
	authStatus: ServerProviderAuthStatus,
	checkedAt: IsoDateTime,
	message: Schema.optional(TrimmedNonEmptyString)
});
const ServerProviderStatuses = Schema.Array(ServerProviderStatus);
const ServerConfig = Schema.Struct({
	cwd: TrimmedNonEmptyString,
	keybindingsConfigPath: TrimmedNonEmptyString,
	keybindings: ResolvedKeybindingsConfig,
	issues: ServerConfigIssues,
	providers: ServerProviderStatuses,
	availableEditors: Schema.Array(EditorId)
});
const ServerUpsertKeybindingInput = KeybindingRule;
const ServerUpsertKeybindingResult = Schema.Struct({
	keybindings: ResolvedKeybindingsConfig,
	issues: ServerConfigIssues
});
const ServerConfigUpdatedPayload = Schema.Struct({
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
const tagRequestBody = (tag, schema) => schema.mapFields(Struct.assign({ _tag: Schema.tag(tag) }), { unsafePreserveChecks: true });
const WebSocketRequestBody = Schema.Union([
	tagRequestBody(ORCHESTRATION_WS_METHODS.dispatchCommand, Schema.Struct({ command: ClientOrchestrationCommand })),
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
	tagRequestBody(WS_METHODS.serverGetConfig, Schema.Struct({})),
	tagRequestBody(WS_METHODS.serverUpsertKeybinding, KeybindingRule)
]);
const WebSocketRequest = Schema.Struct({
	id: TrimmedNonEmptyString,
	body: WebSocketRequestBody
});
const WebSocketResponse = Schema.Struct({
	id: TrimmedNonEmptyString,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.Struct({ message: Schema.String }))
});
const WsPushSequence = NonNegativeInt;
const WsWelcomePayload = Schema.Struct({
	cwd: TrimmedNonEmptyString,
	projectName: TrimmedNonEmptyString,
	bootstrapProjectId: Schema.optional(ProjectId),
	bootstrapThreadId: Schema.optional(ThreadId)
});
const makeWsPushSchema = (channel, payload) => Schema.Struct({
	type: Schema.Literal("push"),
	sequence: WsPushSequence,
	channel: Schema.Literal(channel),
	data: payload
});
const WsPushServerWelcome = makeWsPushSchema(WS_CHANNELS.serverWelcome, WsWelcomePayload);
const WsPushServerConfigUpdated = makeWsPushSchema(WS_CHANNELS.serverConfigUpdated, ServerConfigUpdatedPayload);
const WsPushTerminalEvent = makeWsPushSchema(WS_CHANNELS.terminalEvent, TerminalEvent);
const WsPushOrchestrationDomainEvent = makeWsPushSchema(ORCHESTRATION_WS_CHANNELS.domainEvent, OrchestrationEvent);
const WsPushChannelSchema = Schema.Literals([
	WS_CHANNELS.serverWelcome,
	WS_CHANNELS.serverConfigUpdated,
	WS_CHANNELS.terminalEvent,
	ORCHESTRATION_WS_CHANNELS.domainEvent
]);
const WsPush = Schema.Union([
	WsPushServerWelcome,
	WsPushServerConfigUpdated,
	WsPushTerminalEvent,
	WsPushOrchestrationDomainEvent
]);
const WsPushEnvelopeBase = Schema.Struct({
	type: Schema.Literal("push"),
	sequence: WsPushSequence,
	channel: WsPushChannelSchema,
	data: Schema.Unknown
});
const WsResponse = Schema.Union([WebSocketResponse, WsPush]);

//#endregion
export { ApprovalRequestId, AssistantDeliveryMode, CLAUDE_CODE_EFFORT_OPTIONS, CODEX_REASONING_EFFORT_OPTIONS, CanonicalItemType, CanonicalRequestType, ChatAttachment, ChatImageAttachment, CheckpointRef, ClaudeModelOptions, ClaudeProviderStartOptions, ClientOrchestrationCommand, CodexModelOptions, CodexProviderStartOptions, CommandId, CorrelationId, DEFAULT_GIT_TEXT_GENERATION_MODEL, DEFAULT_MODEL, DEFAULT_MODEL_BY_PROVIDER, DEFAULT_PROVIDER_INTERACTION_MODE, DEFAULT_PROVIDER_KIND, DEFAULT_REASONING_EFFORT_BY_PROVIDER, DEFAULT_RUNTIME_MODE, DEFAULT_TERMINAL_ID, DispatchResult, EDITORS, EditorId, EventId, GitBranch, GitCheckoutInput, GitCreateBranchInput, GitCreateWorktreeInput, GitCreateWorktreeResult, GitInitInput, GitListBranchesInput, GitListBranchesResult, GitPreparePullRequestThreadInput, GitPreparePullRequestThreadResult, GitPullInput, GitPullRequestRefInput, GitPullResult, GitRemoveWorktreeInput, GitResolvePullRequestResult, GitRunStackedActionInput, GitRunStackedActionResult, GitStackedAction, GitStatusInput, GitStatusResult, IsoDateTime, ItemLifecyclePayload, KeybindingCommand, KeybindingRule, KeybindingShortcut, KeybindingWhenNode, KeybindingsConfig, MAX_KEYBINDINGS_COUNT, MAX_KEYBINDING_VALUE_LENGTH, MAX_SCRIPT_ID_LENGTH, MAX_WHEN_EXPRESSION_DEPTH, MODEL_OPTIONS, MODEL_OPTIONS_BY_PROVIDER, MODEL_SLUG_ALIASES_BY_PROVIDER, MessageId, NonNegativeInt, ORCHESTRATION_WS_CHANNELS, ORCHESTRATION_WS_METHODS, OpenInEditorInput, OrchestrationActorKind, OrchestrationAggregateKind, OrchestrationCheckpointFile, OrchestrationCheckpointStatus, OrchestrationCheckpointSummary, OrchestrationCommand, OrchestrationCommandReceiptStatus, OrchestrationEvent, OrchestrationEventMetadata, OrchestrationEventType, OrchestrationGetFullThreadDiffInput, OrchestrationGetFullThreadDiffResult, OrchestrationGetSnapshotInput, OrchestrationGetTurnDiffInput, OrchestrationGetTurnDiffResult, OrchestrationLatestTurn, OrchestrationMessage, OrchestrationMessageRole, OrchestrationProject, OrchestrationProposedPlan, OrchestrationProposedPlanId, OrchestrationReadModel, OrchestrationReplayEventsInput, OrchestrationRpcSchemas, OrchestrationSession, OrchestrationSessionStatus, OrchestrationThread, OrchestrationThreadActivity, OrchestrationThreadActivityTone, PROVIDER_SEND_TURN_MAX_ATTACHMENTS, PROVIDER_SEND_TURN_MAX_IMAGE_BYTES, PROVIDER_SEND_TURN_MAX_INPUT_CHARS, PositiveInt, ProjectCreateCommand, ProjectCreatedPayload, ProjectDeletedPayload, ProjectEntry, ProjectId, ProjectMetaUpdatedPayload, ProjectScript, ProjectScriptIcon, ProjectSearchEntriesInput, ProjectSearchEntriesResult, ProjectWriteFileInput, ProjectWriteFileResult, ProjectionPendingApprovalDecision, ProjectionPendingApprovalStatus, ProviderApprovalDecision, ProviderApprovalPolicy, ProviderEvent, ProviderInteractionMode, ProviderInterruptTurnInput, ProviderItemId, ProviderKind, ProviderModelOptions, ProviderRequestKind, ProviderRespondToRequestInput, ProviderRespondToUserInputInput, ProviderRuntimeEvent, ProviderRuntimeEventV2, ProviderRuntimeTurnStatus, ProviderSandboxMode, ProviderSendTurnInput, ProviderSession, ProviderSessionRuntimeStatus, ProviderSessionStartInput, ProviderStartOptions, ProviderStopSessionInput, ProviderTurnStartResult, ProviderUserInputAnswers, REASONING_EFFORT_OPTIONS_BY_PROVIDER, ResolvedKeybindingRule, ResolvedKeybindingsConfig, RuntimeEventRaw, RuntimeItemId, RuntimeMode, RuntimeRequestId, RuntimeSessionId, RuntimeTaskId, SCRIPT_RUN_COMMAND_PATTERN, ServerConfig, ServerConfigIssue, ServerConfigUpdatedPayload, ServerProviderAuthStatus, ServerProviderStatus, ServerProviderStatusState, ServerUpsertKeybindingInput, ServerUpsertKeybindingResult, TOOL_LIFECYCLE_ITEM_TYPES, TerminalClearInput, TerminalCloseInput, TerminalEvent, TerminalOpenInput, TerminalResizeInput, TerminalRestartInput, TerminalSessionSnapshot, TerminalSessionStatus, TerminalThreadInput, TerminalWriteInput, ThreadActivityAppendedPayload, ThreadApprovalResponseRequestedPayload, ThreadCheckpointRevertRequestedPayload, ThreadCreatedPayload, ThreadDeletedPayload, ThreadId, ThreadInteractionModeSetPayload, ThreadMessageSentPayload, ThreadMetaUpdatedPayload, ThreadProposedPlanUpsertedPayload, ThreadRevertedPayload, ThreadRuntimeModeSetPayload, ThreadSessionSetPayload, ThreadSessionStopRequestedPayload, ThreadTurnDiff, ThreadTurnDiffCompletedPayload, ThreadTurnInterruptRequestedPayload, ThreadTurnStartCommand, ThreadTurnStartRequestedPayload, ToolLifecycleItemType, TrimmedNonEmptyString, TrimmedString, TurnCountRange, TurnId, UserInputQuestion, WS_CHANNELS, WS_METHODS, WebSocketRequest, WebSocketResponse, WsPush, WsPushChannelSchema, WsPushEnvelopeBase, WsPushOrchestrationDomainEvent, WsPushSequence, WsPushServerConfigUpdated, WsPushServerWelcome, WsPushTerminalEvent, WsResponse, WsWelcomePayload, isToolLifecycleItemType };