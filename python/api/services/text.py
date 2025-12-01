import shutil
import fitz
from fastapi import APIRouter, File, UploadFile
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel
import mammoth
from python.api.config.db_config import DB_Config
from python.api.db.postgre_helper import PostgreHelper

UploadDir = Path("assets")
UploadDir.mkdir(exist_ok=True)
router = APIRouter()

class FileUpload(BaseModel):
    title: str
    publishtime: str

class Sentence(BaseModel):
    text: str
    article: str

@router.get("/test")
async def test():
    return "hello"

@router.post("/upload")
async def upload(fileUpload: FileUpload):
    try:
        query = '''INSERT INTO t_article (title, create_time, publish_time) VALUES (%s, %s, %s)'''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                           DB_Config().port)
        _db.create_one(query, (fileUpload.title, datetime.now(), datetime.strptime(fileUpload.publishtime, "%Y-%m-%d")))
        return True

    except Exception as e:
        return e

@router.post("/sentence")
async def proc_sentence(sentence: Sentence):
    try:
        query = '''INSERT INTO t_article (sentence, x0, y0, x1, y1, article) VALUES (%s, %s, %s, %s, %s, %s)'''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.create_one(query, (sentence.text, sentence.x0, sentence.y0, sentence.x1, sentence.y1, sentence.article))
        return True

    except Exception as e:
        return e




