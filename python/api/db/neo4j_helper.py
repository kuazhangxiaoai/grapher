import pandas as pd
from py2neo import Graph, Node

class Neo4jHelper:
    def __init__(self, host, user, passwd, database, port):
        self.host = host
        self.user = user
        self.password = passwd
        self.database = database
        self.port = port
        self.graph = Graph("http://" + host + ":"+ port,
                                auth=(self.user, self.password),
                                database=self.database)

    # 执行查询node，返回node
    def query_node(self, node_label, node_name):
        query = '''MATCH (n:%s{name: "%s"})''' % (node_label, node_name)
        nodes = self.graph.run(query)
        return nodes

    # 创建node, 返回node
    def create_node(self, node_label, node_name):
        node = Node(node_label, name=node_name)
        self.graph.create(node)
        return node

    def delete_node(self, node_label, node_name):
        self.graph.nodes.match(node_label, name=node_name)

        # 插入一条数据
    def create_one(self, sql, params):
        with self.connection.connect() as conn:
            execute = conn.exec_driver_sql(sql, params)
            conn.commit()
        execute.close()

        # 修改
    def updateById(self, sql, params):
        with self.connection.connect() as conn:
            execute = conn.exec_driver_sql(sql, params)
            conn.commit()
        execute.close()