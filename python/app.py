import os
from api.utils.logger import LOGGER
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn
import json
from python.api.services import user


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

    uvicorn.run(app, host="0.0.0.0", port=8088)

