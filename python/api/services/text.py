import shutil

from distributed import UploadFile

from python.api.utils.logger import LOGGER
from python.api.config.db_config import DB_Config
from python.api.config.graph_config import Graph_Config
from python.api.db.postgre_helper import PostgreHelper
from python.api.db.neo4j_helper import Neo4jHelper
from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
from pathlib import Path

UploadDir = Path("../../assets")
UploadDir.mkdir(exist_ok=True)
router = APIRouter()

@router.get("/test")
async def test():
    return "hello"

@router.get("/upload")
async def upload(file: UploadFile=File(...)):
    try:
        ext = Path(file.filename).suffix.lower()
        assert ext in [".docx", ".txt", ".odt", ".doc"]
        savepath = UploadDir / file.name
        with open(savepath, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        return True

    except Exception as e:
        return e




