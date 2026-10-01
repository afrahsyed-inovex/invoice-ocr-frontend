"""Windows stand-in for the Unix-only ``fcntl`` module.

Usman's backend (usmans-backend/invoice--usman/app/pipeline/ratelimit.py) imports ``fcntl`` to
take an exclusive lock on its LLM quota file. Windows has no ``fcntl``, so this folder is put on
PYTHONPATH when the backend runs on Windows. Nothing in his code is changed.

Only ``flock`` is provided — the one function his code calls — implemented with msvcrt
byte-range locks, so the lock still excludes other threads and processes.
"""

import msvcrt
import os
import time

LOCK_SH = 1
LOCK_EX = 2
LOCK_NB = 4
LOCK_UN = 8

_RETRY_DELAY_S = 0.05


def flock(file, operation):
    """Lock or unlock byte 0 of ``file``. Shared locks are treated as exclusive."""
    fd = file if isinstance(file, int) else file.fileno()
    # msvcrt locks start at the current position; always lock the same byte.
    os.lseek(fd, 0, os.SEEK_SET)

    if operation & LOCK_UN:
        msvcrt.locking(fd, msvcrt.LK_UNLCK, 1)
        return

    while True:
        try:
            msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)
            return
        except OSError:
            if operation & LOCK_NB:
                raise
            time.sleep(_RETRY_DELAY_S)
