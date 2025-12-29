import pandas as pd
from sqlalchemy import create_engine

class PostgreHelper:
    def __init__(self, host, user, passwd, database, port):
        self.host = host
        self.user = user
        self.password = passwd
        self.database = database
        self.port = port

        self.connection = create_engine(
            f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}",
            max_overflow=0,
            pool_size=3,
            pool_timeout=30,
            pool_recycle=3600
        )

    def disconnect(self,):
        self.connection.dispose()

    # 执行查询sql，返回df
    def df_query_sql(self, sql):
        df = pd.read_sql(sql, self.connection)
        return df

    # df批量写入数据
    def df_write_table(self, table, data):
        pd.io.sql.to_sql(data, table, self.connection, schema=self.database, if_exists=self.write_mode,
                            index=False)
        print("write into postgresql finish")

    def delete_one(self, sql):
        with self.connection.connect() as conn:
            execute = conn.exec_driver_sql(sql)
            conn.commit()
        execute.close()

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