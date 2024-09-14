import logging


class LoggerImpl:
    def __init__(self, logger_name):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(logging.DEBUG)
        self.handler = logging.StreamHandler()
        self.formatter = logging.Formatter(
            "%(levelname)s - %(asctime)s - %(name)s - %(message)s"
        )
        self.handler.setFormatter(self.formatter)
        self.logger.addHandler(self.handler)

    def get_logger(self):
        return self.logger

    def log(self, message):
        self.logger.info(message)

    def error(self, message):
        self.logger.error(message)
