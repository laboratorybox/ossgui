import React, { Dispatch, FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { RootState } from '../reducers'
import { SortingJob } from '../reducers/sortingJobs'

interface StateProps {
    sortingJobs: SortingJob[]
}

interface DispatchProps {

}

interface OwnProps {

}

type Props = StateProps & DispatchProps & OwnProps

const SortingJobList: FunctionComponent<Props> = (props: Props) => {
    const { sortingJobs } = props
    React.useRef(null)

    return (
        <table>
            <thead>
                <tr>
                    <th>Sorting job ID</th>
                    <th>Recording</th>
                    <th>Sorter name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {
                    sortingJobs.slice(0).reverse().map(sj => (
                        <tr key={sj.sortingJobId.toString()}>
                            <td>{sj.sortingJobId.toString()}</td>
                            <td>{sj.recordingUri.toString()}</td>
                            <td>{sj.sorter.sorterName.toString()}</td>
                            <td>{`${sj.status.toString()}${sj.errorMessage ? ': ' + sj.errorMessage : ''}`}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    sortingJobs: state.sortingJobs
})

const mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: OwnProps): DispatchProps => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(SortingJobList)