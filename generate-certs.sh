#!/bin/bash

# Generate SSL certificates for development
mkdir -p certs

if [ ! -f certs/server.key ] || [ ! -f certs/server.crt ]; then
    echo "Generating self-signed SSL certificates for development..."
    openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "✅ SSL certificates generated successfully!"
else
    echo "SSL certificates already exist."
fi
