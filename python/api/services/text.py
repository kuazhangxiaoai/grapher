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

class Sentence(BaseModel):
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    article: str

@router.get("/test")
async def test():
    return "hello"

@router.post("/upload")
async def upload(file: UploadFile=File(...)):
    try:
        ext = Path(file.filename).suffix.lower()
        assert ext in [".docx", ".txt", ".doc", ".pdf"]
        savepath = UploadDir / file.filename
        with open(savepath, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        #query = '''INSERT INTO t_article (title, create_time, publish_time, filename) VALUES (%s, %s, %s, %s)'''
        #_db = PostgreHelper(DB_Config().host,
        #                    DB_Config().user,
        #                    DB_Config().password,
        #                    DB_Config().databasename,
        #                    DB_Config().port)
        #_db.create_one(query, (title, datetime.now(), publishtime, file.filename))
        bytes_doc = await file.read()
        if ext in ['.docx', '.doc']:
            html = mammoth.convert_to_html(file.file)
        return {"filename": file.filename, "html": html}

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




