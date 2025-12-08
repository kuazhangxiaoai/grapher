from python.api.utils.logger import LOGGER
from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel
from  datetime import datetime
router = APIRouter()

class Node(BaseModel):
    """
        节点类
    """
    name: str
    label: str
    sequence: str
    article: str


class Edge(BaseModel):
    """
        边类
        :param:
    """
    name: str
    from_node_label: str
    from_node_name: str
    to_node_label: str
    to_node_name: str
    sequence: str
    article: str

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

@router.post("/createNode")
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
        query = '''INSERT INTO t_node (node_name, node_label, sequence, article, create_time) VALUES (%s, %s, %s, %s, %s)'''
        _db.create_one(query, (node.name, node.label, node.sequence, node.article, datetime.now()))

        if len(exist) == 0: #如果是全新的节点，在图数据库中添加节点
            _gdb.create_node(node.label, node.name)

    except Exception as e:
        return e

@router.post("/createNodes")
async def create_nodes(nodes: List[Node]):
    """
        批量新增节点(同时为graph db和 postgre db 添加数据)
        :param nodes List[Node]: 节点类
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

        for i in range(len(nodes)):
            query = '''SELECT * FROM t_node WHERE node_name='%s' ''' % nodes[i].name
            exist = _db.df_query_sql(query)
            query = '''INSERT INTO t_node (node_name, node_label, sequence, article, create_time) VALUES (%s, %s, %s, %s, %s)'''
            _db.create_one(query, (nodes[i].name, nodes[i].label, nodes[i].sequence, nodes[i].article, datetime.now()))

            if len(exist) == 0:  # 如果是全新的节点，在图数据库中添加节点
                _gdb.create_node(nodes[i].label, nodes[i].name)
    except Exception as e:
        return e

@router.post("/createEdge")
async def create_edge(edge: Edge):
    """
            新增边类(同时为graph db和 postgre db 添加数据)
            :param edge: 边类
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
        query = '''SELECT * FROM t_predicate WHERE predicate_name='%s AND from_node='%s' AND to_node='%s' ''' % edge.name, edge.from_node, edge.to_node
        exist = _db.df_query_sql(query)
        query = '''INSERT INTO t_predicate (predicate_name, sequence, from_node, to_node, article, create_time) VALUES (%s, %s, %s, %s, %s, %s)'''
        _db.create_one(query, (edge.name, edge.sequence, edge.from_node, edge.to_node, edge.article, datetime.now()))

        if len(exist) == 0:  # 如果是全新的节点，在图数据库中添边
            _gdb.create_edge(edge.name, edge.from_node_name, edge.from_node_label, edge.to_node_name, edge.to_node_label)

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