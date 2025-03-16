import os
import json
from http.server import BaseHTTPRequestHandler
from pusher import Pusher
from pusher.errors import PusherBadRequest

# --- Environment Variables (from Vercel) ---
pusher_app_id = os.environ.get('PUSHER_APP_ID')
pusher_key = os.environ.get('PUSHER_KEY')
pusher_secret = os.environ.get('PUSHER_SECRET')
pusher_cluster = os.environ.get('PUSHER_CLUSTER')

if not all([pusher_app_id, pusher_key, pusher_secret, pusher_cluster]):
    raise ValueError("Missing Pusher environment variables.")

# --- Pusher Client ---
pusher_client = Pusher(
    app_id=pusher_app_id,
    key=pusher_key,
    secret=pusher_secret,
    cluster=pusher_cluster,
    ssl=True
)

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        """Helper to set HTTP response headers including CORS."""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode('utf-8'))
            username = data.get('username')
            encrypted_message = data.get('message')

            if not username or not encrypted_message:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Username and message are required'}).encode('utf-8'))
                return

            # --- Trigger Pusher Event ---
            pusher_client.trigger('global-chat', 'chat-message', {'username': username, 'message': encrypted_message})

            self._set_headers(200)
            self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))

        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
        except PusherBadRequest as e:
            self._set_headers(400)
            self.wfile.write(json.dumps({'error': f'Pusher error: {str(e)}'}).encode('utf-8'))
        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': f'Server error: {str(e)}'}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

