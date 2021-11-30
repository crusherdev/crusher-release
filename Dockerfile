FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y wget nodejs \
    npm                       # note this one
RUN wget https://github.com/crusherdev/crusher-downloads/releases/download/v0.2/crusher-recorder.deb
RUN dpkg -i crusher-recorder.deb || true
RUN apt-get -yq -f install
RUN dpkg -i crusher-recorder.deb
RUN rm crusher-recorder.deb

COPY . .
RUN node -v
RUN npm -g install nvm
RUN nvm use 14
RUN node -v
RUN npm install

CMD ["npx","ts-node","index.ts"]