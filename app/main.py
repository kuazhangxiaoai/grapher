import os
from sys import prefix

from starlette.staticfiles import StaticFiles
from app.api.utils.logger import LOGGER
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn
from pathlib import Path

from app.api.services import user
from app.api.services import graph
from app.api.services import text
from app.api.services import summary

os.environ['mode'] = 'development' if not os.environ.get('mode') else os.environ['mode']
LOGGER.info(f"This is {os.environ.get('mode')} environment")
#UploadDir = Path(os.environ['upload'])
app = FastAPI(title="grapher")

@app.on_event("startup")
async def startup_event():
    LOGGER.info("The Grapher begins")

@app.on_event("shutdown")
async def shutdown_event():
    LOGGER.info("The Grapher shutdown")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(user.router, prefix="/user")
app.include_router(graph.router, prefix="/graph")
app.include_router(text.router, prefix="/text")
app.include_router(summary.router, prefix="/summary")
try:
    UploadDir = Path(os.environ['upload'])
    app.mount("/assets", StaticFiles(directory=UploadDir), name='assets')
except Exception as e:
    LOGGER.info("This is not right environment")


if __name__ == '__main__':
    os.environ['mode'] = 'development'
    os.environ['PUBLIC_PORT'] = str(8088)
    os.environ['PUBLIC_HOST'] = '10.11.52.199'
    os.environ['PUBLIC_BASE_URL'] = '10.11.52.199'
    os.environ['upload'] = "/media/yanggang/847C02507C023D84/python_workspace/grapher/assets"
    # os.environ['upload'] = "/media/yanggang/847C02507C023D84/python_workspace/grapher/assets"
    UploadDir = Path(os.environ['upload'])
    UploadDir.mkdir(exist_ok=True)
    app.mount("/assets", StaticFiles(directory=UploadDir), name='assets')
    uvicorn.run(app, host="0.0.0.0", port=8088)

