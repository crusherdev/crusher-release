FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y xmacro wget nodejs \
    npm                     
RUN wget https://github.com/crusherdev/crusher-downloads/releases/download/v0.2/crusher-recorder.deb && \
    dpkg -i crusher-recorder.deb || true && \
    apt-get -yq -f install && \
    dpkg -i crusher-recorder.deb && \
    rm crusher-recorder.deb 
    
COPY . .

RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
    export NVM_DIR="$HOME/.nvm" && \ 
    . "$NVM_DIR/nvm.sh" && \
    nvm install 14 && \
    nvm use 14 && \
    nvm alias default 14 && \
    npm install
    
CMD ["npx","ts-node","index.ts"]