import time

import hither as hi
import kachery_p2p as kp
import labbox_ephys as le


@hi.function('run_sorting_job', '0.1.0')
def run_sorting_job(sorting_job):
    print('--- run sorting job 1')
    recording_uri = sorting_job['recordingUri']
    print('--- run sorting job 2', recording_uri)
    recording_object = kp.load_object(recording_uri)
    print('--- run sorting job 3')
    with hi.Config(
        container=True
    ):
        sorter_name = sorting_job['sorter']['sorterName']
        print('--- run sorting job 4')
        if sorter_name == 'mountainsort4':
            print('--- run sorting job 5')
            x = le.sorters.mountainsort4.run(
                recording_object=recording_object
            ).wait()
            print('--- run sorting job 6')
            sorting_object = x['sorting_object']
            return sorting_object
        else:
            raise Exception(f'Unrecognized sorter: {sorter_name}')

