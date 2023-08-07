import { z } from 'zod'

export const WithActionHashSchema = z.object({
  actionHash: z.string().nonempty()
})

export const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  handle: z.string(),
  status: z.enum(['Online', 'Offline', 'Away']),
  avatarUrl: z.string(),
  agentPubKey: z.string(),
  isImported: z.boolean(),
})

export const ProjectMetaV0Schema = z.object({
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  name: z.string(),
  image: z.string().nullable(),
  passphrase: z.string(),
  isImported: z.boolean(),
  isMigrated: z.string().nullable(),
})

export const ProjectMetaV0WithActionHashSchema = WithActionHashSchema.merge(ProjectMetaV0Schema)

export const ProjectMetaV1Schema = z.object({
  layeringAlgorithm: z.enum(['LongestPath', 'CoffmanGraham']),
  topPriorityOutcomes: z.array(z.string())
}).merge(ProjectMetaV0Schema)

export const ProjectMetaV1WithActionHashSchema = WithActionHashSchema.merge(ProjectMetaV1Schema)

export const ProjectMetaWithActionHashSchema = z.union([ProjectMetaV0WithActionHashSchema, ProjectMetaV1WithActionHashSchema])

export type ProjectMetaWithActionHash = z.infer<typeof ProjectMetaWithActionHashSchema>

export const SmallTaskSchema = z.object({
  complete: z.boolean(),
  task: z.string(),
})

export const SmallScopeSchema = z.object({
  Small: z.object({
    achievementStatus: z.enum(['Achieved', 'NotAchieved']),
    targetDate: z.number().nullable(),
    taskList: z.array(SmallTaskSchema),
  })
})

export const SmallsEstimateSchema = z.number()

export const TimeFrameSchema = z.object({
  fromDate: z.number(),
  toDate: z.number(),
})

export const UncertainScopeSchema = z.object({
  Uncertain: z.object({
    smallsEstimate: SmallsEstimateSchema.nullable(),
    timeFrame: TimeFrameSchema.nullable(),
    inBreakdown: z.boolean(),
  })
})

export const ScopeSchema = z.union([SmallScopeSchema, UncertainScopeSchema])

export const OutcomeSchema = z.object({
  content: z.string(),
  creatorAgentPubKey: z.string(),
  editorAgentPubKey: z.string().nullable(),
  timestampCreated: z.number().gt(0),
  timestampUpdated: z.number().gt(0).nullable(),
  scope: ScopeSchema,
  tags: z.array(z.string()).nullable(),
  description: z.string(),
  isImported: z.boolean(),
  githubLink: z.string().url().or(z.literal('')),
})

export const ProjectOutcomesStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(OutcomeSchema)
)

export const ConnectionSchema = z.object({
  parentActionHash: z.string(),
  childActionHash: z.string(),
  randomizer: z.number(), // needs to be broad enough to allow floats for backwards compatibility, but is now an int
  isImported: z.boolean(),
})

export const ProjectConnectionsStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(ConnectionSchema)
)

export const OutcomeMemberSchema = z.object({
  outcomeActionHash: z.string(),
  memberAgentPubKey: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})

export const ProjectOutcomeMembersStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(OutcomeMemberSchema)
)

export const OutcomeCommentSchema = z.object({
  outcomeActionHash: z.string(),
  content: z.string(),
  creatorAgentPubKey: z.string(),
  unixTimestamp: z.number(),
  isImported: z.boolean(),
})

export const ProjectOutcomeCommentsStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(OutcomeCommentSchema)
)

export const EntryPointSchema = z.object({
  color: z.string(),
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  outcomeActionHash: z.string(),
  isImported: z.boolean(),
})

export const ProjectEntryPointsStateSchema = z.record(
  z
    .object({
      actionHash: z.string(),
    })
    .merge(EntryPointSchema)
)

export const TagSchema = z.object({
  backgroundColor: z.string(),
  text: z.string(),
})

export const ProjectTagsStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(TagSchema)
)

export const ProjectExportDataV1Schema = z.object({
  projectMeta: ProjectMetaWithActionHashSchema,
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})

export const AllProjectsDataExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataV1Schema),
  integrityVersion: z.string(),
})

export type ProjectExportDataV1 = z.infer<typeof ProjectExportDataV1Schema>

export type AllProjectsDataExport = z.infer<typeof AllProjectsDataExportSchema>
