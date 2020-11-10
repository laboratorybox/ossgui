import multiprocessing
import os
import sys
import time
from typing import Dict

import hither as hi
import kachery_p2p as kp

from .run_sorting_job import run_sorting_job


def start_sorting_jobs_worker(feed_uri: str):
    process = multiprocessing.Process(target=_run_worker, args=(feed_uri, ))
    process.start()
    

class SortingJobManager:
    def __init__(self, feed_uri: str):
        self._sorting_jobs: Dict[str, dict] = {}
        self._running_jobs: Dict[str, hi.core.Job] = {}
        self._feed = kp.load_feed(feed_uri)
        self._subfeed = self._feed.get_subfeed('sortingJobs')
        self._job_handler = hi.ParallelJobHandler(4)
        self.iterate()
    def _process_message(self, msg):
        type0 = msg['type']
        if (type0 == 'ADD_SORTING_JOB') or (type0 == 'UPDATE_SORTING_JOB'):
            sorting_job = msg['sortingJob']
            sorting_job_id = sorting_job['sortingJobId']
            self._sorting_jobs[sorting_job_id] = sorting_job
        elif (type0 == 'DELETE_SORTING_JOB'):
            sorting_job = msg['sortingJob']
            sorting_job_id = sorting_job['sortingJobId']
            if sorting_job_id in self._sorting_jobs:
                del self._sorting_jobs[sorting_job_id]
    def iterate(self):
        while True: # make sure we get all the messages before proceeding
            messages = self._subfeed.get_next_messages(wait_msec=0)
            if len(messages) > 0:
                for message in messages:
                    self._process_message(message)
            else:
                break
        running_job_ids = list(self._running_jobs.keys())
        for job_id in running_job_ids:
            running_job = self._running_jobs[job_id]
            sorting_job = self._sorting_jobs[job_id]
            try:
                x = running_job.wait(0)
                if x is not None:
                    del self._running_jobs[job_id]
                    print('-------- result', x)
                    sorting_job['status'] = 'finished'
                    self._subfeed.append_message({
                        'type': 'UPDATE_SORTING_JOB',
                        'sortingJob': sorting_job
                    })
                else:
                    if sorting_job['status'] == 'started':
                        sorting_job['status'] = 'running'
                        self._subfeed.append_message({
                            'type': 'UPDATE_SORTING_JOB',
                            'sortingJob': sorting_job
                        })
            except Exception as err:
                del self._running_jobs[job_id]
                sorting_job['status'] = 'error'
                print(err)
                print(running_job.get_runtime_info())
                sorting_job['errorMessage'] = str(err)
                self._subfeed.append_message({
                    'type': 'UPDATE_SORTING_JOB',
                    'sortingJob': sorting_job
                })
        for sorting_job_id, sorting_job in self._sorting_jobs.items():
            status = sorting_job['status']
            if status == 'waiting':
                with hi.Config(job_handler=self._job_handler):
                    j = run_sorting_job.run(sorting_job=sorting_job)
                    self._running_jobs[sorting_job_id] = j
                sorting_job['status'] = 'started'
                self._subfeed.append_message({
                    'type': 'UPDATE_SORTING_JOB',
                    'sortingJob': sorting_job
                })
            elif (status == 'started') or (status == 'running'):
                if (sorting_job_id not in self._running_jobs):
                    sorting_job['status'] = 'error'
                    sorting_job['errorMessage'] = 'Running job not found'
                    self._subfeed.append_message({
                        'type': 'UPDATE_SORTING_JOB',
                        'sortingJob': sorting_job
                    })
        
def _run_worker(feed_uri: str):
    # sys.stdout = open('/tmp/worker.out', "w")
    sorting_job_manager = SortingJobManager(feed_uri)
    while True:
        sorting_job_manager.iterate()
        time.sleep(1)
