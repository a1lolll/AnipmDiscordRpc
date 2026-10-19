import time
import threading
import queue
import asyncio
import os
import glob
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypresence import Presence

CLIENT_ID = "1561512577966538842"
PORT = 6969

app = Flask(__name__)
CORS(app)

update_queue = queue.Queue()

def get_active_ipc_pipe():
    runtime_dir = os.environ.get('XDG_RUNTIME_DIR', f"/run/user/{os.getuid()}")
    pipes = sorted(glob.glob(f"{runtime_dir}/discord-ipc-*"))
    if not pipes:
        pipes = sorted(glob.glob("/tmp/discord-ipc-*"))
    
    pipe_numbers = []
    for p in pipes:
        try:
            num = int(p.split('-')[-1])
            pipe_numbers.append(num)
        except ValueError:
            pass
    return pipe_numbers if pipe_numbers else [0]

def rpc_worker():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    rpc = None
    last_sent_data = None
    last_update_time = 0

    while True:
        try:
            data = update_queue.get()
            if data is None:
                break

            now = time.time()
            
            has_state_changed = False
            if last_sent_data is None:
                has_state_changed = True
            else:
                if (data.get('title') != last_sent_data.get('title') or
                    data.get('episode') != last_sent_data.get('episode') or
                    data.get('isPaused') != last_sent_data.get('isPaused') or
                    data.get('largeImage') != last_sent_data.get('largeImage') or
                    data.get('smallImage') != last_sent_data.get('smallImage')):
                    has_state_changed = True
                
                time_diff = abs(data.get('currentTime', 0) - last_sent_data.get('currentTime', 0))
                if time_diff > 5:
                    has_state_changed = True

            if not has_state_changed and (now - last_update_time) < 15:
                continue

            if rpc is None:
                pipes = get_active_ipc_pipe()
                for pipe_num in reversed(pipes):
                    try:
                        candidate_rpc = Presence(CLIENT_ID, pipe=pipe_num, loop=loop)
                        candidate_rpc.connect()
                        rpc = candidate_rpc
                        print(f"Connected on IPC pipe {pipe_num}")
                        break
                    except Exception:
                        continue

            if rpc:
                try:
                    title = data.get('title', 'ani.pm')
                    episode = data.get('episode', 'Watching')
                    is_paused = data.get('isPaused', False)
                    current_time = data.get('currentTime', 0)
                    duration = data.get('duration', 0)
                    large_image_val = data.get('largeImage') or "logo"
                    small_image_val = data.get('smallImage')

                    state_text = f"{episode} (Paused)" if is_paused else episode

                    start_time = None
                    end_time = None

                    if not is_paused:
                        start_time = int(now - current_time)
                        if duration > 30 and duration > current_time:
                            end_time = int(now + (duration - current_time))

                    current_pid = os.getpid()

                    response = rpc.update(
                        pid=current_pid,
                        activity_type=3,
                        details=title,
                        state=state_text,
                        large_image=large_image_val,
                        large_text=title,
                        small_image=small_image_val,
                        small_text="ani.pm" if small_image_val else None,
                        start=start_time,
                        end=end_time
                    )

                    last_update_time = now
                    last_sent_data = data
                    print(f"Updated RPC: {title} - {state_text}")
                except Exception:
                    traceback.print_exc()
                    rpc = None
        except Exception:
            traceback.print_exc()

worker_thread = threading.Thread(target=rpc_worker, daemon=True)
worker_thread.start()

@app.route('/update', methods=['POST'])
def update_presence():
    data = request.json
    if not data:
        return jsonify({"status": "no_data"}), 400

    while not update_queue.empty():
        try:
            update_queue.get_nowait()
        except queue.Empty:
            break

    update_queue.put(data)
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    print(f"Python RPC Server running on http://127.0.0.1:{PORT}")
    app.run(host='127.0.0.1', port=PORT)