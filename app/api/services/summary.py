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
    name: str = Field(..., description="节点名称")
    label: str = Field(..., description="节点标签")
    group: str = Field(..., description="文章组名称")
    project: str = Field(..., description="项目名称")

class Edge(BaseModel):
    """
        边类
        :param:
    """
    name: str = Field(..., description="关系名称")
    from_node_label: str = Field(..., description="源节点标签")
    from_node_name: str = Field(..., description="源节点名称")
    to_node_label: str = Field(..., description="目的节点标签")
    to_node_name: str = Field(..., description="目的节点名称")
    group: str = Field(..., description="组名称")
    project: str = Field(..., description="项目名称")

class NodeType(BaseModel):
    name: str = Field(..., description="节点类型名称")
    color: str = Field(..., description="节点类型颜色")
    project: str = Field(..., description="项目名称")

class Commity(BaseModel):
    group: str = Field(..., description="组名称")
    nodes: List[Node] = Field(..., description="节点列表")
    edges: List[Edge] = Field(..., description="关系列表")

class Group(BaseModel):
    name: str = Field(..., description="组名称")
    articles: List[str] = Field(..., description="文章标题列表")
    project: str = Field(..., description="项目名称")

@router.post("/createGroup")
async def create_group(group: Group):
    """
    创建分组，用于总结模块
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        articles = group.articles
        project = group.project
        group_name = group.name
        query = '''SELECT * FROM t_group_summary WHERE group_name='%s' AND project_name='%s' ''' % (group_name, project)
        existed_df = _db.df_query_sql(query)
        if len(existed_df) > 0:
            return -1
        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()
        for article in articles:
            query = '''INSERT INTO t_group_summary (group_name, article, project_name, project_id, create_time) VALUES (%s, %s, %s, %s, %s)'''
            _db.create_one(query, (group_name, article, project, project_id, datetime.now()))

        return 1

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/getArticlesFromGroup")
async def get_articles_from_group(group:str=Query(..., description="组名称"), project: str=Query(..., description="项目名称")):
    """
        获取文章组对应的文章标题列表
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT * FROM t_group_summary WHERE group_name='%s' AND project_name='%s' ''' % (group, project)
        group_df = _db.df_query_sql(query)
        articles = []
        for i, row in group_df.iterrows():
            articles.append(row.get("article"))

        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/getGroupsFromArticle")
async def get_articles_from_group(article: str = Query(..., description="文章标题"),
                                  project: str = Query(..., description="项目名称")):
    """
        获取文章对应的组名称列表
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT * FROM t_group_summary WHERE article='%s' AND project_name='%s' ''' % (article, project)
        aritcle_df = _db.df_query_sql(query)
        groups = []
        for i, row in aritcle_df.iterrows():
            groups.append(row.get("group_name"))

        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/getGraphFromGroup")
async def get_graph_from_group(group: str=Query(..., description="组名称"), project: str=Query(..., description="项目名称")):
    """
        获取文章组对应的图谱
    """
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)

        query = '''SELECT * FROM t_node_summary WHERE group_name='%s' AND project_name='%s' ''' % (group, project)
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
                    "group_name": row.get("group_name"),
                    "create_time": row.get("create_time"),
                    "color": color_df.loc[0, "node_type_color"]
                })
                node_names.append(row.get("node_name"))

        query = '''SELECT * FROM t_predicate_summary WHERE group_name='%s' AND project_name='%s' ''' % (group, project)
        edges_df = _db.df_query_sql(query)
        edges, edge_names = [], []
        for i, row in edges_df.iterrows():
            edges.append({
                "name": row.get("predicate_name"),
                "from_node_name": row.get("from_node_name"),
                "from_node_label": row.get("from_node_label"),
                "to_node_name": row.get("to_node_name"),
                "to_node_label": row.get("to_node_label"),
                "create_time": row.get("create_time")
            })

        graph = {
            "group": group,
            "nodes": nodes,
            "edges": edges
        }
        return graph
    except Exception as e:
        return e

@router.post("/commit")
async def commit(commit: Commity):
    """
        提交文章组对应的图谱
    """
    try:
        nodes = commit.nodes
        edges = commit.edges
        if len(nodes) == 0:
            raise HTTPException(501, detail="Cannot commit empty data.")
        project = nodes[0].project
        group = nodes[0].group
        graph_db_config = Graph_Config()
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        graph_db, host, port, username, password = get_project_info(project)
        graph_db_config.load(host, port, username, password, graph_db)

        query = '''SELECT project_id FROM t_project WHERE project_name='%s' ''' % project
        project_id_df = _db.df_query_sql(query)
        project_id = project_id_df.loc[0, 'project_id'].item()

        query = '''DELETE FROM t_predicate_summary WHERE project_name='%s' AND group_name='%s' ''' % (project, group)
        _db.delete_one(query)
        query = '''DELETE FROM t_node_summary WHERE project_name='%s' AND group_name='%s' ''' % (project, group)
        _db.delete_one(query)

        #组对应的节点和边
        for i, edge in enumerate(edges):
            query = '''INSERT INTO t_predicate_summary (predicate_name, from_node_name, from_node_label, to_node_name, to_node_label, group_name, project_name, project_id, create_time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
            _db.create_one(query,
                   (edge.name, edge.from_node_name, edge.from_node_label, edge.to_node_name,
                    edge.to_node_label, group, project, project_id, datetime.now()))

        for i, node in enumerate(nodes):
            query = '''INSERT INTO t_node_summary (node_name, node_label, group_name, create_time, project_name, project_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
            _db.create_one(query,
                   (node.name, node.label, group, node.project, project_id, datetime.now()))

    except Exception as e:
        LOGGER.error(str(e))
        raise HTTPException(500, detail=str(e))

