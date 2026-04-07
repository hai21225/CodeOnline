# Base image Node mới
FROM node:20-bookworm

# Cài git nếu cần
RUN apt-get update && apt-get install -y curl gnupg git \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://www.ucw.cz/isolate/debian/signing-key.asc -o /etc/apt/keyrings/isolate.asc \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/isolate.asc] http://www.ucw.cz/isolate/debian/ bookworm-isolate main" \
        > /etc/apt/sources.list.d/isolate.list \
    && apt-get update \
    && apt-get install -y isolate \
    && rm -rf /var/lib/apt/lists/*

# Thư mục làm việc trong container
WORKDIR /piston

# Copy toàn bộ repo gốc vào /piston
COPY piston/ ./

# Cài dependencies cho CLI
RUN npm install --prefix cli

# Nếu cần cài dependencies API chính (package.json trong piston)
RUN npm install --prefix api

EXPOSE 2000

# CMD chạy API
CMD ["node","api/src/index.js"]
