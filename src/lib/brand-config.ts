import { BrandConfig, Logo, LogoVariant } from '@/types'
import { prisma } from '@/lib/db'

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  companyName: "XGRC Software",
  taglinePrimary: "Driving Compliance®",
  taglineSecondary: "Synergy in Assurance, Strength in Compliance",
  colours: {
    primary: "#0a1628",
    secondary: "#1e2a3a",
    accent1: "#0066ff",
    accent2: "#00d4ff",
    neutral: "#ffffff",
  },
  logos: [
    {
      key: "xgrcMaster",
      logoName: "XGRC Master Logo",
      trademarkName: "XGRC®",
      useCase: "General XGRC posts, integrated governance, GRC, compliance, assurance, ESG, platform content.",
      allowedTopics: ["GRC","Compliance","Risk","Governance","Assurance","ESG","Cybersecurity","Audit"],
      preferredPlacement: "Bottom-right or top-left",
      minClearSpace: "5% of image width",
      backgroundPreference: "White, deep navy, or charcoal",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "Full colour — light/neutral backgrounds" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "White version — dark/navy backgrounds" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "Dark navy — white/grey backgrounds" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "Single colour — any background" },
        { name: "Custom", filePath: "", worksOn: "any", description: "Additional variant" },
      ]
    },
    {
      key: "msxCyber",
      logoName: "MSXCYBER Logo",
      trademarkName: "MSXCYBER™",
      useCase: "Cybersecurity, ISO 27001, information security, cyber resilience content.",
      allowedTopics: ["Cybersecurity","ISO 27001","Information Security","Incident Response","Vulnerability","Cyber Risk"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Dark navy or charcoal",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "erm",
      logoName: "ERM Logo",
      trademarkName: "ERM™",
      useCase: "Enterprise risk management, ISO 31000, COSO content.",
      allowedTopics: ["Enterprise Risk","ERM","ISO 31000","COSO","Risk Register","Risk Monitoring"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Professional neutral or navy",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "sheqx",
      logoName: "SHEQX Logo",
      trademarkName: "SHEQX™",
      useCase: "Health, safety, environment, quality content.",
      allowedTopics: ["Health and Safety","Environment","Quality","ISO 9001","ISO 14001","ISO 45001","SHEQ"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Clean neutral or dark",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "msx",
      logoName: "MSX Logo",
      trademarkName: "MSX™",
      useCase: "Integrated Management Systems, ISO standards, operational alignment content.",
      allowedTopics: ["Integrated Management System","ISO Standards","Business Management","Operational Alignment"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Clean neutral or dark",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "maia",
      logoName: "MAIA Logo",
      trademarkName: "MAIA™",
      useCase: "AI, analytics, automation, predictive insights, AI-enabled GRC content.",
      allowedTopics: ["AI","Analytics","Automation","Predictive Risk","Digital Governance"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Dark technology-style",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "archangel",
      logoName: "HakWare Archangel Logo",
      trademarkName: "HakWare Archangel™",
      useCase: "Vulnerability scanning, AI-based security monitoring, cyber risk content.",
      allowedTopics: ["Vulnerability Management","Cybersecurity","Threat Monitoring","Security Assessments"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Dark cybersecurity-style",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "pix",
      logoName: "PIX Logo",
      trademarkName: "PIX™",
      useCase: "Performance indicators, dashboards, KPIs, monitoring, reporting content.",
      allowedTopics: ["KPIs","Performance Indicators","Dashboards","Monitoring","Reporting"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Clean data-dashboard",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "libryo",
      logoName: "Libryo Logo",
      trademarkName: "Libryo™",
      useCase: "Legal compliance management, regulatory tracking, compliance obligations content.",
      allowedTopics: ["Legal Compliance","Regulatory Tracking","Compliance Obligations","Legal Registers"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Clean professional",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "vcm",
      logoName: "VCM Logo",
      trademarkName: "VCM™",
      useCase: "Vendor compliance, supplier risk, procurement compliance content.",
      allowedTopics: ["Vendor Compliance","Supplier Risk","Procurement Compliance","Third-Party Risk"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Professional enterprise",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
    {
      key: "heroh",
      logoName: "HEROH Logo",
      trademarkName: "HEROH™",
      useCase: "Occupational healthcare management, employee health records content.",
      allowedTopics: ["Occupational Health","Employee Health Records","Health Assessments","Medical Compliance"],
      preferredPlacement: "Bottom-right",
      minClearSpace: "5% of image width",
      backgroundPreference: "Clean healthcare technology",
      variants: [
        { name: "Full Colour", filePath: "", worksOn: "light", description: "" },
        { name: "White / Reversed", filePath: "", worksOn: "dark", description: "" },
        { name: "Navy / Dark", filePath: "", worksOn: "light", description: "" },
        { name: "Monotone", filePath: "", worksOn: "any", description: "" },
        { name: "Custom", filePath: "", worksOn: "any", description: "" },
      ]
    },
  ]
}

export const DEFAULT_HASHTAGS = ["#GRC","#IntegratedGovernance","#Compliance","#RiskManagement","#DrivingCompliance"]

export async function selectLogoKey(topic: string, solutionName?: string): Promise<string> {
  if (solutionName) {
    const solution = await prisma.solution.findFirst({
      where: {
        active: true,
        name: { contains: solutionName.replace(/[®™]/g, '').trim() },
      },
    })
    if (solution?.logoKey) return solution.logoKey
  }

  const dbTopic = await prisma.topic.findFirst({
    where: {
      active: true,
      value: { contains: topic },
    },
  })
  if (dbTopic?.logoKey) return dbTopic.logoKey

  return 'xgrcMaster'
}

export async function getTopicHashtags(topic: string): Promise<string[]> {
  const dbTopic = await prisma.topic.findFirst({
    where: { active: true, value: { contains: topic } },
  })
  if (dbTopic?.hashtags) {
    try {
      const parsed = JSON.parse(dbTopic.hashtags)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch { /* fall through */ }
  }
  return DEFAULT_HASHTAGS
}

export function selectBestVariant(
  logoKey: string,
  visualConcept: string,
  brandData: BrandConfig
): LogoVariant | null {
  const logo = brandData.logos.find(l => l.key === logoKey)
  if (!logo) return null
  const darkKeywords = ['dark','navy','charcoal','night','black','deep','midnight','shadow']
  const lightKeywords = ['white','light','bright','clean','minimal','grey','silver','soft']
  const conceptLower = visualConcept.toLowerCase()
  const isDark = darkKeywords.some(k => conceptLower.includes(k))
  const isLight = lightKeywords.some(k => conceptLower.includes(k))
  const bgType = isDark ? 'dark' : isLight ? 'light' : 'dark'
  const withPaths = logo.variants.filter(v => v.filePath)
  const exactMatch = withPaths.find(v => v.worksOn === bgType)
  const anyMatch = withPaths.find(v => v.worksOn === 'any')
  return exactMatch ?? anyMatch ?? withPaths[0] ?? null
}

export function generateImagePrompt(
  topic: string,
  logo: Logo | null,
  variant: LogoVariant | null,
  visualConcept: string,
  imageText: string
): string {
  return `Create a premium LinkedIn banner image for XGRC Software. Dimensions: 1200 × 627 px.

CRITICAL LAYOUT RULE — READ FIRST:
Mandatory safe zone: NO text or important visual element may appear within 80px of ANY edge (left, right, top, or bottom). Every element must be fully visible and completely unclipped. Treat the outer 80px on all sides as background bleed only — no content there.

DO NOT include any logo, wordmark, brand name, or company name text in the image. The logo will be added separately. Leave the bottom-right corner clear.

Topic: ${topic}
Visual concept: ${visualConcept}

Brand colours: Deep navy (#0a1628), charcoal grey (#1e2a3a), white, electric blue (#0066ff), cyan (#00d4ff)
Style: Premium B2B SaaS. Modern enterprise technology. Clean 3D or polished vector. Professional, secure, sophisticated.

Text on image: ${imageText ? `Include only "${imageText}" — large bold type, fully inside the safe zone, no cropping, no other text.` : 'Minimal text only. Use 2–4 words max if it adds clarity. Must be inside the safe zone.'}

Visual requirements:
- Meaningful governance/risk/compliance/cybersecurity/ESG visual metaphors
- Premium enterprise aesthetic — no cartoon, no stock photos, no clutter
- All elements completely visible and inside the safe zone

Negative: No logo. No wordmark. No "XGRC". No company name. No cartoon. No stock-photo people. No blurry graphics. No element touching or crossing any edge.

Format: 1200 × 627 px, high quality.`
}

