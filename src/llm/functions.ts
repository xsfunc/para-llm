import type { FunctionDeclaration, Tool } from '@google/generative-ai'
import { SchemaType } from '@google/generative-ai'

export const muteUserTool: FunctionDeclaration = {
  name: 'muteUser',
  description: 'Restrict a user\'s ability to send messages in a group chat',
  parameters: {
    type: SchemaType.OBJECT,
    required: ['userId', 'durationSeconds'],
    properties: {
      userId: {
        type: SchemaType.NUMBER,
        description: 'ID of the user to be muted',
      },
      durationSeconds: {
        type: SchemaType.INTEGER,
        description: 'Mute duration in seconds. Default is 60 seconds (1 minute)',
      },
    },
  },
}

export interface MuteUserParams {
  userId: number
  durationSeconds: number
}

export const unmuteUserTool: FunctionDeclaration = {
  name: 'unmuteUser',
  description: 'Allow user to send messages in a group chat',
  parameters: {
    type: SchemaType.OBJECT,
    required: ['userId'],
    properties: {
      userId: {
        type: SchemaType.NUMBER,
        description: 'ID of the user to be unmuted',
      },
    },
  },
}

export interface UnmuteUserParams {
  userId: number
}

export const reactOrIgnoreTool: FunctionDeclaration = {
  name: 'reactOrIgnore',
  description: 'Ignore or react with a specific emoji if needed',
  parameters: {
    type: SchemaType.OBJECT,
    required: [],
    properties: {
      emoji: {
        type: SchemaType.STRING,
        description: 'Emoji to react with (👍,🔥,🍌,🌚,😎,💀,🖕,🤡,👎,🤬,🤮,💩,🤣,🥴,👿)',
      },
    },
  },
}

export interface ReactOrIgnoreParams {
  emoji?: string
}

export const chatTool: Tool = {
  functionDeclarations: [
    muteUserTool,
    unmuteUserTool,
    reactOrIgnoreTool,
  ],
}
