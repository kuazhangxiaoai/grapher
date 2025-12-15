from altair import sequence
from dominate.tags import article

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
    id: int
    name: str
    color: str


class Commity(BaseModel):
    sequence: str
    nodes: List[Node]
    edges: List[Edge]

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
            exist_db = _db.df_query_sql(query)

            if len(exist_db) == 0:  # 如果是全新的节点，在图数据库中添加节点
                _gdb.create_node(nodes[i].label, nodes[i].name)

            query = '''SELECT * FROM t_node WHERE node_name='%s' AND sequence='%s' ''' % (nodes[i].name, nodes[i].sequence)
            exist_db = _db.df_query_sql(query)
            if len(exist_db) ==0:
                _db.create_one(
                    '''INSERT INTO t_node (node_name, node_label, sequence, article, create_time) VALUES (%s, %s, %s, %s, %s)''',
                    (nodes[i].name, nodes[i].label, nodes[i].sequence, nodes[i].article, datetime.now()))
    except Exception as e:
        return e

@router.get("/getNodesFromSeq")
async def get_nodes(sequence: str):
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
        query = '''SELECT * FROM t_node WHERE sequence='%s' ''' % (sequence)
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                nodes.append({
                    "name": row.get("node_name"),
                    "label": row.get("node_label"),
                    "sequence": row.get("sequence"),
                    "article": row.get("article"),
                    "create_time": row.get("create_time")
                })
                node_names.append(row.get("node_name"))
        return nodes

    except Exception as e:
        return e

@router.get("/getGraphFromSeq")
async def get_graph_by_seq(sequence: str):
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
        query = '''SELECT * FROM t_node WHERE sequence='%s' ''' % (sequence)
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' ''' % node_label
                color_df = _db.df_query_sql(query)
                nodes.append({
                    "name": row.get("node_name"),
                    "label": row.get("node_label"),
                    "sequence": row.get("sequence"),
                    "article": row.get("article"),
                    "create_time": row.get("create_time"),
                    "color": color_df.loc[0, "node_type_color"]
                })
                node_names.append(row.get("node_name"))

        query = '''SELECT * FROM t_predicate WHERE sequence='%s' ''' % sequence
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            if row.get("predicate_name") not in edge_names:
                edges.append({
                    "name": row.get("predicate_name"),
                    "sequence": row.get("sequence"),
                    "from_node_name": row.get("from_node_name"),
                    "from_node_label": row.get("from_node_label"),
                    "to_node_name": row.get("to_node_name"),
                    "to_node_label": row.get("to_node_label"),
                    "create_time": row.get("create_time")
                })
                edge_names.append(row.get("predicate_name"))
        graph = {
            "sequence": sequence,
            "nodes": nodes,
            "edges": edges
        }
        return graph

    except Exception as e:
        return e

@router.get("/getGraphFromArticle")
async def get_graph_from_article(article: str):
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
        query = '''SELECT * FROM t_node WHERE article='%s' ''' % (article)
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' ''' % node_label
                color_df = _db.df_query_sql(query)
                nodes.append({
                    "name": row.get("node_name"),
                    "label": row.get("node_label"),
                    "sequence": row.get("sequence"),
                    "article": row.get("article"),
                    "create_time": row.get("create_time"),
                    "color": color_df.loc[0, "node_type_color"]
                })
                node_names.append(row.get("node_name"))

        query = '''SELECT * FROM t_predicate WHERE article='%s' ''' % article
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            #if row.get("predicate_name") not in edge_names:
            edges.append({
                "name": row.get("predicate_name"),
                "sequence": row.get("sequence"),
                "from_node_name": row.get("from_node_name"),
                "from_node_label": row.get("from_node_label"),
                "to_node_name": row.get("to_node_name"),
                "to_node_label": row.get("to_node_label"),
                "create_time": row.get("create_time")
            })
            #edge_names.append(row.get("predicate_name"))
        graph = {
            "article": article,
            "nodes": nodes,
            "edges": edges
        }
        return graph
    except Exception as e:
        return e

@router.get("/getAllNodes")
async def get_all_nodes():
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
        query = "SELECT DISTINCT node_name, node_label, sequence, article, create_time FROM t_node"
        nodes_df = _db.df_query_sql(query)
        nodes = []
        for i, row in nodes_df.iterrows():
            nodes.append({
                "name": row.get("node_name"),
                "label": row.get("node_label"),
                "sequence": row.get("sequence"),
                "article": row.get("article"),
                "create_time": row.get("create_time")
            })
        return nodes

    except Exception as e:
        return e

@router.get("/getGlobalGraph")
async def get_global_graph():
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
        query = "SELECT * FROM t_node"
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' ''' % node_label
                color_df = _db.df_query_sql(query)
                nodes.append({
                    "name": row.get("node_name"),
                    "label": row.get("node_label"),
                    "sequence": row.get("sequence"),
                    "article": row.get("article"),
                    "create_time": row.get("create_time"),
                    "color": color_df.loc[0, "node_type_color"]
                })
                node_names.append(row.get("node_name"))

        query = "SELECT * FROM t_predicate"
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            if row.get("predicate_name") not in edge_names:
                edges.append({
                    "name": row.get("predicate_name"),
                    "sequence": row.get("sequence"),
                    "from_node_name": row.get("from_node_name"),
                    "from_node_label": row.get("from_node_label"),
                    "to_node_name": row.get("to_node_name"),
                    "to_node_label": row.get("to_node_label"),
                    "create_time": row.get("create_time")
                })
                edge_names.append(row.get("predicate_name"))
        graph = {
            "article": article,
            "nodes": nodes,
            "edges": edges
        }
        return graph
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

