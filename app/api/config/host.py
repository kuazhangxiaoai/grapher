# author: yanggang
# time: 2025/11/25
# Description: This file is designed for database configuration
import os
key = 'BISM'


class Host_Config:
    # Database configuration including host, port, user, password, databasename
    def __init__(self):
        """
            initial function to define database link parameter
        """
        self.port = os.environ.get('PUBLIC_PORT')
        self.host = os.environ.get('PUBLIC_HOST')



