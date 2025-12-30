import os
from starlette.staticfiles import StaticFiles
from app.api.utils.logger import LOGGER
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn

from app.api.services import user
from app.api.services import graph
from app.api.services import text
from app.api.services.text import UploadDir

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

app.mount("/assets", StaticFiles(directory=UploadDir), name='assets')

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8088)

