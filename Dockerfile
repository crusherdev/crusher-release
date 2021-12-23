FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update && \
    apt-get install -y xmacro recordmydesktop wget nodejs \
    npm
RUN wget https://github.com/crusherdev/crusher-release/releases/download/v1.0.9.beta-0/crusher-electron-app_1.0.9_amd64.deb && \
    dpkg -i crusher-electron-app_1.0.9_amd64.deb || true && \
    apt-get -yq -f install && \
    dpkg -i crusher-electron-app_1.0.9_amd64.deb && \
    rm crusher-electron-app_1.0.9_amd64.deb

RUN npm install npm@latest -g && \
    npm install n -g && \
    n 14 && PATH="$PATH"


COPY . .

RUN npm i
RUN npx prisma generate

ENV OPENBOX_ARGS "--startup 'npx ts-node /root/index.ts'"
ENV DISPLAY ":1"
