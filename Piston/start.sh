#!/bin/bash
set -e

# Chạy API ở background
node /piston/index.js api &

# Đợi API khởi động
echo "Waiting for Piston API to start..."
sleep 5

# Cài các ngôn ngữ bằng CLI
node /piston/cli/index.js ppman install python
node /piston/cli/index.js ppman install gpp
node /piston/cli/index.js ppman install gcc
node /piston/cli/index.js ppman install mono
node /piston/cli/index.js ppman install java
node /piston/cli/index.js ppman install rust

# Giữ container chạy
wait