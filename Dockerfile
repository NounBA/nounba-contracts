FROM mcr.microsoft.com/vscode/devcontainers/python:0-3.7-bullseye
# FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-14

# Update all Ubuntu Packages
RUN apt-get update && apt-get upgrade -y

# Install all apt-get packages
RUN apt-get install -y curl \
    python3-pip

USER vscode

#Install rust
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y

RUN curl -L https://foundry.paradigm.xyz | bash

RUN $HOME/.foundry/bin/foundryup
