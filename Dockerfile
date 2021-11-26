FROM dorowu/ubuntu-desktop-lxde-vnc

RUN apt-get update
RUN apt-get install -y wget
RUN wget https://github.com/crusherdev/crusher-downloads/releases/latest/download/crusher-recorder.deb
RUN dpkg -i crusher-recorder.deb || true
RUN apt-get -yq -f install
RUN dpkg -i crusher-recorder.deb
RUN apt-get install node

ADD ./run.sh /run.sh
CMD ["/run.sh"]