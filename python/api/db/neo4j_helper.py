from numba.cuda.cudadrv.driver import driver
from python.api.config.graph_config import Graph_Config
from neo4j import GraphDatabase

class Neo4jHelper:
    def __init__(self, host, user, passwd, database, port):
        self.host = host
        self.user = user
        self.password = passwd
        self.database = database
        self.port = port
        self.driver = GraphDatabase.driver(f"neo4j://{host}:{port}", auth=(self.user, self.password), database=self.database)

    # 执行查询node，返回node 函数
    def query_node_function(self, tx, node_label, node_name):
        cypher = f"""
            MATCH (n:{node_label} {{name: $node_name}})
            RETURN n
            """
        re = tx.run(cypher, node_name=node_name)
        record = re.single()
        if record:
            return record["n"]
        else:
            return None

    # 执行查询node，返回node 执行
    def query_node(self, node_label, node_name):
        with self.driver.session() as session:
            n = session.execute_read(self.query_node_function, node_label, node_name)
        return n

    # 创建edge, 返回edge => 函数
    def create_edge_function(self, tx, edge_name, from_node_name, from_node_label, to_node_name, to_node_label):
        cypher = f"""
            MATCH (a:{from_node_label} {{name: $from_node_name}})
            MATCH (b:{to_node_label} {{name: $to_node_name}})
            CREATE (a)-[r:{edge_name}]->(b)
            RETURN r
            """
        re = tx.run(cypher, from_node_name=from_node_name, to_node_name=to_node_name)
        return re.single()["r"]

    # 创建edge, 返回edge => 执行
    def create_edge(self, edge_name, from_node_name, from_node_label, to_node_name, to_node_label):
        with self.driver.session() as session:
            rel = session.execute_write(
                self.create_edge_function,
                edge_name, from_node_name, from_node_label, to_node_name, to_node_label
            )
            return rel

    #删除edge, => 函数
    def delete_edge_function(self, tx, edge_name, from_node_name, from_node_label, to_node_name, to_node_label):
        cypher = f"""
                    MATCH (a:{from_node_label} {{name: $from_node_name}})-[r:{edge_name}]->(b:{to_node_label} {{name: $to_node_name}})
                    DELETE r
                    """
        tx.run(cypher, from_node_name, to_node_name)

    # 删除edge, => 执行
    def delete_edge(self, edge_name, from_node_name, from_node_label, to_node_name, to_node_label):
        with self.driver.session() as session:
            session.execute_write(
                self.delete_edge_function,
                edge_name, from_node_name, from_node_label, to_node_name, to_node_label
            )

    # 创建node, 返回node 函数
    def create_node_function(self, tx, node_label, props):
        cypher = f"CREATE (n:{node_label} $props) RETURN n"
        re = tx.run(cypher, props=props)
        return re.single()["n"]

    # 创建node, 返回node => 执行
    def create_node(self, node_label, node_name):
        with self.driver.session() as session:
            node = session.execute_write(
                self.create_node_function,
                node_label=node_label,
                props={"name": node_name}
            )
            return node

    # 删除node 函数
    def delete_node_function(self, tx, node_label, node_name):
        cypher = f"""
            MATCH (n:{node_label} {{name: $node_name}})
            DETACH DELETE n
        """
        tx.run(cypher, node_name=node_name)

    # 删除node 执行
    def delete_node(self, node_label, node_name):
        with self.driver.session() as session:
            session.execute_write(self.delete_node_function, node_label, node_name)


    # 修改节点 函数
    def update_node_function(self, tx, old_node_label, old_node_name, new_node_label, new_node_name):
        cypher = f"""
                    MATCH (n:{old_node_label} {{name: $old_node_name}})
                    REMOVE n:{old_node_label}
                    SET n:{new_node_label},
                        n.name=$new_node_name
                    RETURN n
                """
        re = tx.run(cypher, old_node_name=old_node_name, new_node_name=new_node_name)
        return re.single()["n"]

    # 修改节点 执行
    def update_node(self, old_node_label, old_node_name,new_node_label, new_node_name):
        with self.driver.session() as session:
            n = session.execute_write(self.update_node_function,old_node_label, old_node_name, new_node_label, new_node_name)

        return n

    def clear_function(self, tx):
        cypher = f"""
            MATCH (n) DETACH DELETE n
        """
        tx.run(cypher)

    def clear(self):
        with self.driver.session() as session:
            session.execute_write(self.clear_function)



#if __name__ == '__main__':
    #_gdb = Neo4jHelper(Graph_Config().host,
    #                   Graph_Config().user,
    #                   Graph_Config().password,
    #                   Graph_Config().databasename,
    #                   Graph_Config().port)
    #_gdb.create_node("Person", "Bob")
    #_gdb.delete_node("Person", "Alice")
    #_gdb.update_node("Person", "Bob", "Coder", "Tom")
    #_gdb.create_edge("brothered", "Tom", "Coder", "Alice", "Person")