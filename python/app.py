import os
from api.utils.logger import LOGGER
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn
import json
from api.services import user
from api.services import graph


if __name__ == '__main__':
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

    uvicorn.run(app, host="0.0.0.0", port=8088)

