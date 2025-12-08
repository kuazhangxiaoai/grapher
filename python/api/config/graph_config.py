# author: yanggang
# time: 2025/11/25
# Description: This file is designed for database configuration

class Graph_Config:
    # Graph database configuration including host, port, user, password, databasename
    def __init__(self):
        """
            initial function to define graph database link parameter
        """
        self.host = "localhost"
        self.port = 7687
        self.user = "neo4j"
        self.password = "12345678"
        self.databasename = "graph_db"

    def load(self, host, port, user, password, databasename):
        """
            :param host: host for database
            :param port: port for database
            :param user: username for database
            :param password: password for database
            :param databasename: database name for database
            :return:
        """
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.databasename = databasename


