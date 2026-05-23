export interface Post {
  id: string
  topic: string
  heading: string
  content: string
  imagePath?: string
  imagePrompt?: string
  suggestedImageText?: string
  hashtags: string[]
  logoKey?: string
  logoVariant?: string
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
  linkedinPostId?: string
  publishAs: 'PERSONAL' | 'COMPANY'
  scheduledAt?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LogoVariant {
  name: string
  filePath: string
  worksOn: 'light' | 'dark' | 'any'
  description: string
}

export interface Logo {
  key: string
  logoName: string
  trademarkName: string
  useCase: string
  allowedTopics: string[]
  preferredPlacement: string
  minClearSpace: string
  backgroundPreference: string
  variants: LogoVariant[]
}

export interface BrandConfig {
  companyName: string
  taglinePrimary: string
  taglineSecondary: string
  colours: {
    primary: string
    secondary: string
    accent1: string
    accent2: string
    neutral: string
  }
  logos: Logo[]
}

export interface GenerateResult {
  heading: string
  post: string
  visualConcept: string
  imageText: string
  hashtags: string[]
  logoKey: string
  logoVariant: string
  logoWarning?: string
  complianceNotes: string
}

export interface Solution {
  id: string
  name: string
  trademark: string
  logoKey: string
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  title: string
  value: string
  category: string
  logoKey: string
  hashtags: string[]
  isDefault: boolean
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WriterConfig {
  companyDescription: string
  writingStyle: string
  postStructure: string
  formatting: string
  approvedLanguage: string
  doNotList: string
  customOverride: string   // if non-empty, replaces the entire system prompt
}

export interface AppSettings {
  anthropicApiKey: string
  openaiApiKey: string
  linkedinClientId: string
  linkedinClientSecret: string
  linkedinAccessToken: string
  linkedinPersonUrn: string
  linkedinOrgId: string
  companyName: string
  companyLinkedInUrl: string
  defaultPublishAs: 'PERSONAL' | 'COMPANY'
  brandData: BrandConfig
  writerConfig: WriterConfig
}
