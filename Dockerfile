FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y wget nodejs \
    npm                     
RUN wget https://github.com/crusherdev/crusher-downloads/releases/download/v0.2/crusher-recorder.deb && \
    dpkg -i crusher-recorder.deb || true && \
    apt-get -yq -f install && \
    dpkg -i crusher-recorder.deb && \
    rm crusher-recorder.deb 
    
COPY . .

RUN node -v
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  && \
    nvm use 14
RUN node -v
RUN npm install

CMD ["npx","ts-node","index.ts"]