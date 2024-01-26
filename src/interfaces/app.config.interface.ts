export interface AppConfig {
  key: string
  value: string
}

export default interface AppConfigSchema extends Document, AppConfig {}
