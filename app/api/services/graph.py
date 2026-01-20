from idlelib.query import Query

from app.api.utils.logger import LOGGER
from app.api.config.db_config import DB_Config
from app.api.config.graph_config import Graph_Config
from app.api.db.postgre_helper import PostgreHelper
from app.api.db.neo4j_helper import Neo4jHelper
from app.api.utils.general import get_project_info
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel, Field
from  datetime import datetime

router = APIRouter()

class Node(BaseModel):
    """
        节点类
    """
    name: str= Field(..., description="节点名称")
    label: str = Field(..., description="节点标签")
    sequence: str = Field(..., description="语句")
    article: str = Field(..., description="文章标题")
    project: str = Field(..., description="项目名称")

class Edge(BaseModel):
    """
        边类
    """
    name: str = Field(..., description="关系名称")
    from_node_label: str = Field(..., description="源节点标签")
    from_node_name: str = Field(..., description="源节点名称")
    to_node_label: str = Field(..., description="目的节点标签")
    to_node_name: str = Field(..., description="目的节点标签")
    sequence: str = Field(..., description="语句")
    article: str = Field(..., description="文章标题")
    project: str = Field(..., description="项目名称")

class NodeType(BaseModel):
    """
        节点类型类
    """
    name: str = Field(..., description="节点类型名称")
    color: str = Field(..., description="节点类型颜色")
    project: str = Field(..., description="项目名称")

class Commity(BaseModel):
    """
        提交类
    """
    sequence: str = Field(..., description="语句")
    nodes: List[Node] = Field(..., description="节点列表")
    edges: List[Edge] = Field(..., description="关系列表")


@router.get("/getGraphFromSeq")
async def get_graph_by_seq(sequence: str=Query(..., description="语句"), project: str=Query(..., description="项目名称")):
    """
        获取语句对应的图谱
    """
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )

        query = '''SELECT * FROM t_node WHERE sequence='%s' AND project_name='%s' ''' % (sequence, project)
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' AND project_name='%s' ''' % (node_label, project)
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

        query = '''SELECT * FROM t_predicate WHERE sequence='%s' AND project_name='%s' ''' % (sequence, project)
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            edges.append({
                "name": row.get("predicate_name"),
                "sequence": row.get("sequence"),
                "from_node_name": row.get("from_node_name"),
                "from_node_label": row.get("from_node_label"),
                "to_node_name": row.get("to_node_name"),
                "to_node_label": row.get("to_node_label"),
                "create_time": row.get("create_time")
            })

        graph = {
            "sequence": sequence,
            "nodes": nodes,
            "edges": edges
        }
        return graph

    except Exception as e:
        return e

