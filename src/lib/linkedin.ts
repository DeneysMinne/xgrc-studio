interface LinkedInSettings {
  linkedinAccessToken: string
  linkedinPersonUrn: string
  linkedinOrgId: string
}

interface PostData {
  id: string
  heading: string
  content: string
  hashtags: string
  imagePath?: string | null
  publishAs: string
}

interface PublishResult {
  success: boolean
  linkedinPostId?: string
  linkedinPostUrl?: string
  error?: string
}

export async function publishToLinkedIn(
  settings: LinkedInSettings,
  post: PostData
): Promise<PublishResult> {
  const token = settings.linkedinAccessToken
  const isCompany = post.publishAs === 'COMPANY'

  let authorUrn: string
  if (isCompany && settings.linkedinOrgId) {
    authorUrn = `urn:li:organization:${settings.linkedinOrgId}`
  } else {
    authorUrn = settings.linkedinPersonUrn
  }

  if (!authorUrn) {
    return { success: false, error: 'LinkedIn author URN not configured' }
  }

  // Parse hashtags
  let hashtagsArray: string[] = []
  try {
    hashtagsArray = JSON.parse(post.hashtags || '[]')
  } catch { hashtagsArray = [] }

  const fullText = `${post.heading}\n\n${post.content}\n\n${hashtagsArray.join(' ')}`

  // Build post body
  const postBody: Record<string, unknown> = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: fullText },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  // Upload image if present
  if (post.imagePath) {
    try {
      const imageUrn = await uploadImageToLinkedIn(token, authorUrn, post.imagePath)
      if (imageUrn) {
        const shareContent = postBody.specificContent as Record<string, Record<string, unknown>>
        shareContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
        shareContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: { text: post.heading },
            media: imageUrn,
            title: { text: post.heading },
          },
        ]
      }
    } catch {
      // Continue without image
    }
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  })

  if (!res.ok) {
    const error = await res.text()
    return { success: false, error: `LinkedIn API error: ${res.status} — ${error}` }
  }

  const data = await res.json()
  const linkedinPostId = data.id || ''
  const encodedId = encodeURIComponent(linkedinPostId)
  const linkedinPostUrl = `https://www.linkedin.com/feed/update/${encodedId}/`

  return { success: true, linkedinPostId, linkedinPostUrl }
}

async function uploadImageToLinkedIn(
  token: string,
  owner: string,
  imagePath: string
): Promise<string | null> {
  // Register upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner,
        serviceRelationships: [
          { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
        ],
      },
    }),
  })

  if (!registerRes.ok) return null
  const regData = await registerRes.json()
  const uploadUrl = regData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
  const asset = regData.value?.asset

  if (!uploadUrl || !asset) return null

  // Read image file
  const { readFile } = await import('fs/promises')
  const { resolveStoredPath } = await import('@/lib/storage')
  const fullPath = resolveStoredPath(imagePath)
  const imageBuffer = await readFile(fullPath)

  // Upload
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' },
    body: imageBuffer,
  })

  if (!uploadRes.ok) return null
  return asset
}
