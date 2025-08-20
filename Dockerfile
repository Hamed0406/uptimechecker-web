FROM nginx:1.27-alpine

# Copy static files
COPY web/ /usr/share/nginx/html/

# Nginx config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Runtime config generator
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
