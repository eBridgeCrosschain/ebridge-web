FROM node:20.2.0

ARG web=/opt/workspace/aelf-bridge-frontend

WORKDIR ${web}

COPY . ${web}

RUN yarn \
    && yarn build

ENTRYPOINT yarn start

EXPOSE 3000
