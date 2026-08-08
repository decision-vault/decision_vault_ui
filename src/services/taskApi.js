// src/services/taskApi.js

import { apiRequest } from './apiClient'

/**
 * =========================
 * SPRINT CRUD
 * =========================
 */

export function createSprint(payload) {
  return apiRequest('/api/sprints', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getSprint(sprintId) {
  return apiRequest(`/api/sprints/${sprintId}`)
}

export function updateSprint(sprintId, payload) {
  return apiRequest(`/api/sprints/${sprintId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSprint(sprintId) {
  return apiRequest(`/api/sprints/${sprintId}`, {
    method: 'DELETE',
  })
}

export function getSprints(projectId) {
  return apiRequest(`/api/sprints?project_id=${projectId}`)
}

/**
 * =========================
 * TASK CRUD
 * =========================
 */

export function getTasks(projectId) {
  return apiRequest(`/api/tasks?project_id=${projectId}`)
}

export function getTask(taskId) {
  return apiRequest(`/api/tasks/${taskId}`)
}

export function createTask(payload) {
  return apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(taskId, payload) {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(taskId) {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export function updateTaskStatus(taskId, status) {
  return apiRequest(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
    }),
  })
}

export function getTasksBySprint(sprintId) {
  return apiRequest(`/api/sprints/${sprintId}/tasks`)
}

/**
 * =========================
 *  SUBTASK CRUD
 * =========================
 */

export function createSubtask(parentId, payload) {
  return apiRequest(`/api/tasks/${parentId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getSubtasks(parentId) {
  return apiRequest(`/api/tasks/${parentId}/subtasks`)
}

export function getSubtaskDetail(subtaskId) {
  return apiRequest(`/api/subtasks/${subtaskId}`)
}

export function updateSubtask(subtaskId, payload) {
  return apiRequest(`/api/subtasks/${subtaskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSubtask(subtaskId) {
  return apiRequest(`/api/subtasks/${subtaskId}`, {
    method: 'DELETE',
  })
}

/**
 * =========================
 * ASSIGNMENTS, COMMENTS & ACTIVITIES
 * =========================
 */

export function assignTask(taskId, userId) {
  return apiRequest(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
    }),
  })
}

export function unassignTask(taskId) {
  return apiRequest(`/api/tasks/${taskId}/unassign`, {
    method: 'POST',
  })
}

export function getTaskComments(taskId) {
  return apiRequest(`/api/tasks/${taskId}/comments`)
}

export function createTaskComment(taskId, message) {
  return apiRequest(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      message,
    }),
  })
}

export function getTaskActivities(taskId) {
  return apiRequest(`/api/tasks/${taskId}/activities`)
}