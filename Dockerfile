FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update && \
    apt-get install -y xmacro wget nodejs \
    npm                     
RUN wget https://github.com/crusherdev/crusher-downloads/releases/download/v0.2/crusher-recorder.deb && \
    dpkg -i crusher-recorder.deb || true && \
    apt-get -yq -f install && \
    dpkg -i crusher-recorder.deb && \
    rm crusher-recorder.deb 
    
COPY . .

RUN npm install npm@latest -g && \
    npm install n -g && \
    n 14 && PATH="$PATH"
RUN npm install
CMD ["npx","ts-node","index.ts"]