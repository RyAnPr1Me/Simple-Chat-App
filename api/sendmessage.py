import os
import json
from http.server import BaseHTTPRequestHandler
from pusher import Pusher
from pusher.errors import PusherBadRequest, PusherServerError

# --- Load Pusher Credentials ---
pusher_app_id = os.getenv('PUSHER_APP_ID')
pusher_key = os.getenv('PUSHER_KEY')
pusher_secret = os.getenv('PUSHER_SECRET')
pusher_cluster = os.getenv('PUSHER_CLUSTER')

if not all([pusher_app_id, pusher_key, pusher_secret, pusher_cluster]):
    raise ValueError("Missing required Pusher environment variables.")

# --- Initialize Pusher Client ---
pusher_client = Pusher(
    app_id=pusher_app_id,
    key=pusher_key,
    secret=pusher_secret,
    cluster=pusher_cluster,
    ssl=True
)

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        """Helper to set common response headers with CORS enabled."""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # Read request length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length <= 0:
                raise ValueError("Invalid Content-Length")

            # Read request body
            post_data = self.rfile.read(content_length)

            # Parse JSON
            data = json.loads(post_data.decode('utf-8'))
            username = data.get('username')
            encrypted_message = data.get('message')

            if not username or not encrypted_message:
                raise ValueError("Missing required fields: username or message.")

            # Send to Pusher
            try:
                pusher_client.trigger('global-chat', 'chat-message', {
                    'username': username,
                    'message': encrypted_message
                })
            except (PusherBadRequest, PusherServerError) as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': f'Pusher error: {str(e)}'}).encode('utf-8'))
                return

            # Success Response
            self._set_headers(200)
            self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))

        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': 'Invalid JSON format'}).encode('utf-8'))

        except ValueError as ve:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': str(ve)}).encode('utf-8'))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': f'Internal server error: {str(e)}'}).encode('utf-8'))

    def do_OPTIONS(self):
        self._set_headers(200)
