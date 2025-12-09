import shutil
import fitz
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel
from typing import List

from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper

UploadDir = Path("python/assets")
UploadDir.mkdir(exist_ok=True)
router = APIRouter()

class FileUpload(BaseModel):
    title: str
    publishtime: str
    filename: str

class Sentence(BaseModel):
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    article: str
    page: int


@router.get("/test")
async def test():
    return "hello"

@router.get("/getPDFPreviewUrl")
async def getPDFPreviewUrl(title: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT filename FROM t_article WHERE title='%s' ''' % title
        filename = _db.df_query_sql(query).iloc[0,0]
        url = f"/assets/{filename}"
        return JSONResponse(content={"message": "success", "url": url}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

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
        assert len(exist) == 0, "The file is already exist."

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
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

#将文件上传至后端
@router.post("/uploadfile")
async def uploadfile(file: UploadFile=File(...)):
    savepath = UploadDir / file.filename
    with open(savepath, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = {"message": 'OK', 'url': f"/assets/{file.filename}"}
    return JSONResponse(content=data, status_code=200)

@router.post("/uploadSentence")
async def write_sentence(sentence: Sentence):
    try:
        query = '''INSERT INTO t_sequence (sequence, x0, y0, x1, y1, article, page) VALUES (%s, %s, %s, %s, %s, %s, %s)'''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.create_one(query, (sentence.text, sentence.x0, sentence.y0, sentence.x1, sentence.y1, sentence.article, sentence.page))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/uploadSentences")
async def write_sentences(sentences: List[Sentence]):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)

        for i in range(len(sentences)):
            query = '''INSERT INTO t_sequence (sequence, x0, y0, x1, y1, article, page) VALUES (%s, %s, %s, %s, %s, %s, %s)'''
            _db.create_one(query, (sentences[i].text, sentences[i].x0, sentences[i].y0, sentences[i].x1, sentences[i].y1, sentences[i].article, sentences[i].page))

    except Exception as e:
        raise  HTTPException(status_code=404, detail=str(e))

@router.get("/querySentences")
async def query_sentences(article: str, page: int):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)


        query = '''SELECT * FROM t_sequence WHERE article='%s' AND page='%s' ''' % (article, page)
        sequence_df = _db.df_query_sql(query)
        seq_list = []
        for i, row in sequence_df.iterrows():
            seq_list.append({
                "sequence": row.get("sequence"),
                "x0": row.get("x0"),
                "y0": row.get("y0"),
                "x1": row.get("x1"),
                "y1": row.get("y1"),
                "article": row.get("article"),
                "page": row.get("page"),
            })
        return seq_list

    except Exception as e:
        raise  HTTPException(status_code=404, detail=str(e))


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
        raise HTTPException(status_code=404, detail=str(e))

