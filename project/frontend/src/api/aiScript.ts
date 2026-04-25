import apiClient from './client'

export interface ScriptScene {
  shot_number: number
  scene: string
  shot_content: string
  camera_movement: string
  lighting_tone: string
  sound_design: string
  feeling: string
}

export interface ScriptGenerateRequest {
  chapter_id: number
  scene?: string
  style?: string
}

export interface ScriptGenerateResponse {
  title: string
  script_text: string
  scenes: ScriptScene[]
}

export const generateScript = (data: ScriptGenerateRequest) =>
  apiClient.post<ScriptGenerateResponse>('/ai/generate-script', data)
