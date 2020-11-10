import os
import time

import hither as hi
import kachery_p2p as kp
import numpy as np


class WorkerSession:
    def __init__(self, *, config):
        self._config = config
        self._on_message_callbacks = []
        feed_uri = config['feed_uri']
        self._feed = kp.load_feed(feed_uri)
        self._sorting_jobs_subfeed = self._feed.get_subfeed('sortingJobs')

    def initialize(self):
        # self._send_message(msg)
        pass
    def cleanup(self):
        self._halted = True
    def handle_message(self, msg):
        type0 = msg.get('type')
        if type0 == 'addEvent':
            subfeed_name = msg['subfeedName']
            event = msg['event']
            subfeed = self._feed.get_subfeed(subfeed_name)
            subfeed.append_message(event)
    def iterate(self):
        messages = self._sorting_jobs_subfeed.get_next_messages(wait_msec=500)
        for message in messages:
            self._send_message({
                'type': 'newEvent',
                'subfeedName': 'sortingJobs',
                'event': message
            })
    def on_message(self, callback):
        self._on_message_callbacks.append(callback)
    def _send_message(self, msg):
        for cb in self._on_message_callbacks:
            cb(msg)
