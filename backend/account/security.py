import binascii
from os import urandom
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from django.conf import settings

sha = settings.SECURE_HASH_ALGORITHM


def create_token_string():
    """
    Generate a random token string.

    binascii.hexilify takes in every byte of the urandom output and converts it
    the corresponding 2-digit hexadecimal. So, if the urandom output is 16 bytes
    long, the hexlify output will be 32 characters long, thus the
    TOKEN_CHARACTER_LENGTH must be divided by 2.

    :return: A random token string.
    """
    return binascii.hexlify(urandom(settings.TOKEN_CHARACTER_LENGTH / 2)).decode()


def hash_token(token):
    digest = hashes.Hash(sha(), backend=default_backend())
    digest.update(binascii.unhexlify(token))
    return binascii.hexlify(digest.finalize()).decode()
