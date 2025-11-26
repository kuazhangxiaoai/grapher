# author: yanggang
# time: 2025/11/25
# Description: This file is designed for database configuration

class DB_Config:
    # Database configuration including host, port, user, password, databasename
    def __init__(self):
        """
            initial function to define database link parameter
        """
        self.host = "localhost"
        self.port = 6432
        self.user = "postgres"
        self.password = "ZGCATT"
        self.databasename = "grapher_db"

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


