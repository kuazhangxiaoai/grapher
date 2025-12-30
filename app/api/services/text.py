import shutil
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from datetime import datetime

from pydantic import BaseModel
from typing import List

from app.api.config.db_config import DB_Config
from app.api.config.graph_config import Graph_Config
from app.api.db.postgre_helper import PostgreHelper
from app.api.db.neo4j_helper import Neo4jHelper
from app.api.utils.general import get_project_info

UploadDir = Path("/usr/assets")
# UploadDir = Path("D:/workspace/grapher/static")
UploadDir.mkdir(exist_ok=True)
router = APIRouter()

class FileUpload(BaseModel):
    title: str
    publishtime: str
    filename: str
    project: str

class Sentence(BaseModel):
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    article: str
    page: int
    project: str

class Article(BaseModel):
    title: str
    project: str

@router.get("/test")
async def test():
    return "hello"

@router.get("/getPDFPreviewUrl")
async def getPDFPreviewUrl(title: str, project: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT filename FROM t_article WHERE title='%s' AND project_name='%s' ''' % (title, project)
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
        query = '''SELECT title FROM t_article WHERE title='%s' AND project_name='%s' ''' % (fileUpload.title, fileUpload.project)
        exist = _db.df_query_sql(query)
        assert len(exist) == 0, "The file is already exist."
        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % fileUpload.project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()

        query = '''INSERT INTO t_article (title, create_time, publish_time, filename, project_name, project_id) VALUES (%s, %s, %s, %s, %s, %s)'''
        _db.create_one(
            query,
            (
                fileUpload.title,
                datetime.now(),
                datetime.strptime(fileUpload.publishtime, "%Y-%m-%d"),
                fileUpload.filename,
                fileUpload.project,
                project_id
            )
        )
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

#将文件上传至后端
@router.post("/uploadfile")
async def uploadfile(file: UploadFile=File(...)):
    #filename = os.path.basename(file.filename)
    #filename = re.sub(r'[\\/:*?"<>|]', '_', filename)
    filename = file.filename
    savepath = UploadDir / filename
    os.remove(savepath) if os.path.exists(savepath) else None
    with open(savepath, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = {"message": 'OK', 'url': f"/assets/{filename}"}
    return JSONResponse(content=data, status_code=200)

@router.post("/uploadSentence")
async def write_sentence(sentence: Sentence):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % sentence.project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()
        query = '''INSERT INTO t_sequence (sequence, x0, y0, x1, y1, article, page, project_name, project_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'''
        _db.create_one(query,
                       (sentence.text,
                        sentence.x0,
                        sentence.y0,
                        sentence.x1,
                        sentence.y1,
                        sentence.article,
                        sentence.page,
                        sentence.project,
                        project_id))
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
        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % sentences[0].project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()

        for i in range(len(sentences)):
            query = ('''SELECT * FROM t_sequence WHERE sequence='%s' AND x0=%s AND y0=%s AND x1=%s AND y1=%s AND article='%s' AND page=%s''' %
                     (sentences[i].text,
                      int(sentences[i].x0),
                      int(sentences[i].y0),
                      int(sentences[i].x1),
                      int(sentences[i].y1),
                      sentences[i].article,
                      sentences[i].page))
            existed = _db.df_query_sql(query)
            if len(existed) == 0:
                query = '''INSERT INTO t_sequence (sequence, x0, y0, x1, y1, article, page, project_name, project_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'''
                _db.create_one(query,
                               (sentences[i].text,
                                int(sentences[i].x0),
                                int(sentences[i].y0),
                                int(sentences[i].x1),
                                int(sentences[i].y1),
                                sentences[i].article,
                                sentences[i].page,
                                sentences[i].project,
                                project_id))

    except Exception as e:
        raise  HTTPException(status_code=404, detail=str(e))

@router.get("/querySentences")
async def query_sentences(article: str, page: int, project: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)


        query = '''SELECT * FROM t_sequence WHERE article='%s' AND page='%s' AND project_name='%s' ''' % (article, page, project)
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
async def get_article_titles(project: str):
    try:
        query = '''
            SELECT title, publish_time FROM t_article WHERE project_name='%s'
        ''' % project
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

@router.get("/getSequenceByNode")
async def get_seq_by_node(name: str, project: str):
    try:
        query = '''
            SELECT node_name, node_label, sequence, article FROM t_node WHERE node_name='%s' AND project_name='%s'
        ''' % (name, project)
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        seq_df = _db.df_query_sql(query)
        node_names, node_labels, seq_list, article_list = [], [], [], []
        for i, row in seq_df.iterrows():
            node_names.append(row.get("node_name"))
            node_labels.append(row.get("node_label"))
            seq_list.append(row.get("sequence"))
            article_list.append(row.get("article"))
        res = {
            "node_names": node_names,
            "node_labels": node_labels,
            "sequences": seq_list,
            "articles": article_list
        }

        return res

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deleteArticle")
async def delete_article(article: Article):
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(article.project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )
        query = '''
                    SELECT * FROM t_node WHERE article='%s AND project_name=%s'
                ''' % (article.title, article.project)

        nodes_df = _db.df_query_sql(query)
        nodes = []
        for i, row in nodes_df.iterrows():
            nodes.append({"name": row.get("node_name"), "label": row.get("node_label")})

        query = '''
                    DELETE FROM t_node WHERE article='%s' AND project_name='%s'
                ''' % (article.title, article.project)
        _db.delete_one(query)

        query = '''
                    DELETE FROM t_predicate WHERE article='%s' AND project_name='%s' 
                ''' % (article.title, article.project)
        _db.delete_one(query)

        query = '''
                    DELETE FROM t_sequence WHERE article='%s' AND project_name='%s' 
                ''' % (article.title, article.project)
        _db.delete_one(query)

        query = '''
                    DELETE FROM t_article WHERE title='%s' AND project_name='%s'
                ''' % (article.title, article.project)
        _db.delete_one(query)

        for node in nodes:
            query = ''' SELECT * FROM t_node WHERE project_name=%s' ''' % (article.project)
            _df = _db.df_query_sql(query)
            if(len(_df) == 0):
                _gdb.delete_node(node["label"], node["name"])

        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deleteSequence")
async def delete_sequence(sequence: Sentence):
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(sequence.project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )
        query = '''
                    SELECT * FROM t_node WHERE sequence='%s' AND article='%s' AND project_name='%s'
                ''' % (sequence.text, sequence.article, sequence.project)

        nodes_df = _db.df_query_sql(query)
        nodes = []
        for i, row in nodes_df.iterrows():
            nodes.append({"name": row.get("node_name"), "label": row.get("node_label")})

        query = '''
                    DELETE FROM t_node WHERE sequence='%s' AND article='%s' AND project_name='%s'
                ''' % (sequence.text, sequence.article, sequence.project)
        _db.delete_one(query)

        query = '''
                    DELETE FROM t_predicate WHERE sequence='%s' AND article='%s' AND project_name='%s' 
                ''' % (sequence.text, sequence.article, sequence.project)

        _db.delete_one(query)

        query = '''
                    DELETE FROM t_sequence WHERE sequence='%s' AND article='%s' AND project_name='%s' 
                ''' % (sequence.text, sequence.article, sequence.project)
        _db.delete_one(query)

        for node in nodes:
            query = ''' SELECT * FROM t_node WHERE project_name='%s' ''' % (sequence.project)
            _df = _db.df_query_sql(query)
            if(len(_df) == 0):
                _gdb.delete_node(node["label"], node["name"])

        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))