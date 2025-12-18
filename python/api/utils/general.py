from python.api.db.postgre_helper import PostgreHelper
from python.api.config.db_config import DB_Config

def get_project_info(project_name: str):
    try:
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        query = '''SELECT 
                    tp.project_name as project_name,
                    tg.username as username,
                    tp.graph_db as graph_db_name,
                    tg.password as password,
                    tg.host as host,
                    tg.port as port
                        FROM t_project tp 
                        LEFT JOIN t_graph_db tg ON tp.project_name=tg.project_name 
                        WHERE tp.project_name='%s' ''' % project_name
        project_df = _db.df_query_sql(query)
        username, graph_db = project_df.loc[0, 'username'], project_df.loc[0, 'graph_db_name']
        password, host, port = project_df.loc[0, 'password'], project_df.loc[0, 'host'], project_df.loc[0, 'port']

        return graph_db, host, port, username, password

    except Exception as e:
        return None, None, None, None, None