import re

SPLIT_RE = re.compile(r'(?<=[。！？.!?])\s*')

def split_into_sentences(text):
    return re.split(r'(?<=[。！？.!?])', text)

