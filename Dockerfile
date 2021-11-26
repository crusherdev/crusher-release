FROM dorowu/ubuntu-desktop-lxde-vnc

WORKDIR /app
RUN apt-get update
RUN apt-get install -y wget
RUN wget https://github.com/crusherdev/crusher-downloads/releases/latest/download/crusher-recorder.deb
RUN dpkg -i crusher-recorder.deb || true
RUN apt-get -yq -f install
RUN dpkg -i crusher-recorder.deb
COPY . .
RUN apt-get install node

RUN npm install

CMD ["ts-node","index.ts"]