import { AddSortingJobAction, SortingJob } from "../reducers/sortingJobs"
import { eventStreamManager } from "./EventStreamManager"

export const addSortingJob = (sortingJob: SortingJob) => {
    const e: AddSortingJobAction = {
        type: 'ADD_SORTING_JOB',
        sortingJob
    }
    eventStreamManager().addEvent('sortingJobs', e)
}