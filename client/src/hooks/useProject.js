import { useState, useCallback } from 'react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

export function useProject() {
    const [project, setProject] = useState(null)
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(false)

    const loadProject = useCallback(async (id) => {
        setLoading(true)
        try {
            const { data } = await apiClient.get(`/api/projects/${id}`)
            setProject(data)
            return data
        } catch (err) {
            toast.error('Failed to load project')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const updateProject = useCallback(async (id, updates) => {
        try {
            const { data } = await apiClient.patch(`/api/projects/${id}`, updates)
            setProject(prev => ({ ...prev, ...data }))
            return data
        } catch (err) {
            toast.error('Failed to save changes')
            throw err
        }
    }, [])

    const listVersions = useCallback(async (id) => {
        try {
            const { data } = await apiClient.get(`/api/projects/${id}/versions`)
            setVersions(data)
            return data
        } catch (err) {
            toast.error('Failed to load version history')
            throw err
        }
    }, [])

    const restoreVersion = useCallback(async (id, versionNumber) => {
        try {
            const { data } = await apiClient.post(`/api/projects/${id}/restore`, { versionNumber })
            setProject(data)
            toast.success(`Restored to version ${versionNumber}`)
            return data
        } catch (err) {
            toast.error('Failed to restore version')
            throw err
        }
    }, [])

    return { project, setProject, versions, loading, loadProject, updateProject, listVersions, restoreVersion }
}
