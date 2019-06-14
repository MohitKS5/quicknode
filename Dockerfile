# Taken from documentation of puppeteer
FROM buildkite/puppeteer

RUN npm install -g nodemon
RUN mkdir -p /app/server
WORKDIR /app/server
COPY package.json /app/server/
RUN yarn install
copy ./src /app/server/src