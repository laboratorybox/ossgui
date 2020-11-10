import multiprocessing
import time


class Session:
    def __init__(self, *, config):
        self._config = config

        pipe_to_parent, pipe_to_child = multiprocessing.Pipe()
        self._worker_process =  multiprocessing.Process(target=_run_worker_session, args=(pipe_to_parent, config))
        self._worker_process.start()
        self._pipe_to_worker_process = pipe_to_child
        self._incoming_keepalive_timestamp = time.time()
    def elapsed_sec_since_incoming_keepalive(self):
        return time.time() - self._incoming_keepalive_timestamp
    def cleanup(self):
        self._pipe_to_worker_process.send('exit')
        pass
    def check_for_outgoing_messages(self):
        ret = []
        while self._pipe_to_worker_process.poll():
            msg = self._pipe_to_worker_process.recv()
            if isinstance(msg, dict):
                if msg['type'] == 'outgoing_message':
                    ret.append(msg['message'])
                else:
                    print(msg)
                    raise Exception('Unexpected message from worker session')
            else:
                print(msg)
                raise Exception('Unexpected message from worker session')
        return ret
    def handle_message(self, msg):
        if msg['type'] == 'keepAlive':
            self._handle_keepalive()
        else:
            self._pipe_to_worker_process.send(dict(
                type='incoming_message',
                message=msg
            ))
    def _handle_keepalive(self):
        self._incoming_keepalive_timestamp = time.time()

def _run_worker_session(pipe_to_parent, config):
    from .WorkerSession import WorkerSession
    WS = WorkerSession(config=config)
    def handle_message(msg):
        pipe_to_parent.send(dict(
            type='outgoing_message',
            message=msg
        ))
    WS.on_message(handle_message)
    WS.initialize()
    while True:
        while pipe_to_parent.poll():
            x = pipe_to_parent.recv()
            if isinstance(x, str):
                if x == 'exit':
                    WS.cleanup()
                    return
                else:
                    print(x)
                    raise Exception('Unexpected message in _run_worker_session')
            elif isinstance(x, dict):
                if x['type'] == 'incoming_message':
                    WS.handle_message(x['message'])
                else:
                    print(x)
                    raise Exception('Unexpected message in _run_worker_session')
            else:
                print(x)
                raise Exception('Unexpected message in _run_worker_session')
        WS.iterate()
        time.sleep(0.05)
