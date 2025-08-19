FROM nginx:alpine

# Static files
COPY web/ /usr/share/nginx/html/

# Config writer
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Simple security headers & gzip via default nginx (optional to tweak)
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