@router.post("/createEdges")
async def create_edges(edges: List[Edge]):
    """
                新增边类(同时为graph db和 postgre db 添加数据)
                :param edges: 多边类
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

        for i in range(len(edges)):
            query = '''SELECT * FROM t_predicate WHERE predicate_name='%s' AND from_node='%s' AND to_node='%s' ''' % (edges[i].name, edges[i].from_node_name, edges[i].to_node_name)
            exist = _db.df_query_sql(query)
            query = '''INSERT INTO t_predicate (predicate_name, sequence, from_node, to_node, article, create_time) VALUES (%s, %s, %s, %s, %s, %s)'''
            _db.create_one(query, (edges[i].name, edges[i].sequence, edges[i].from_node_name, edges[i].to_node_name, edges[i].article, datetime.now()))

            if len(exist) == 0:  # 如果是全新的节点，在图数据库中添边
                _gdb.create_edge(edges[i].name, edges[i].from_node_name, edges[i].from_node_label, edges[i].to_node_name, edges[i].to_node_label)

    except Exception as e:
        return e

@router.get("getEdgesFromSeq")
async def get_edges(sequence: str):
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
        query = '''SELECT * FROM t_predicate WHERE sequence='%s' ''' % sequence
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            if row.get("predicate_name") not in edge_names:
                edges.append({
                    "name": row.get("predicate_name"),
                    "sequence": row.get("sequence"),
                    "from_node_name": row.get("from_node_name"),
                    "from_node_label": row.get("from_node_label"),
                    "to_node_name": row.get("to_node_name"),
                    "to_node_label": row.get("to_node_label"),
                    "create_time": row.get("create_time")
                })
                edges.append(row.get("predicate_name"))
        return edges

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
            UPDATE t_node SET node_label='%s' WHERE node_type='%s'
        '''
        _db.updateById(query, (node_type.id))
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

@router.post("/commit")
async def commit(commit: Commity):
    try:
        sequence = commit.sequence
        nodes = commit.nodes
        edges = commit.edges

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
        #处理删除节点
        node_names = [node.name for node in nodes]
        exsisted_nodes_df = _db.df_query_sql('''SELECT * FROM t_node WHERE sequence='%s' ''' % (sequence))
        for i, row in exsisted_nodes_df.iterrows():
            if (row.get("node_name") not in node_names): #需要删除节点
                n, l = row.get("node_name"), row.get("node_label")
                _db.delete_one('''DELETE FROM t_node WHERE node_name='%s' AND sequence='%s' ''' % (row.get("node_name"), sequence))
                existed = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' ''' % (row.get("node_name")))
                if len(existed) == 0:
                    _gdb.delete_node(l, n)

        #处理新增节点
        for i, node in enumerate(nodes):
            exsisted_nodes_context_df = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' ''' % (node.name))
            exsisted_nodes_seq_df = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' AND sequence='%s' ''' % (node.name, sequence))
            if len(exsisted_nodes_context_df) == 0: #全文没有该节点
                _gdb.create_node(nodes[i].label, nodes[i].name)
            if len(exsisted_nodes_seq_df) == 0: #语句没有该节点
                _db.create_one(
                    '''INSERT INTO t_node (node_name, node_label, sequence, article, create_time) VALUES (%s, %s, %s, %s, %s)''',
                    (nodes[i].name, nodes[i].label, nodes[i].sequence, nodes[i].article, datetime.now()))

        #处理删除边
        posted_edge = []
        for edge in edges:
            posted_edge.append({
                "name": edge.name,
                "from": edge.from_node_name,
                "to": edge.to_node_name
            })

        existed_edges_df = _db.df_query_sql('''SELECT * FROM t_predicate WHERE sequence='%s' ''' % (sequence))
        for i, row in existed_edges_df.iterrows():
            existed_edge = {
                "name": row.get("predicate_name"),
                "from": row.get("from_node_name"),
                "to": row.get("to_node_name")
            }
            if (existed_edge not in posted_edge):
                name = row.get("predicate_name")
                fnn = row.get("from_node_name")
                fnl = row.get("from_node_label")
                tnn = row.get("to_node_name")
                tnl = row.get("to_node_label")
                _db.delete_one(
                    '''DELETE FROM t_predicate WHERE predicate_name='%s' AND sequence='%s' AND from_node_name='%s' AND to_node_name='%s' ''' % (name, sequence, fnn, tnn))
                _gdb.delete_edge(name, fnn, fnl, tnn, tnl)

        #处理添加边
        for i, edge in enumerate(edges):
            name = edge.name
            fnn = edge.from_node_name
            fnl = edge.from_node_label
            tnn = edge.to_node_name
            tnl = edge.to_node_label

            existed_edges_context_df = _db.df_query_sql(
                '''SELECT * FROM t_predicate WHERE predicate_name='%s' AND from_node_name='%s' AND to_node_name='%s' ''' % (name, fnn, tnn))

            if len(existed_edges_context_df) == 0:
                _gdb.create_edge(name, fnn, fnl, tnn, tnl)

            existed_edges_seq_df = _db.df_query_sql('''SELECT * FROM t_predicate WHERE predicate_name='%s' AND sequence='%s' AND from_node_name='%s' AND to_node_name='%s' ''' % (name, sequence, fnn, tnn))
            if len(existed_edges_seq_df) == 0:
                query = '''INSERT INTO t_predicate (predicate_name, sequence, from_node_name, from_node_label, to_node_name, to_node_label, article, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)'''
                _db.create_one(query,
                               (edge.name, edge.sequence, edge.from_node_name, edge.from_node_label, edge.to_node_name, edge.to_node_label, edge.article, datetime.now()))

    except Exception as e:
        return e