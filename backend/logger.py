import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path

def setup_logging():
    """Configure logging for the application"""
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Main logger configuration
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    
    # Log format
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler (rotating logs)
    file_handler = RotatingFileHandler(
        log_dir / 'app.log',
        maxBytes=1024*1024,  # 1MB per file
        backupCount=5,       # Keep 5 backup logs
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Initialize logger
logger = setup_logging()