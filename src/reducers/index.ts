import { combineReducers } from '@reduxjs/toolkit'
import sortingJobs, { Action as SortingJobsAction, State as SortingJobsState } from './sortingJobs'

export interface RootState {
    sortingJobs: SortingJobsState
}
const rootReducer = combineReducers({
    sortingJobs
})

export type RootAction = SortingJobsAction

export default rootReducer

