# logger.py
from loguru import logger
import sys
from pathlib import Path

# 创建日志目录
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

logger.remove()

logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
           "<level>{level}</level> | "
           "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
           "<level>{message}</level>",
    level="INFO",
)

logger.add(
    LOG_DIR / "app_{time:YYYY-MM-DD}.log",
    rotation="1 day",         # 每天生成一个新日志
    retention="7 days",       # 仅保留 7 天日志
    encoding="utf-8",
    enqueue=True,             # 多线程/多进程安全写入
    backtrace=True,           # 出错时显示完整堆栈
    diagnose=True,            # 显示变量值（调试时非常有用）
    level="DEBUG",
)

# 导出 logger 方便导入
LOGGER = logger