@router.get("/getGraphFromArticle")
async def get_graph_from_article(article: str=Query(..., description="文章标题"), project: str=Query(...,description="项目名称")):
    """
        获取文章对应的图谱
    """
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )

        query = '''SELECT * FROM t_node WHERE article='%s' AND project_name='%s' ''' % (article, project)
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' AND project_name='%s' ''' % (node_label, project)
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

        query = '''SELECT * FROM t_predicate WHERE article='%s' AND project_name='%s' ''' % (article, project)
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            edges.append({
                "name": row.get("predicate_name"),
                "sequence": row.get("sequence"),
                "from_node_name": row.get("from_node_name"),
                "from_node_label": row.get("from_node_label"),
                "to_node_name": row.get("to_node_name"),
                "to_node_label": row.get("to_node_label"),
                "create_time": row.get("create_time")
            })

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
    """
        获取全部节点
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
async def get_global_graph(project: str=Query(...,description="项目名称")):
    """
        获取项目的全局图谱
    """
    try:
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )

        query = '''SELECT * FROM t_node WHERE project_name='%s' ''' % project
        nodes_df = _db.df_query_sql(query)
        nodes = []
        node_names = []
        for i, row in nodes_df.iterrows():
            if row.get("node_name") not in node_names:
                node_name, node_label = row.get("node_name"), row.get("node_label")
                query = '''SELECT node_type_color FROM t_node_type WHERE node_type_name='%s' AND project_name='%s' ''' % (node_label, project)
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

        query = '''SELECT * FROM t_predicate WHERE project_name='%s' ''' % project
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            edges.append({
                "name": row.get("predicate_name"),
                "sequence": row.get("sequence"),
                "from_node_name": row.get("from_node_name"),
                "from_node_label": row.get("from_node_label"),
                "to_node_name": row.get("to_node_name"),
                "to_node_label": row.get("to_node_label"),
                "create_time": row.get("create_time")
            })

        graph = {
            "nodes": nodes,
            "edges": edges
        }
        return graph
    except Exception as e:
        raise HTTPException(500, detail=str(e))
        return e


@router.get("/getAllNodeType")
async def get_all_node_type():
    """
        获取全部节点类型
    """
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

@router.get("/getNodeTypeByProject")
async def get_node_type_by_project(project: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''
                    SELECT * FROM t_node_type WHERE project_name='%s'
                ''' % project
        node_type_df = _db.df_query_sql(query)
        node_types = []
        for i, row in node_type_df.iterrows():
            node_types.append({
                "id": row.get("node_type_id"),
                "name": row.get("node_type_name"),
                "color": row.get("node_type_color")
            })
        return node_types

    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/getNodeType")
async def get_node_type(node_type_name: str=Query(...,description="节点类型名称"), project: str=Query(...,description="项目名称")):
    """
        获取节点信息
    """
    try:
        query = '''
            SELECT * FROM t_node_type WHERE node_type_name='%s' AND project_name='%s'
        ''' % (node_type_name, project)
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
    """
        添加节点类型
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % node_type.project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()
        query = '''INSERT INTO t_node_type (node_type_name, node_type_color, project_name, project_id) VALUES (%s, %s, %s, %s)'''
        _db.create_one(query, (node_type.name, node_type.color, node_type.project, project_id))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/updateNodeType")
