import os
from api.utils.logger import LOGGER
from fastapi import FastAPI
import uvicorn
import json

if __name__ == '__main__':
    app = FastAPI(title="grapher")

    @app.on_event("startup")
    async def startup_event():
        LOGGER.info("The Grapher begins")

    @app.on_event("shutdown")
    async def shutdown_event():
        LOGGER.info("The Grapher shutdown")


    uvicorn.run(app, host="0.0.0.0", port=8088)

