import { Dispatch } from '@reduxjs/toolkit'
import WebsocketConnection from '../WebsocketConnection'

class EventStreamManager {
    #eventStreams = new Map<string, EventStream>()
    constructor(private websocketConnection: WebsocketConnection, private dispatch: Dispatch<any>) {
    }
    registerEventStream(subfeedName: string) {
        const eventStream = new EventStream()
        this.#eventStreams.set(subfeedName, eventStream)
    }
    addEvent(subfeedName: string, event: any) {
        if (!this.#eventStreams.has(subfeedName)) {
            throw Error(`No event stream: ${subfeedName}`)
        }
        this.websocketConnection.sendMessage({
            type: 'addEvent',
            subfeedName,
            event
        })
    }
}

class EventStream {
}

const global: {
    eventStreamManager: EventStreamManager | null
} = {
    eventStreamManager: null
}

export const initializeEventStreams = (websocketConnection: WebsocketConnection, dispatch: Dispatch<any>) => {
    const eventStreamManager = new EventStreamManager(websocketConnection, dispatch)
    global.eventStreamManager = eventStreamManager

    eventStreamManager.registerEventStream('sortingJobs')
}

export const eventStreamManager = (): EventStreamManager => {
    if (global.eventStreamManager === null) {
        throw Error('Not yet initialized')
    }
    return global.eventStreamManager
}