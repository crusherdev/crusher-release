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

RUN node -v && \
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
    source ~/.bashrc && \
    nvm use 14 && \
    node -v
RUN npm install

CMD ["npx","ts-node","index.ts"]