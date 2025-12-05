from python.api.utils.logger import LOGGER
from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
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

class NodeType(BaseModel):
    name: str
    color: str

class UpdateNodeType(BaseModel):
    name: str
    color: str
    new_name: str
    new_color: str

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
        query = '''SELECT * FROM t_node WHERE node_name='%s' ''' % node.name
        exist = _db.df_query_sql(query)
        query = '''INSERT INTO t_node (node_name, node_label, source, article, create_time) VALUES (%s, %s, %s, %s, %s)'''
        _db.create_one(query, (node.name, node.label, node.source, node.article, datetime.now()))

        if len(exist) == 0: #如果是全新的节点，在图数据库中添加节点
            _gdb.create_node(node.label, node.name)

    except Exception as e:
        return e

@router.post("/getgraph")
async def get_graph():
    """
        获取知识图谱
        :return: Graph
    """
    _gdb = Neo4jHelper(Graph_Config().host,
                       Graph_Config().user,
                       Graph_Config().password,
                       Graph_Config().databasename,
                       Graph_Config().port)

    #获取所有节点
    all_nodes = _gdb.query_all_nodes()

    #获取所有关系
    all_predicate = _gdb.query_all_predicate()

    res = {
        "nodes": all_nodes,
        "predicate": all_predicate
    }

    return res

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
        query = '''INSERT INTO t_user (node_name, node_label, source, article, create_time) VALUES (%s, %s, %s, %s, %s)'''
        _db.create_one(query, (n.name, n.label, n.new_source, n.new_article, datetime.now()))
    except Exception as e:
        return e

@router.get("/getAllNodeType")
async def get_all_node_type():
    try:
        query = '''
            SELECT * FROM t_node_type
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        nodes_infos = _db.df_query_sql(query)
        node_items = []
        for i, row in nodes_infos.iterrows():
            node_items.append({
                "id": row.get("node_type_id"),
                "name": row.get("node_type_name"),
                "color": row.get("node_type_color")
            })

        return node_items

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/getNodeType")
async def get_all_node_type(node_type_name: str):
    try:
        query = '''
            SELECT * FROM t_node_type WHERE node_type_name='%s'
        ''' % node_type_name
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        nodes_infos = _db.df_query_sql(query)
        node_items = []
        for i, row in nodes_infos.iterrows():
            node_items.append({
                "name": row.get("node_type_name"),
                "color": row.get("node_type_color")
            })

        return node_items

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/addNodeType")
async def add_node_type(node_type: NodeType):
    try:
        query = '''INSERT INTO t_node_type (node_type_name, node_type_color) VALUES (%s, %s)'''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.create_one(query, (node_type.name, node_type.color))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/updateNodeType")
async def update_node_type(node_type: UpdateNodeType):
    try:
        query = '''
            UPDATE t_node_type SET node_type_name='%s' AND node_type_color='%s' WHERE node_type_name='%s'
        ''' % node_type.new_name, node_type.new_color, node_type.name
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.updateById(query, (node_type.name))
        query = '''
            UPDATE t_node SET node_label='%s' WHERE node_label='%s'
        '''
        _db.updateById(query, (node_type.name))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/deleteNodeType")
async def delete_node_type(node_type: NodeType):
    try:
        query = '''
            DELETE FROM t_node_type WHERE node_type_name='%s'
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.delete_one(query, (node_type.name, node_type.color))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))