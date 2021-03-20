FROM node:15-alpine as BUILD

RUN apk update && apk add curl bash
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/website
COPY . .
RUN yarn install --pure-lockfile --ignore-engines
RUN yarn run build
RUN npm prune --production
RUN /usr/local/bin/node-prune


FROM node:15-alpine
EXPOSE 6635

COPY --from=BUILD /usr/website/dist ./dist
COPY --from=BUILD /usr/website/node_modules ./node_modules
COPY --from=BUILD /usr/website/views ./views
COPY --from=BUILD /usr/website/public ./public
COPY --from=BUILD /usr/website/.env ./.env

CMD ["node", "./dist/index.js"]