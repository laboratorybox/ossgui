import { Reducer } from "react"

// SortingJobId
interface SortingJobId extends String {
    __sortingJobId: string // phantom
}
export const randomSortingJobId = () => {
    return randomAlphaString(10) as any as SortingJobId
}

type SortingJobStatus = 'waiting' | 'started' | 'running' | 'finished' | 'error'

// SortingJob
export interface SortingJob {
    sortingJobId: SortingJobId,
    recordingUri: string,
    sorter: {
        sorterName: string
    },
    status: SortingJobStatus,
    errorMessage?: string
}

// AddSortingJobAction
const ADD_SORTING_JOB = 'ADD_SORTING_JOB'
export interface AddSortingJobAction {
    type: 'ADD_SORTING_JOB',
    sortingJob: SortingJob
}
export const isAddSortingJobAction = (x: any): x is AddSortingJobAction => (
    x.type === ADD_SORTING_JOB
)

// UpdateSortingJobAction
interface UpdateSortingJobAction {
    type: 'UPDATE_SORTING_JOB',
    sortingJob: SortingJob
}
const isUpdateSortingJobAction = (x: any): x is UpdateSortingJobAction => (
    x.type === 'UPDATE_SORTING_JOB'
)

// DeleteSortingJobAction
interface DeleteSortingJobAction {
    type: 'DELETE_SORTING_JOB',
    sortingJobId: SortingJobId
}
const isDeleteSortingJobAction = (x: any): x is DeleteSortingJobAction => (
    x.type === 'DELETE_SORTING_JOB'
)

// State
export type State = SortingJob[]

// Action
export type Action = AddSortingJobAction | UpdateSortingJobAction | DeleteSortingJobAction

// initial state
const initialState: State = []

// The reducer
const sortingJobs: Reducer<State, Action> = (state: State = initialState, action: Action): State => {
    if (isAddSortingJobAction(action)) {
        return [
            ...state,
            action.sortingJob
        ]
    }
    else if (isUpdateSortingJobAction(action)) {
        return state.map(j => {
            if (j.sortingJobId === action.sortingJob.sortingJobId) {
                return action.sortingJob
            }
            else return j
        })
    }
    else if (isDeleteSortingJobAction(action)) {
        return state.filter(j => (j.sortingJobId !== action.sortingJobId))
    }
    else {
        return state
    }
}

const randomAlphaString = (num_chars: number) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default sortingJobs