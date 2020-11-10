// This is an open 2-way connection with server (websocket)
class WebsocketConnection {
    #ws: WebSocket
    #isConnected: boolean = false
    #isDisconnected: boolean = false
    #queuedOutgoingMessages: any[] = []
    #onConnectCallbacks: (() => void)[] = []
    #onDisconnectCallbacks: (() => void)[] = []
    #onMessageCallbacks: ((message: any) => void)[] = []
    constructor() {
      const url = `ws://${window.location.hostname}:5301`
      this.#ws = new WebSocket(url)
      this.#ws.addEventListener('open', () => {
        this.#isConnected = true
        this.#isDisconnected = false
        this.#queuedOutgoingMessages.forEach(qm => {
            this.sendMessage(qm)
        })
        this.#onConnectCallbacks.forEach(cb => cb())
      })
      this.#ws.addEventListener('message', evt => {
        const x = JSON.parse(evt.data)
        console.info('INCOMING MESSAGE', x)
        this.#onMessageCallbacks.forEach(cb => cb(x))
      })
      this.#ws.addEventListener('close', () => {
        console.warn('Websocket disconnected.')
        this.#isConnected = false
        this.#isDisconnected = true
        this.#onConnectCallbacks.forEach(cb => {
            cb()
        })
      })
      this._start()
    }
    onMessage(cb: (message: any) => void) {
      this.#onMessageCallbacks.push(cb)
    }
    onConnect(cb: () => void) {
      this.#onConnectCallbacks.push(cb)
      if (this.#isConnected) {
        cb()
      }
    }
    onDisconnect(cb: () => void) {
        this.#onDisconnectCallbacks.push(cb)
        if (this.#isDisconnected) {
          cb()
        }
      }
    isDisconnected() {
      return this.#isDisconnected
    }
    sendMessage(msg: any) {
      if (!this.#isConnected) {
        this.#queuedOutgoingMessages.push(msg)
        return
      }
      console.info('OUTGOING MESSAGE', msg)
      this.#ws.send(JSON.stringify(msg))
    }
    async _start() {
      while (true) {
        await sleepMsec(17000)
        this.sendMessage({type: 'keepAlive'})
      }
    }
  }

  const sleepMsec = (m: number) => new Promise(r => setTimeout(r, m))

  export default WebsocketConnection