import shlex
import time
import subprocess
import threading
from datetime import datetime


def dont_stop(name, command):
    no_round = 1

    while True:
        print(
            f"Start process:\t{name}\t#{no_round}\tat {datetime.now().strftime('%H:%M:%S')}")
        return_code = subprocess.call(
            command, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if return_code == 0:
            no_round = 1
        else:
            no_round += 1
            time.sleep(3)


IP = "192.168.10.86:8554"
STREAM = ["stream1", "stream2", "stream3", "stream4"]
VIDEO = ["video0", "video2", "video4", "video6"]


command1 = shlex.split(
    f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[0]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[0]}')
command2 = shlex.split(
    f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[1]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[1]}')
command3 = shlex.split(
    f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[2]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[2]}')
command4 = shlex.split(
    f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[3]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[3]}')

ps1 = threading.Thread(target=dont_stop, args=["Front", command1])
ps2 = threading.Thread(target=dont_stop, args=["Back", command2])
ps3 = threading.Thread(target=dont_stop, args=["Door", command3])
ps4 = threading.Thread(target=dont_stop, args=["Driver", command4])

ps1.start()
ps2.start()
ps3.start()
ps4.start()
