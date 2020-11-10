import React, { Dispatch, FunctionComponent, useCallback, useState } from 'react'
import { connect } from 'react-redux'
import { addSortingJob } from '../actions/sortingJobs'
import { RootState } from '../reducers'
import { randomSortingJobId } from '../reducers/sortingJobs'

interface StateProps {
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

type Mode = 'not-adding' | 'adding'

const AddSortingJob: FunctionComponent<Props> = (props: Props) => {
    const [mode, setMode] = useState<Mode>('adding')
    const [selectedSorterName, setSelectedSorterName] = useState<string>('mountainsort4')
    const [recordingUri, setRecordingUri] = useState<string>('')
    const [error, setError] = useState<string>('')

    const _handleAdd = useCallback(() => {
        setMode('adding')
    }, [setMode])

    const _handleCancel = useCallback(() => {
        setMode('not-adding')
    }, [setMode])

    const _handleSubmit = useCallback(() => {
        if (!recordingUri) {
            setError('Invalid recording URI')
            return
        }
        addSortingJob({
            sortingJobId: randomSortingJobId(),
            recordingUri,
            sorter: {sorterName: selectedSorterName},
            status: 'waiting'
        })
        setMode('not-adding')
    }, [setMode, addSortingJob, recordingUri, selectedSorterName, setError])

    const _handleSelectedSorterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSorterName(event.target.value)
    }, [setSelectedSorterName])

    const _handleRecordingUriChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordingUri(event.target.value)
    }, [setRecordingUri])

    const sorters: {sorterName: string}[] = [
        {
            sorterName: 'mountainsort4'
        }
    ]

    React.useRef(null)

    if (mode === 'not-adding') {
        return (
            <div>
                <button onClick={_handleAdd}>Add sorting job</button>
            </div>
        )
    }
    else if (mode === 'adding') {
        return (
            <div>
                <button onClick={_handleCancel}>Cancel add sorting job</button>
                <div>
                    Recording URI:{" "}
                    <input
                        type="text"
                        value={recordingUri}
                        onChange={_handleRecordingUriChange}
                    >
                    </input>
                </div>
                <form>
                    {
                        sorters.map(s => (
                            <div className="radio" key={s.sorterName}>
                                <label>
                                    <input
                                        type="radio"
                                        value={s.sorterName}
                                        checked={selectedSorterName === s.sorterName}
                                        onChange={_handleSelectedSorterChange}
                                    />
                                    {s.sorterName}
                                </label>
                            </div>
                        ))
                    }
                </form>
                {
                    error && (
                        <div style={{color: 'red'}}>Unable to submit sorting job: {error}</div>
                    )
                }
                <button onClick={_handleSubmit}>Submit</button>
            </div>
        )
    }
    else {
        throw Error('Unexpected')
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    sortingJobs: state.sortingJobs
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(AddSortingJob)