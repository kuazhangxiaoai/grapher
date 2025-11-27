from api.utils.logger import LOGGER
from api.config.db_config import key, DB_Config
from api.db.postgre_helper import PostgreHelper
from fastapi import APIRouter
from pydantic import BaseModel
import uuid
router = APIRouter()

class User(BaseModel):
    username: str
    password: str

@router.get("/test")
async def test():
    return "hello"

@router.post("/login")
async def login(user: User):
    query = '''
        SELECT * FROM t_user WHERE username='%s' AND pgp_sym_decrypt(password::bytea, '%s')='%s'
    ''' % (user.username, key, user.password)

    _db = PostgreHelper(DB_Config().host,
                        DB_Config().user,
                        DB_Config().password,
                        DB_Config().databasename,
                        DB_Config().port)
    ok = _db.df_query_sql(query)
    if len(ok) == 1:
        return True
    else:
        return False

@router.post("/regist")
async def apply(user:User):
    try:
        query = '''
            INSERT INTO t_user (id, username, password) VALUES ('%s', '%s', pgp_sym_encrypt('%s', '%s'))
        '''
        _db = PostgreHelper(DB_Config().host,
                            DB_Config().user,
                            DB_Config().password,
                            DB_Config().databasename,
                            DB_Config().port)
        _db.create_one(query, (uuid.uuid4(), user.username, user.password, key))
        return True
    except Exception as e:
        return e

