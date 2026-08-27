import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

type PublishFile = {
  path: string
  content: string
}

type PublishRequest = {
  token: string
  siteName?: string
  files: PublishFile[]
}

type NetlifySite = {
  id?: string
  name?: string
  ssl_url?: string
  url?: string
  admin_url?: string
}

type NetlifyDeploy = {
  id?: string
  state?: string
  url?: string
  deploy_url?: string
  ssl_url?: string
  admin_url?: string
  error?: string
  error_message?: string
  message?: string
  required?: string[]
}

const NETLIFY_API = 'https://api.netlify.com/api/v1'

const sanitizeSiteName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50)

const parseJson = <T,>(text: string): T | null => {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/*
 * Netlify's file-digest API uses SHA-1 for normal files.
 */
const sha1 = (content: string) => {
  return createHash('sha1')
    .update(Buffer.from(content, 'utf8'))
    .digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishRequest

    const { token, files, siteName } = body

    // =========================================================
    // 1. Validate request
    // =========================================================

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Netlify Personal Access Token is required.',
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No website files were provided.',
        },
        { status: 400 }
      )
    }

    if (files.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many files. Maximum is 1000 files.',
        },
        { status: 400 }
      )
    }

    // =========================================================
    // 2. Normalize files
    // =========================================================

    const normalizedFiles: PublishFile[] = []

    for (const file of files) {
      if (
        !file ||
        typeof file.path !== 'string' ||
        typeof file.content !== 'string'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid file format.',
          },
          { status: 400 }
        )
      }

      const cleanPath = file.path
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')

      if (
        !cleanPath ||
        cleanPath === '..' ||
        cleanPath.includes('../') ||
        cleanPath.includes('/..') ||
        cleanPath.includes('\0') ||
        cleanPath.includes('#') ||
        cleanPath.includes('?')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file path: ${cleanPath}`,
          },
          { status: 400 }
        )
      }

      normalizedFiles.push({
        path: cleanPath,
        content: file.content,
      })
    }

    // =========================================================
    // 3. Find index.html
    // =========================================================

    const indexFile = normalizedFiles.find(
      (file) => file.path.toLowerCase() === 'index.html'
    )

    if (!indexFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your landing page must contain an index.html file.',
        },
        { status: 400 }
      )
    }

    if (!indexFile.content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'index.html is empty.',
        },
        { status: 400 }
      )
    }

    // =========================================================
    // 4. Validate HTML
    // =========================================================

    const html = indexFile.content.trim()

    const looksLikeHtml =
      /<!doctype\s+html/i.test(html) ||
      /<html[\s>]/i.test(html) ||
      /<body[\s>]/i.test(html)

    if (!looksLikeHtml) {
      return NextResponse.json(
        {
          success: false,
          error:
            'index.html does not contain a valid HTML document.',
        },
        { status: 400 }
      )
    }

    // =========================================================
    // 5. Authentication headers
    // =========================================================

    const authHeaders = {
      Authorization: `Bearer ${token.trim()}`,
      'User-Agent': 'Vivafy AI/1.0',
    }

    // =========================================================
    // 6. Create Netlify site
    // =========================================================

    const cleanSiteName = sanitizeSiteName(
      siteName || `landing-page-${Date.now()}`
    )

    const createResponse = await fetch(`${NETLIFY_API}/sites`, {
      method: 'POST',

      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name:
          cleanSiteName ||
          `landing-page-${Date.now()}`,
      }),
    })

    const createText = await createResponse.text()

    const createData = parseJson<
      NetlifySite & {
        message?: string
      }
    >(createText)

    if (!createResponse.ok) {
      const error =
        createResponse.status === 401
          ? 'Invalid or expired Netlify Personal Access Token.'
          : createResponse.status === 403
            ? 'Your Netlify token does not have permission to create a site.'
            : createData?.message ||
              'Netlify failed to create the site.'

      return NextResponse.json(
        {
          success: false,
          error,
        },
        {
          status: createResponse.status,
        }
      )
    }

    const siteId = createData?.id

    if (!siteId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Netlify did not return a site ID.',
        },
        { status: 502 }
      )
    }

    // =========================================================
    // 7. Build Netlify file digest
    // =========================================================
    //
    // Netlify expects:
    //
    // {
    //   files: {
    //     "/index.html": "SHA1"
    //   }
    // }
    //
    // The leading "/" is important.
    // =========================================================

    const digestFiles: Record<string, string> = {}

    for (const file of normalizedFiles) {
      const netlifyPath = `/${file.path}`

      digestFiles[netlifyPath] = sha1(file.content)
    }

    // =========================================================
    // 8. Create deploy using file digest
    // =========================================================

    const deployResponse = await fetch(
      `${NETLIFY_API}/sites/${siteId}/deploys`,
      {
        method: 'POST',

        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          files: digestFiles,
        }),
      }
    )

    const deployText = await deployResponse.text()

    const deployData = parseJson<
      NetlifyDeploy & {
        message?: string
        required?: string[]
      }
    >(deployText)

    if (!deployResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            deployData?.message ||
            deployData?.error_message ||
            'Netlify failed to create the deployment.',
        },
        {
          status: deployResponse.status,
        }
      )
    }

    const deployId = deployData?.id

    if (!deployId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Netlify did not return a deploy ID.',
        },
        { status: 502 }
      )
    }

    // =========================================================
    // 9. Determine which files Netlify requires
    // =========================================================

    let requiredHashes = deployData?.required || []

    /*
     * If Netlify is still preparing the deploy, poll briefly
     * until it gives us the required file hashes.
     */
    if (
      requiredHashes.length === 0 &&
      deployData?.state !== 'ready'
    ) {
      for (let attempt = 0; attempt < 20; attempt++) {
        await sleep(500)

        const statusResponse = await fetch(
          `${NETLIFY_API}/deploys/${deployId}`,
          {
            method: 'GET',
            headers: authHeaders,
            cache: 'no-store',
          }
        )

        const statusText = await statusResponse.text()

        const statusData = parseJson<
          NetlifyDeploy & {
            required?: string[]
            message?: string
          }
        >(statusText)

        if (!statusResponse.ok) {
          return NextResponse.json(
            {
              success: false,
              error:
                statusData?.message ||
                'Could not check the Netlify deployment.',
            },
            {
              status: statusResponse.status,
            }
          )
        }

        if (statusData?.required?.length) {
          requiredHashes = statusData.required
          break
        }

        if (
          statusData?.state === 'error' ||
          statusData?.state === 'failed'
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                statusData.error_message ||
                statusData.error ||
                statusData.message ||
                'Netlify failed while preparing the deployment.',
            },
            { status: 502 }
          )
        }

        if (statusData?.state === 'ready') {
          break
        }
      }
    }

    // =========================================================
    // 10. Upload only the files Netlify requested
    // =========================================================

    if (requiredHashes.length > 0) {
      for (const requiredHash of requiredHashes) {
        const file = normalizedFiles.find(
          (item) => sha1(item.content) === requiredHash
        )

        if (!file) {
          return NextResponse.json(
            {
              success: false,
              error:
                `Netlify requested a file with SHA-1 ${requiredHash}, ` +
                'but the file could not be found locally.',
            },
            { status: 500 }
          )
        }

        const encodedPath = file.path
          .split('/')
          .map((part) => encodeURIComponent(part))
          .join('/')

        const uploadResponse = await fetch(
          `${NETLIFY_API}/deploys/${deployId}/files/${encodedPath}`,
          {
            method: 'PUT',

            headers: {
              ...authHeaders,
              'Content-Type': 'application/octet-stream',
            },

            body: Buffer.from(file.content, 'utf8'),
          }
        )

        const uploadText = await uploadResponse.text()

        if (!uploadResponse.ok) {
          const uploadData = parseJson<{
            message?: string
            error?: string
          }>(uploadText)

          return NextResponse.json(
            {
              success: false,
              error:
                uploadData?.message ||
                uploadData?.error ||
                `Netlify failed to upload ${file.path}.`,
              status: uploadResponse.status,
            },
            {
              status: uploadResponse.status,
            }
          )
        }
      }
    }

    // =========================================================
    // 11. Wait for deploy to become ready
    // =========================================================

    let finalDeploy: NetlifyDeploy | null = null

    const maxAttempts = 30

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(1000)

      const statusResponse = await fetch(
        `${NETLIFY_API}/deploys/${deployId}`,
        {
          method: 'GET',
          headers: authHeaders,
          cache: 'no-store',
        }
      )

      const statusText = await statusResponse.text()

      const statusData = parseJson<
        NetlifyDeploy & {
          message?: string
        }
      >(statusText)

      if (!statusResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              statusData?.message ||
              'Could not check the deployment status.',
          },
          {
            status: statusResponse.status,
          }
        )
      }

      finalDeploy = statusData

      // Successfully live
      if (statusData?.state === 'ready') {
        break
      }

      // Failed
      if (
        statusData?.state === 'error' ||
        statusData?.state === 'failed'
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              statusData.error_message ||
              statusData.error ||
              statusData.message ||
              'Netlify failed while processing the deployment.',
          },
          { status: 502 }
        )
      }
    }

    // =========================================================
    // 12. Verify ready
    // =========================================================

    if (
      !finalDeploy ||
      finalDeploy.state !== 'ready'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Netlify received the website, but the deployment did not become ready within the expected time.',
          deployId,
          state:
            finalDeploy?.state ||
            'unknown',
        },
        { status: 504 }
      )
    }

    // =========================================================
    // 13. Determine live URL
    // =========================================================

    const url =
      finalDeploy.ssl_url ||
      finalDeploy.deploy_url ||
      finalDeploy.url ||
      createData?.ssl_url ||
      createData?.url ||
      (createData?.name
        ? `https://${createData.name}.netlify.app`
        : null)

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error:
            'The deployment is ready, but Netlify did not return a live URL.',
          siteId,
          deployId,
        },
        { status: 502 }
      )
    }

    // =========================================================
    // 14. Success
    // =========================================================

    return NextResponse.json({
      success: true,

      message:
        'Your landing page has been published successfully.',

      site: {
        id: siteId,
        name:
          createData?.name ||
          cleanSiteName,
        url,
        deployId,
        state: finalDeploy.state,
        adminUrl:
          createData?.admin_url ||
          null,
      },

      url,
    })
  } catch (error) {
    console.error(
      'Netlify publish error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while publishing.',
      },
      { status: 500 }
    )
  }
}