from python.api.utils.logger import LOGGER
from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper
from fastapi import APIRouter
from pydantic import BaseModel
from  datetime import datetime
router = APIRouter()

class Node(BaseModel):
    """
        节点类
    """
    name: str
    label: str
    source: str
    article: str

class AddSourceToNode(BaseModel):
    """
        新增源节点类
    """
    name: str
    label: str
    new_source: str
    new_article: str


@router.get("/test")
async def test():
    return "hello"

@router.post("/createnode")
async def create_node(node: Node):
    """
    新增节点(同时为graph db和 postgre db 添加数据)
    :param node: 节点类
    :return: None
    """
    try:
        _gdb = Neo4jHelper(Graph_Config().host,
                           Graph_Config().user,
                           Graph_Config().password,
                           Graph_Config().databasename,
                           Graph_Config().port)

        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''INSERT INTO t_user (node_name, node_label, source, article, create_time) VALUES ('%s', '%s', '%s', '%s', '%s')'''
        _gdb.create_node(node.label, node.name)
        _db.create_one(query, (node.name, node.label, node.source, node.article, datetime.now()))

    except Exception as e:
        return e

@router.post("/addsourcetonode")
async def add_source_to_node(n:AddSourceToNode):
    """
    为已存在节点添加源语句和源文章
    :param n: 新增源节点类
    :return: None
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''INSERT INTO t_user (node_name, node_label, source, article, create_time) VALUES ('%s', '%s', '%s', '%s', '%s')'''
        _db.create_one(query, (n.name, n.label, n.new_source, n.new_article, datetime.now()))
    except Exception as e:
        return e