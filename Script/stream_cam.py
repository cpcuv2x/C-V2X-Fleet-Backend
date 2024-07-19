import shlex
import time
import subprocess
import threading
from datetime import datetime
# from getpass import getpass

# SUDO = "Ajune&Exat2024"
# echo_sudo = subprocess.Popen(['echo',SUDO], stdout=subprocess.PIPE)

# ffmpeg -rtsp_transport tcp -threads:v 2 -enable_er true -i rtsp://192.168.10.63/screenlive -fflags nobuffer -c:v libx264rgb -pix_fmt rgb24 -f v4l2 /dev/video2

# def delete_cams():
#     subprocess.Popen(shlex.split('sudo -S modprobe -r v4l2loopback'), stdin=echo_sudo.stdout, stdout=subprocess.PIPE)
#     print("Virtual cameras have been removed")
# def create_cams():
#     subprocess.Popen(shlex.split('sudo -S modprobe  v4l2loopback exclusive_cap=1,1,1,1 video_nr=23,24,25,26'), stdin=echo_sudo.stdout, stdout=subprocess.PIPE)
#     print("Virtual cameras have been established")

# def restart_cams():
#     # delete_cam = subprocess.Popen(shlex.split('sudo -S modprobe -r v4l2loopback'), stdin=echo_sudo.stdout, stdout=subprocess.PIPE)

#     try:
#         delete_outs, delete_errs = delete_cam.communicate(timeout=15)
#         print("\n==========Restarting virtual cameras=============")
#         time.sleep(3)
#         create_cams = subprocess.Popen(shlex.split('sudo -S modprobe  v4l2loopback exclusive_cap=1,1,1,1 video_nr=23,24,25,26'), stdin=echo_sudo.stdout)
#     except subprocess.TimeoutExpired:
#         delete_cam.kill()
#         create_cams.kill()
#         print("Error restarting the virtual cameras")

def dont_stop(name,command):
    no_round = 1

    while True:
        print(f"Start process:\t{name}\t#{no_round}\tat {datetime.now().strftime('%H:%M:%S')}")
        return_code = subprocess.call(command,stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if return_code == 0:
            no_round = 1
        else:
            # if no_round%10==0:
                # restart_cams()
            no_round += 1
            time.sleep(3)

IP = "192.168.10.86:8554"
STREAM = ["stream1", "stream2", "stream3", "stream4"]
VIDEO = ["video0", "video2", "video4", "video6"]


command1 = shlex.split(f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[0]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[0]}')
command2 = shlex.split(f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[1]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[1]}')
command3 = shlex.split(f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[2]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[2]}')
command4 = shlex.split(f'ffmpeg -rtsp_transport tcp -stimeout 100 -i rtsp://{IP}/{STREAM[3]} -fflags nobuffer -pix_fmt rgb24 -f v4l2 /dev/{VIDEO[3]}')

ps1 = threading.Thread(target=dont_stop, args=["Front",command1])
ps2 = threading.Thread(target=dont_stop, args=["Back",command2])
ps3 = threading.Thread(target=dont_stop, args=["Door",command3])
ps4 = threading.Thread(target=dont_stop, args=["Driver",command4])

# restart_cams()

ps1.start()
ps2.start()
ps3.start()
ps4.start()
