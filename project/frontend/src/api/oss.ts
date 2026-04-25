import apiClient from './client'

export interface OssSignatureResponse {
  accessKeyId: string
  policy: string
  signature: string
  host: string
  key: string
  url: string
}

export const getOssSignature = (filename: string, dirPrefix = 'audio/') =>
  apiClient.post<OssSignatureResponse>('/oss/signature', { filename, dir_prefix: dirPrefix })

export const uploadToOss = async (
  file: File | Blob,
  signature: OssSignatureResponse
): Promise<string> => {
  const formData = new FormData()
  formData.append('key', signature.key)
  formData.append('OSSAccessKeyId', signature.accessKeyId)
  formData.append('policy', signature.policy)
  formData.append('Signature', signature.signature)
  formData.append('file', file)

  const res = await fetch(signature.host, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`OSS upload failed: ${res.status}`)
  }

  return signature.url
}
