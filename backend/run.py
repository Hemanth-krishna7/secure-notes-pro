import os
from app import create_app

# Fetch environment name, fallback to 'development'
env_name = os.getenv('FLASK_ENV', 'development')
app = create_app(env_name)

if __name__ == '__main__':
    # Run the application (host '0.0.0.0' to allow connections, port 5000)
    app.run(host='0.0.0.0', port=5000)
