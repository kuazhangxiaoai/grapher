import shutil
import fitz
from fastapi import APIRouter, File, UploadFile
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel
import mammoth
from sympy import content

from python.api.config.db_config import DB_Config
from python.api.db.postgre_helper import PostgreHelper

UploadDir = Path("python/assets")
UploadDir.mkdir(exist_ok=True)
router = APIRouter()

class FileUpload(BaseModel):
    title: str
    publishtime: str
    filename: str

class Sentence(BaseModel):
    text: str
    article: str

@router.get("/test")
async def test():
    return "hello"

@router.post("/upload")
async def upload(fileUpload: FileUpload):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT title FROM t_article WHERE title='%s' ''' % fileUpload.title
        exist = _db.df_query_sql(query)
        assert len(exist) == 0

        query = '''INSERT INTO t_article (title, create_time, publish_time, filename) VALUES (%s, %s, %s, %s)'''
        _db.create_one(
            query,
            (
                fileUpload.title,
                datetime.now(),
                datetime.strptime(fileUpload.publishtime, "%Y-%m-%d"),
                fileUpload.filename
            )
        )
        return True

    except Exception as e:
        return e

#将文件上传至后端
@router.post("/uploadfile")
async def uploadfile(file: UploadFile=File(...)):
    savepath = UploadDir / file.filename
    with open(savepath, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": 'OK', 'url': f"/assets/{file.filename}"}

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

@router.get("/articletitles")
async def get_article_titles():
    try:
        query = '''
            SELECT title, publish_time FROM t_article
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        article_info = _db.df_query_sql(query)
        article_items = []
        for i, row in article_info.iterrows():
            article_items.append({
                "title": row.get("title"),
                "publish_time": row.get("publish_time")
            })

        return article_items

    except Exception as e:
        return e



