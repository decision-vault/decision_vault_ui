import { apiRequest } from './apiClient'

const BASE = '/api/local-workspace'

export function openLocalProject(projectRoot) {
  return apiRequest(`${BASE}/open`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot }),
  })
}

export function readWorkspaceFile(projectRoot, path) {
  return apiRequest(`${BASE}/file/read`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot, path }),
  })
}

export function previewWorkspaceWrite(projectRoot, path, content) {
  return apiRequest(`${BASE}/file/write`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot, path, content, confirmed: false }),
  })
}

export function approveWorkspaceWrite(projectRoot, path, content) {
  return apiRequest(`${BASE}/file/write`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot, path, content, confirmed: true }),
  })
}

export function searchWorkspaceContent(projectRoot, query) {
  return apiRequest(`${BASE}/search/content`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot, query }),
  })
}

export function runWorkspaceCommand(projectRoot, command) {
  return apiRequest(`${BASE}/terminal/run`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot, command }),
  })
}

export function getWorkspaceGitStatus(projectRoot) {
  return apiRequest(`${BASE}/git/status`, {
    method: 'POST',
    body: JSON.stringify({ project_root: projectRoot }),
  })
}
