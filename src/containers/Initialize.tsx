import { Dispatch } from '@reduxjs/toolkit'
import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { initializeEventStreams } from '../actions/EventStreamManager'
import { RootState } from '../reducers'
import { Action } from '../reducers/sortingJobs'
import WebsocketConnection from '../WebsocketConnection'

interface StateProps {
}

interface DispatchProps {
    dispatch: Dispatch<any>
}

interface OwnProps {

}

type Props = StateProps & DispatchProps & OwnProps



let initialized = false

const initialize = (dispatch: Dispatch<any>) => {
    const websocketConnection = new WebsocketConnection()
    websocketConnection.onMessage(msg => {
        if (msg.type === 'newEvent') {
            if (msg.subfeedName === 'sortingJobs') {
                dispatch(msg.event)
            }
        }
    })
    initializeEventStreams(websocketConnection, dispatch)
}

const Initialize: FunctionComponent<Props> = (props: Props) => {
    const { dispatch } = props
    if (!initialized) {
        initialized = true
        initialize(dispatch)
    }
    return <span></span>
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    sortingJobs: state.sortingJobs
})

const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps => ({
    dispatch
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Initialize)