async def update_node_type(node_type: NodeType):
    """
        更新节点类型
    """
    try:
        query = '''
            UPDATE t_node_type SET node_type_color=%s WHERE project_name=%s AND node_type_name=%s
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.updateById(query, (node_type.color, node_type.project, node_type.name))
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deleteNodeType")
async def delete_node_type(node_type: NodeType):
    """
        删除节点类型
    """
    try:
        #检验该节点是否存在，若存在，则不允许删除
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''
            SELECT * FROM t_node WHERE node_label='%s'
        ''' % node_type.name
        exist = _db.df_query_sql(query)
        if len(exist) > 0:
            raise HTTPException(status_code=500, detail="Failed to delete nodel type")
        query = '''
            DELETE FROM t_node_type WHERE node_type_name='%s' AND project_name='%s'
        '''% (node_type.name, node_type.project)

        _db.delete_one(query)
        return JSONResponse(content={"message": "success"}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/commit")
async def commit(commit: Commity):
    """
        提交
    """
    try:
        sequence = commit.sequence
        nodes = commit.nodes
        edges = commit.edges

        project = nodes[0].project

        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project)
        graph_db_config.load(host, port, username, password, graph_db)
        _gdb = Neo4jHelper(
            host=graph_db_config.host,
            user=graph_db_config.user,
            passwd=graph_db_config.password,
            database=graph_db_config.databasename,
            port=graph_db_config.port
        )

        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()
        node_names = [node.name for node in nodes]
        #检查节点数据
        for i, node_name in enumerate(node_names):
            #已存在节点
            node_df = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' AND project_name='%s' ''' % (node_name, project))
            node_label = nodes[i].label #提交的节点的label
            if len(node_df) > 0:
                for i, row in node_df.iterrows():
                    if row.get("node_label") != node_label: #目前不允许修改节点类型, 只能一个个删除后，重新添加
                        raise HTTPException(500, detail='node type error: ' + node_name)

        #处理删除节点
        exsisted_nodes_df = _db.df_query_sql('''SELECT * FROM t_node WHERE sequence='%s' AND project_name='%s' ''' % (sequence, project))
        for i, row in exsisted_nodes_df.iterrows():
            if (row.get("node_name") not in node_names): #需要删除节点
                n, l = row.get("node_name"), row.get("node_label")
                _db.delete_one('''DELETE FROM t_node WHERE node_name='%s' AND sequence='%s' AND project_name='%s' ''' % (row.get("node_name"), sequence, project))
                existed = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' AND project_name='%s' ''' % (row.get("node_name"), project))
                if len(existed) == 0:   #如果在关系库中不存在，即视为全局不存在，则在图数据库中删除
                    _gdb.delete_node(l, n)
                #删除该节点对应的边
                _db.delete_one('''DELETE FROM t_predicate WHERE from_node_name='%s' AND sequence='%s' AND project_name='%s' ''' % (row.get("node_name"), sequence, project))
                _db.delete_one('''DELETE FROM t_predicate WHERE to_node_name='%s' AND sequence='%s' AND project_name='%s' ''' % (row.get("node_name"), sequence, project))

        #处理新增节点
        for i, node in enumerate(nodes):
            exsisted_nodes_context_df = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' AND project_name='%s' ''' % (node.name, project))
            exsisted_nodes_seq_df = _db.df_query_sql('''SELECT * FROM t_node WHERE node_name='%s' AND sequence='%s' AND project_name='%s' ''' % (node.name, sequence, project))

            exsisted_nodes_context_gdf = _gdb.query_node(nodes[i].label, nodes[i].name)
            if len(exsisted_nodes_context_df) == 0 and exsisted_nodes_context_gdf is None: #全文没有该节点
                _gdb.create_node(nodes[i].label, nodes[i].name)
            if len(exsisted_nodes_seq_df) == 0: #语句没有该节点
                _db.create_one(
                    '''INSERT INTO t_node (node_name, node_label, sequence, article, project_name, project_id, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                    (nodes[i].name, nodes[i].label, nodes[i].sequence, nodes[i].article, nodes[i].project, project_id, datetime.now()))

        #处理删除边
        posted_edge = []
        for edge in edges:
            posted_edge.append({
                "name": edge.name,
                "from": edge.from_node_name,
                "to": edge.to_node_name
            })

        existed_edges_df = _db.df_query_sql('''SELECT * FROM t_predicate WHERE sequence='%s' AND project_name='%s' ''' % (sequence, project))
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
                    '''DELETE FROM t_predicate WHERE predicate_name='%s' AND sequence='%s' AND from_node_name='%s' AND to_node_name='%s' AND project_name='%s' ''' % (name, sequence, fnn, tnn, project))
                _gdb.delete_edge(name, fnn, fnl, tnn, tnl)

        #处理添加边
        for i, edge in enumerate(edges):
            name = edge.name
            fnn = edge.from_node_name
            fnl = edge.from_node_label
            tnn = edge.to_node_name
            tnl = edge.to_node_label


            existed_edges_context_df = _db.df_query_sql(
                '''SELECT * FROM t_predicate WHERE predicate_name='%s' AND from_node_name='%s' AND to_node_name='%s' AND project_name='%s' ''' % (name, fnn, tnn, project))

            # 判断是否为重复边=>跳过
            if len(existed_edges_context_df) >= 1:
                continue

            existed_edges_seq_df = _db.df_query_sql(
                '''SELECT * FROM t_predicate WHERE predicate_name='%s' AND sequence='%s' AND from_node_name='%s' AND to_node_name='%s' AND project_name='%s' ''' % (
                name, sequence, fnn, tnn, project))

            if len(existed_edges_seq_df) == 0:
                query = '''INSERT INTO t_predicate (predicate_name, sequence, from_node_name, from_node_label, to_node_name, to_node_label, article, project_name, project_id, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
                _db.create_one(query,
                               (edge.name, edge.sequence, edge.from_node_name, edge.from_node_label, edge.to_node_name,
                                edge.to_node_label, edge.article, project, project_id, datetime.now()))

            if len(existed_edges_context_df) == 0:
                _gdb.create_edge(name, fnn, fnl, tnn, tnl)



    except Exception as e:
        LOGGER.error(str(e))
        raise HTTPException(500, detail=str(e))
