import asyncio
import json
import multiprocessing
import time
import traceback
from typing import Dict

import flask
import hither as hi
import kachery_p2p as kp
import websockets

from .Session import Session
from .start_sorting_jobs_worker import start_sorting_jobs_worker

app = flask.Flask(__name__)
# app.config["DEBUG"] = True

feed_name = 'ossgui'
try:
    feed = kp.load_feed('ossgui')
except:
    feed = kp.create_feed('ossgui')

start_sorting_jobs_worker(feed.get_uri())

async def incoming_message_handler(session, websocket):
    async for message in websocket:
        msg = json.loads(message)
        session.handle_message(msg)

async def outgoing_message_handler(session, websocket):
    while True:
        try:
            hi.wait(0)
        except:
            traceback.print_exc()
        messages = session.check_for_outgoing_messages()
        for message in messages:
            await websocket.send(json.dumps(message))
        if session.elapsed_sec_since_incoming_keepalive() > 60:
            print('Closing session')
            return
        await asyncio.sleep(0.05)

# Thanks: https://websockets.readthedocs.io/en/stable/intro.html
async def connection_handler(websocket, path):
    config = {
        'feed_uri': feed.get_uri()
    }
    session = Session(config=config)
    task1 = asyncio.ensure_future(
        incoming_message_handler(session, websocket))
    task2 = asyncio.ensure_future(
        outgoing_message_handler(session, websocket))
    done, pending = await asyncio.wait(
        [task1, task2],
        return_when=asyncio.FIRST_COMPLETED,
    )
    print('Connection closed.')
    session.cleanup()
    for task in pending:
        task.cancel()

def start_server():
    start_server0 = websockets.serve(connection_handler, '0.0.0.0', 5301)

    asyncio.get_event_loop().run_until_complete(start_server0)
    print('Server started.')
    asyncio.get_event_loop().run_forever()
