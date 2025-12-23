from datetime import datetime

from aiohttp.abc import HTTPException

from python.api.utils.logger import LOGGER
from python.api.config.db_config import key
from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper
from python.api.utils.general import get_project_info
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
router = APIRouter()

class User(BaseModel):
    username: str
    password: str

class Project(BaseModel):
    id: int
    project_name: str
    username: str
    graph_db: str
    descript: str


@router.get("/test")
async def test():
    return "hello"

@router.post("/login")
async def login(user: User):
    query = '''
        SELECT * FROM t_user WHERE username='%s' AND pgp_sym_decrypt(password::bytea, '%s')='%s'
    ''' % (user.username, key, user.password)

    _db = PostgreHelper(DB_Config().host,
                        DB_Config().user,
                        DB_Config().password,
                        DB_Config().databasename,
                        DB_Config().port)
    ok = _db.df_query_sql(query)
    if len(ok) == 1:
        return True
    else:
        return False

@router.post("/regist")
async def regist(user:User):
    try:
        query = '''
            INSERT INTO t_user (id, username, password) VALUES ('%s', '%s', pgp_sym_encrypt('%s', '%s'))
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.create_one(query, (uuid.uuid4(), user.username, user.password, key))
        return True
    except Exception as e:
        return e

@router.post("/createProject")
async def create_project(project: Project):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)

        query = '''
            SELECT * FROM t_graph_db WHERE project_name='%s'
        ''' % project.project_name
        proj_df = _db.df_query_sql(query)
        assert len(proj_df) == 0

        query = '''
            SELECT * FROM t_graph_db WHERE graph_db_name='%s'
        ''' % project.graph_db
        graph_df = _db.df_query_sql(query)
        assert len(graph_df) == 1
        assert graph_df.loc[0, 'project_name'] == None

        query = '''
            INSERT INTO t_project (project_name, username, graph_db, descript, create_time) VALUES (%s, %s, %s, %s, %s)
        '''
        _db.create_one(query, (project.project_name, project.username, project.graph_db, project.descript, datetime.now()))

        project_id_df = _db.df_query_sql('''SELECT project_id FROM t_project WHERE project_name='%s' ''' % project.project_name)
        project_id = project_id_df.loc[0, 'project_id'].item()
        # 分配图数据库
        query = '''
            UPDATE t_graph_db SET project_name=%s, project_id=%s WHERE graph_db_name=%s
        '''
        _db.updateById(query, (project.project_name, project_id, project.graph_db))

    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/getProjectList")
async def get_project_list(username: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        project_df = _db.df_query_sql('''SELECT * FROM t_project WHERE username='%s' ''' % username)
        project_list = []
        for i, row in project_df.iterrows():
            project_list.append({
                "id": row.get("project_id"),
                "project_name": row.get("project_name"),
                "username": row.get("username"),
                "graph_db": row.get("graph_db"),
                "descript": row.get("descript"),
                "create_time": str(row.get("create_time"))
            })
        return project_list

    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/getGraphDBUsrInfo")
async def get_graph_db_use_info(graph_db: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''
            SELECT * FROM t_graph_db WHERE graph_db_name='%s'
        ''' % graph_db
        graph_df = _db.df_query_sql(query)
        if len(graph_df) == 0:
            return {"exist": False, "available": False, "project": None}
        elif len(graph_df) == 1:
            proj = graph_df.loc[0, 'project_name'].item()
            if proj is None:
                return {"exist": True, "available": False, "project": proj}
            else:
                return {"exist": True, "available": True, "project": None}

    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/getAvailGraphDB")
async def get_available_graph_db():
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''
            SELECT * FROM t_graph_db WHERE project_name ISNULL
        '''
        graph_df = _db.df_query_sql(query)
        avail_graph_db_list = []
        for i, row in graph_df.iterrows():
            avail_graph_db_list.append(row.get("graph_db_name"))

        return avail_graph_db_list

    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.post("/deleteProject")
async def delete_project(project: Project):
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project.project_name)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )
        #删除图数据库内的内容
        # _gdb.clear()

        #删除对应项目的所有节点, 关系, 标记， 文章
        _db.delete_one('''DELETE FROM t_node WHERE project_name='%s' ''' % project.project_name)
        _db.delete_one('''DELETE FROM t_predicate WHERE project_name='%s' ''' % project.project_name)
        _db.delete_one('''DELETE FROM t_node_type WHERE project_name='%s' ''' % project.project_name)
        _db.delete_one('''DELETE FROM t_article WHERE project_name='%s' ''' % project.project_name)
        _db.delete_one('''DELETE FROM t_sequence WHERE project_name='%s' ''' % project.project_name)

        query = '''
                    DELETE FROM t_project WHERE project_name='%s'
                ''' % project.project_name
        _db.delete_one(query)
        query = '''
                    UPDATE t_graph_db SET project_name=NULL, project_id=NULL WHERE project_name=%s
                '''
        _db.updateById(query, (project.project_name,))

        return 'OK'
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.post("/updateProject")
async def update_project(project: Project):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        # 修改对应项目的所有节点, 关系, 标记， 文章
        _db.updateById('''UPDATE t_node SET project_name=%s WHERE project_id=%s ''',  (project.project_name, project.id))
        _db.updateById('''UPDATE t_predicate SET project_name=%s WHERE project_id=%s ''' , (project.project_name, project.id))
        _db.updateById('''UPDATE t_node_type SET project_name=%s WHERE project_id=%s ''' , (project.project_name, project.id))
        _db.updateById('''UPDATE t_article SET project_name=%s WHERE project_id=%s ''' , (project.project_name, project.id))
        _db.updateById('''UPDATE t_sequence SET project_name=%s WHERE project_id=%s ''' , (project.project_name, project.id))
        _db.updateById('''UPDATE t_project SET project_name=%s WHERE project_id=%s ''',(project.project_name, project.id))
        _db.updateById('''UPDATE t_graph_db SET project_name=%s WHERE project_id=%s ''',(project.project_name, project.id))

        return 'OK'

    except Exception as e:
        raise HTTPException(500, detail=str(e))

