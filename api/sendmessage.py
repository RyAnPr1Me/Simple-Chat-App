import json
import logging
from http.server import BaseHTTPRequestHandler
from pusher import Pusher
from pusher.errors import PusherBadRequest, PusherServerError
from socket import timeout

# --- Pusher Credentials ---
pusher_app_id = "1958651"
pusher_key = "df5bb9092afe8e53d9b4"
pusher_secret = "7f144a3663d71df28611"
pusher_cluster = "us2"

# --- Initialize Pusher Client ---
pusher_client = Pusher(
    app_id=pusher_app_id,
    key=pusher_key,
    secret=pusher_secret,
    cluster=pusher_cluster,
    ssl=True
)

# --- Setup logging ---
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        """Helper to set common response headers with CORS enabled."""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _send_error_response(self, code, message, details=None):
        """Helper to send error response with a specific code."""
        logger.error(f"Error {code}: {message}")
        response = {'error': message}
        if details:
            response['details'] = details
        self._set_headers(code)
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def _send_success_response(self, data):
        """Helper to send success response."""
        self._set_headers(200)
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_POST(self):
        """Handle POST request to send message to Pusher."""
        try:
            # Validate Content-Type
            if self.headers.get('Content-Type') != 'application/json':
                self._send_error_response(415, 'Content-Type must be application/json')
                return

            # Read request length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length <= 0:
                raise ValueError("Invalid Content-Length")

            # Read request body
            post_data = self.rfile.read(content_length)

            # Parse JSON
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self._send_error_response(400, 'Invalid JSON format', str(e))
                return

            username = data.get('username')
            encrypted_message = data.get('message')

            # Input Validation
            if not username or not encrypted_message:
                self._send_error_response(400, 'Missing required fields: username or message')
                return

            if len(username) < 1 or len(encrypted_message) < 1:
                self._send_error_response(400, 'Username and message must be non-empty')
                return

            # Send to Pusher
            try:
                logger.info(f"Sending message to Pusher: {username}: {encrypted_message}")
                pusher_client.trigger('global-chat', 'chat-message', {
                    'username': username,
                    'message': encrypted_message
                })
                logger.info(f"Message successfully sent to Pusher: {username}: {encrypted_message}")
            except (PusherBadRequest, PusherServerError) as e:
                self._send_error_response(500, 'Pusher error occurred', str(e))
                return
            except timeout as e:
                self._send_error_response(504, 'Pusher request timeout', str(e))
                return

            # Success Response
            self._send_success_response({'status': 'success', 'message': 'Message sent to Pusher'})

        except ValueError as ve:
            self._send_error_response(400, 'Invalid request data', str(ve))
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            self._send_error_response(500, 'Internal server error', str(e))

    def do_OPTIONS(self):
        """Handle OPTIONS request for CORS pre-flight."""
        self._set_headers(200)

